import React, { useState, useRef, useContext } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { AppContext } from '../context/AppContext';
import { X, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function VTOPSyncScreen() {
  const { currentUser, authToken, API_URL } = useContext(AppContext);
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleNavigationStateChange = (navState) => {
    console.log("VTOP WebView Navigated to:", navState.url);
    if (navState.url.includes('/vtop/content')) {
       const grabHtmlJS = `
          (async function scrapeVTOP() {
              if (document.getElementById('vtopLoginForm')) return;
              if (window.location.href.indexOf('/vtop/content') === -1) return;
              
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCRAPE_START' }));
              
              try {
                  // VTOP STRICTLY validates registration numbers with uppercase!
                  const regNo = "${currentUser.registration_number}".toUpperCase();
                  
                  // In VTOP, csrf might also be tracked in meta tags or specific hidden fields
                  let csrf = document.querySelector('input[name="_csrf"]')?.value || '';
                  if (!csrf) csrf = document.querySelector('meta[name="_csrf"]')?.content || '';
                  // Also look inside all forms
                  if (!csrf) {
                      const forms = document.querySelectorAll('form');
                      for (let f of forms) {
                          const input = f.querySelector('input[name="_csrf"]');
                          if (input) { csrf = input.value; break; }
                      }
                  }
                  
                  const payload = { timetables: {}, attendance: {} };
                  
                  // 1. Fetch Semesters from TimeTable Dashboard
                  const ttInitRes = await fetch('https://vtop.vitbhopal.ac.in/vtop/academics/common/StudentTimeTable', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                          'X-Requested-With': 'XMLHttpRequest'
                      },
                      body: 'verifyMenu=true&authorizedID=' + encodeURIComponent(regNo) + '&_csrf=' + encodeURIComponent(csrf) + '&nocache=@(' + new Date().getTime() + ')'
                  });
                  const ttHtml = await ttInitRes.text();
                  
                  const semesters = [];
                  const selectRegex = /<select.*?id="semesterSubId".*?>(.*?)<\\/select>/s;
                  const selectMatch = ttHtml.match(selectRegex);
                  if (selectMatch) {
                      const optionsRegex = /<option value="([^"]+)">(.*?)<\\/option>/g;
                      let optionMatch;
                      while ((optionMatch = optionsRegex.exec(selectMatch[1])) !== null) {
                          if (optionMatch[1]) semesters.push(optionMatch[1]);
                      }
                  }

                  // 2. Fetch Timetable for each semester
                  for (let sem of semesters) {
                      const bodyTT = '_csrf=' + encodeURIComponent(csrf) + 
                                   '&semesterSubId=' + encodeURIComponent(sem) + 
                                   '&authorizedID=' + encodeURIComponent(regNo) + 
                                   '&x=' + encodeURIComponent(new Date().toUTCString());
                      const resTT = await fetch('https://vtop.vitbhopal.ac.in/vtop/processViewTimeTable', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: bodyTT
                      });
                      payload.timetables[sem] = await resTT.text();
                  }

                  // 3. Fetch Attendance Dashboard to initialize container
                  await fetch('https://vtop.vitbhopal.ac.in/vtop/examinations/StudentAttendance', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                          'X-Requested-With': 'XMLHttpRequest'
                      },
                      body: 'verifyMenu=true&authorizedID=' + encodeURIComponent(regNo) + '&_csrf=' + encodeURIComponent(csrf) + '&nocache=@(' + new Date().getTime() + ')'
                  });
                  
                  // 4. Fetch Attendance for each semester
                  for (let sem of semesters) {
                      const bodyAtt = '_csrf=' + encodeURIComponent(csrf) + 
                                   '&semesterSubId=' + encodeURIComponent(sem) + 
                                   '&authorizedID=' + encodeURIComponent(regNo) + 
                                   '&x=' + encodeURIComponent(new Date().toUTCString());
                      const resAtt = await fetch('https://vtop.vitbhopal.ac.in/vtop/processViewStudentAttendance', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                          body: bodyAtt
                      });
                      payload.attendance[sem] = await resAtt.text();
                  }

                  window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'LOGIN_SUCCESS',
                      payload: payload
                  }));
              } catch (err) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'LOGIN_SUCCESS',
                      error: err.message
                  }));
              }
          })();
          true;
       `;
       if (webviewRef.current && !isSyncing && !syncSuccess) {
          webviewRef.current.injectJavaScript(grabHtmlJS);
       }
    }
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'SCRAPE_START') {
          setIsSyncing(true);
          return;
      }
      
      if (data.type === 'LOGIN_SUCCESS') {
         if (data.error) {
             Alert.alert("Sync Error", data.error);
             setIsSyncing(false);
             return;
         }
         setIsSyncing(true);
         
         const payload = data.payload;
         const numTT = Object.keys(payload.timetables || {}).length;
         console.log(`VTOP Scraping Done! Sending ${numTT} semesters of scraped XML back to server.`);
         
         const res = await fetch(`${API_URL}/schedules/sync-vtop`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ payload: payload })
         });
         
         if (res.ok) {
            setSyncSuccess(true);
            setTimeout(() => { if (navigation.canGoBack()) navigation.goBack() }, 2000);
         } else {
            Alert.alert("Sync Failed", "Could not synchronize VTOP data with the backend.");
            setIsSyncing(false);
         }
      }
    } catch (e) {
      console.log('Error parsing WebView message or executing POST:', e);
      setIsSyncing(false);
      Alert.alert("Sync Timed Out", "The synchronization request failed. Please ensure the backend is running and reachable.");
    }
  };

  if (syncSuccess) {
     return (
        <View className="flex-1 bg-surface items-center justify-center p-6">
           <CheckCircle size={80} color="#10B981" className="mb-6" />
           <Text className="text-2xl font-bold text-black text-center mb-2">VTOP Sync Complete!</Text>
           <Text className="text-textLight text-center">Your timetable and attendance have been imported.</Text>
        </View>
     );
  }

  return (
    <View className="flex-1 bg-bg relative">
      {/* Header */}
      <View className="h-20 bg-surface flex-row items-end justify-between px-6 pb-4 border-b border-border shadow-sm pt-8">
         <View>
            <Text className="text-xl font-bold text-black">VTOP Login</Text>
            <Text className="text-xs text-textLight">Please login to sync your classes.</Text>
         </View>
         <View className="flex-row">
            {!isSyncing && (
               <TouchableOpacity onPress={() => webviewRef.current?.reload()} className="p-2 bg-bg rounded-full border border-border mr-2">
                  <RefreshCw size={20} color="black" />
               </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-bg rounded-full border border-border">
               <X size={20} color="black" />
            </TouchableOpacity>
         </View>
      </View>

      {/* WebView */}
      <View className="flex-1 bg-bg relative">
         <WebView
            ref={webviewRef}
            source={{ uri: 'https://vtop.vitbhopal.ac.in/vtop/open/login' }}
            sharedCookiesEnabled={true}
            onShouldStartLoadWithRequest={(req) => {
               if (req.url === 'about:srcdoc') return false;
               return true;
            }}
            onError={(e) => {
               if (e.nativeEvent.url === 'about:srcdoc') return;
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            startInLoadingState={true}
            renderLoading={() => (
               <View className="absolute inset-0 items-center justify-center bg-bg opacity-80 z-40">
                  <ActivityIndicator size="large" color="#000" />
               </View>
            )}
         />
         {isSyncing && (
            <View className="absolute inset-0 bg-bg items-center justify-center p-6 z-50">
               <ActivityIndicator size="large" color="#000" className="mb-6" />
               <Text className="text-xl font-bold text-black text-center mb-2">Syncing Data...</Text>
               <Text className="text-textLight text-center">Scraping classes and attendance from VTOP. Please wait.</Text>
            </View>
         )}
      </View>
    </View>
  );
}
