import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert, Linking } from 'react-native';
import { styled } from 'nativewind';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { MapPin, ArrowUpRight, RefreshCw, User, BookOpen, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';

const StyledView = styled(View);
const StyledText = styled(Text);

// Mock Grade History
const GRADE_HISTORY = [
  { semester: 'Fall 2023', gpa: 9.85, credits: 24 },
  { semester: 'Winter 2024', gpa: 9.90, credits: 22 },
  { semester: 'Fall 2024', gpa: 9.97, credits: 20 },
];

export default function HomeScreen() {
  const { currentUser, fetchUserProfile, authToken, theme, themeMode } = useContext(AppContext);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [cgpaModalVisible, setCgpaModalVisible] = useState(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if(fetchUserProfile) await fetchUserProfile(authToken);
    setRefreshing(false);
  }, [authToken, fetchUserProfile]);
  
  // VIT Bhopal exact timings (mins from midnight)
  const SLOT_MAP = {
    'A11': [510, 600], 'D11': [510, 600], 'A12': [510, 600], 'D12': [510, 600], 'A13': [510, 600], 'D13': [510, 600],
    'B11': [605, 695], 'E11': [605, 695], 'B12': [605, 695], 'E12': [605, 695], 'B13': [605, 695], 'E13': [605, 695],
    'C11': [700, 790], 'F11': [700, 790], 'C12': [700, 790], 'F12': [700, 790], 'C13': [700, 790], 'F13': [700, 790],
    'A21': [795, 885], 'D21': [795, 885], 'A22': [795, 885], 'D22': [795, 885], 'A23': [795, 885], 'D23': [795, 885],
    'A14': [890, 980], 'E14': [890, 980], 'B14': [890, 980], 'F14': [890, 980], 'C14': [890, 980], 'D14': [890, 980],
    'B21': [985, 1075], 'E21': [985, 1075], 'B22': [985, 1075], 'E22': [985, 1075], 'B23': [985, 1075], 'D24': [985, 1075],
    'C21': [1080, 1170], 'F21': [1080, 1170], 'A24': [1080, 1170], 'F22': [1080, 1170], 'B24': [1080, 1170], 'E23': [1080, 1170]
  };

  const SLOT_DAYS = {
    'MON': ['A11', 'B11', 'C11', 'A21', 'A14', 'B21', 'C21'],
    'TUE': ['D11', 'E11', 'F11', 'D21', 'E14', 'E21', 'F21'],
    'WED': ['A12', 'B12', 'C12', 'A22', 'B14', 'B22', 'A24'],
    'THU': ['D12', 'E12', 'F12', 'D22', 'F14', 'E22', 'F22'],
    'FRI': ['A13', 'B13', 'C13', 'A23', 'C14', 'B23', 'B24'],
    'SAT': ['D13', 'E13', 'F13', 'D23', 'D14', 'D24', 'E23'],
    'SUN': []
  };

  const currentSemester = currentUser.current_semester;
  const semesterSchedule = (currentSemester && currentUser.schedule)
     ? currentUser.schedule.filter(s => s.semester === currentSemester)
     : (currentUser.schedule || []);
     
  const d = new Date();
  const currentMins = d.getHours() * 60 + d.getMinutes();
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayStr = DAYS[d.getDay()];
  
  const formatTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const fH = h % 12 === 0 ? 12 : h % 12;
      return `${fH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  let todaysClassesRaw = semesterSchedule.filter(cls => {
      const match = cls.time.match(/([A-G][1-2][1-4])/);
      if (match && SLOT_DAYS[todayStr]) return SLOT_DAYS[todayStr].includes(match[1]);
      return false; 
  });
  
  if(todaysClassesRaw.length === 0) {
     const mockTimesRegex = /(\d{2}):(\d{2})/;
     todaysClassesRaw = semesterSchedule.filter(cls => cls.time.match(mockTimesRegex));
  }

  let scheduledClasses = todaysClassesRaw.map(cls => {
      let status = "Upcoming";
      let displayTime = cls.time;
      let startMin = 0;
      let endMin = 0;
      
      const match = cls.time.match(/([A-G][1-2][1-4])/);
      if (match && SLOT_MAP[match[1]]) {
          const [start, end] = SLOT_MAP[match[1]];
          startMin = start; endMin = end;
          displayTime = `${formatTime(start)} - ${formatTime(end)}`;
          if (currentMins >= start && currentMins <= end) status = "Live";
          else if (currentMins > end) status = "Done";
      } else {
          const timeMatch = cls.time.match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
             startMin = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
             endMin = startMin + 90; // mock 90 min class
             displayTime = `${formatTime(startMin)} - ${formatTime(endMin)}`;
             if (currentMins >= startMin && currentMins <= endMin) status = "Live";
             else if (currentMins > endMin) status = "Done";
          }
          if (cls.status) status = cls.status;
      }
      
      const facultyObj = cls.faculty || "Prof. Unknown";
      const materialLink = cls.material || null;
      
      return { ...cls, dynamicStatus: status, displayTime, startMin, endMin, facultyObj, materialLink };
  }).sort((a, b) => a.startMin - b.startMin);

  // INJECT FREE SLOTS
  const dynamicSchedule = [];
  for(let i=0; i<scheduledClasses.length; i++) {
     dynamicSchedule.push(scheduledClasses[i]);
     if (i < scheduledClasses.length - 1) {
        const gap = scheduledClasses[i+1].startMin - scheduledClasses[i].endMin;
        if (gap > 20 && scheduledClasses[i].endMin > 0) { // More than 20 mins gap
           dynamicSchedule.push({
              isFreeSlot: true,
              dynamicStatus: currentMins >= scheduledClasses[i].endMin && currentMins <= scheduledClasses[i+1].startMin ? 'Live' : (currentMins > scheduledClasses[i+1].startMin ? 'Done' : 'Upcoming'),
              displayTime: `${formatTime(scheduledClasses[i].endMin)} - ${formatTime(scheduledClasses[i+1].startMin)}`,
              title: "Free Slot",
              loc: "Anywhere",
              type: "Chill",
              recommendedTask: "Review LeetCode Problem"
           });
        }
     }
  }

  const currentClass = dynamicSchedule.find(c => c.dynamicStatus === "Live") || 
                       dynamicSchedule.find(c => c.dynamicStatus === "Upcoming") || 
                       dynamicSchedule[0] || 
                       { dynamicStatus: 'Free', title: 'No Classes Today', displayTime: '--:--', loc: '--', type: '--', facultyObj: '--' };

  const handleMaterialPress = () => {
    if (currentClass.materialLink) {
        Linking.openURL(currentClass.materialLink).catch(() => Alert.alert("Error", "Could not open classroom link."));
    }
    else Alert.alert("No Material", "No material exists for this subject yet.");
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView 
       showsVerticalScrollIndicator={false} 
       contentContainerStyle={{ paddingBottom: 100 }}
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
        <StyledText className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>Dashboard</StyledText>
        <StyledText className="text-4xl font-bold tracking-tight" style={{ color: theme.text }}>Overview</StyledText>
      </Animated.View>

      {/* HERO CARD - PREMIUM PROFILE/LIVE CLASS */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} className="w-full rounded-[32px] p-8 mb-8 shadow-sm border" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
        <StyledView className="flex-row justify-between items-start mb-6">
          <StyledView className="px-4 py-2 rounded-full" style={{ backgroundColor: currentClass.dynamicStatus === 'Live' ? `${theme.primary}20` : `${theme.textLight}20` }}>
            <StyledText className="font-bold text-xs uppercase tracking-wider" style={{ color: currentClass.dynamicStatus === 'Live' ? theme.primary : theme.textLight }}>
              ● {currentClass.dynamicStatus}
            </StyledText>
          </StyledView>
          <StyledText className="text-2xl font-bold" style={{ color: theme.text }}>{currentClass.displayTime}</StyledText>
        </StyledView>

        <StyledText className="text-2xl font-bold leading-tight mb-4" style={{ color: theme.text }}>{currentClass.title}</StyledText>
        
        {/* NEW PROFILE / CLASS DETAILS */}
        <StyledView className="flex-row items-center mb-3">
           <MapPin size={18} color={theme.textLight} />
           <StyledText className="text-base ml-2 font-medium" style={{ color: theme.textLight }}>{currentClass.loc} • {currentClass.type}</StyledText>
        </StyledView>
        <StyledView className="flex-row items-center mb-3">
           <User size={18} color={theme.textLight} />
           <StyledText className="text-base ml-2 font-medium" style={{ color: theme.textLight }}>{currentClass.facultyObj}</StyledText>
        </StyledView>
        <StyledView className="flex-row items-center mb-8">
           <BookOpen size={18} color={theme.textLight} />
           <StyledText className="text-base ml-2 font-medium" style={{ color: theme.textLight }}>Attendance: {currentClass.classAttendance || currentUser.attendance}%</StyledText>
        </StyledView>

        <TouchableOpacity onPress={handleMaterialPress} className="h-14 w-full rounded-2xl items-center justify-center flex-row shadow-lg" style={{ backgroundColor: themeMode === 'light' ? 'black' : theme.primary }}>
           <StyledText className="text-white font-bold text-lg mr-2">Check Materials</StyledText>
           <ArrowUpRight color="white" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity 
           onPress={() => navigation.navigate('VTOPSync')}
           className="h-14 w-full rounded-2xl items-center justify-center flex-row mt-4" style={{ backgroundColor: `${theme.primary}10` }}>
           <RefreshCw color={theme.primary} size={20} className="mr-2" />
           <StyledText className="font-bold text-lg flex-1 text-center" style={{ color: theme.primary }}>Sync VTOP Timetable</StyledText>
        </TouchableOpacity>
      </Animated.View>

      {/* SMART STATS */}
      <StyledText className="text-2xl font-bold mb-5" style={{ color: theme.text }}>Stats & Planner</StyledText>
      <StyledView className="flex-row gap-4 mb-8">
        <Animated.View entering={FadeInDown.delay(300)} className="flex-1 p-6 rounded-[28px] h-44 justify-between" style={{ backgroundColor: themeMode === 'light' ? '#EEF2FF' : `${theme.primary}10` }}>
           <StyledText className="font-bold text-xs uppercase" style={{ color: '#3B82F6' }}>Attendance</StyledText>
           <StyledText className="text-4xl font-bold" style={{ color: theme.text }}>{currentUser.attendance?.toFixed(2) || '0.00'}%</StyledText>
           <StyledText className="text-xs" style={{ color: theme.textLight }}>{currentUser.attendance > 75 ? "Safe Zone" : "Critical Warning"}</StyledText>
        </Animated.View>
        
        {/* CGPA STAT - TAP TO OPEN ANIMATED SHEET */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setCgpaModalVisible(true)} className="flex-1">
          <Animated.View entering={FadeInDown.delay(400)} className="flex-1 p-6 rounded-[28px] h-44 justify-between" style={{ backgroundColor: themeMode === 'light' ? '#FFF7ED' : `${theme.primary}20` }}>
             <StyledText className="font-bold text-xs uppercase" style={{ color: theme.primary }}>Current CGPA</StyledText>
             <StyledText className="text-4xl font-bold" style={{ color: theme.text }}>{currentUser.cgpa}</StyledText>
             <StyledText className="text-xs" style={{ color: theme.textLight }}>View Grade History</StyledText>
          </Animated.View>
        </TouchableOpacity>
      </StyledView>

      {/* TIMELINE */}
      <StyledText className="text-2xl font-bold mb-5" style={{ color: theme.text }}>Today's Schedule</StyledText>
      {dynamicSchedule.length === 0 ? (
          <StyledText className="italic text-center mt-4" style={{ color: theme.textLight }}>No classes scheduled for today.</StyledText>
      ) : dynamicSchedule.map((item, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(500 + (i*100))} className="flex-row items-center mb-6">
           <StyledText className="font-bold w-[72px] text-right mr-4 leading-tight" style={{ color: theme.textLight }}>{item.displayTime.replace(" - ", "\n")}</StyledText>
           <StyledView className={`h-full w-[2px] mr-4 absolute left-[88px]`} style={{ backgroundColor: item.dynamicStatus === 'Live' ? theme.primary : theme.border }}/>
           
           <StyledView className="flex-1 p-5 rounded-2xl border" style={{ backgroundColor: item.isFreeSlot ? `${theme.primary}05` : theme.surface, borderColor: item.dynamicStatus === 'Live' ? theme.primary : theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
              <StyledText className="font-bold text-lg mb-1" style={{ color: item.isFreeSlot ? theme.primary : theme.text }}>{item.title}</StyledText>
              {item.isFreeSlot ? (
                <StyledText className="text-sm font-medium italic" style={{ color: theme.textLight }}>Suggested: {item.recommendedTask}</StyledText>
              ) : (
                <StyledText className="text-sm" style={{ color: theme.textLight }}>{item.loc} • {item.facultyObj}</StyledText>
              )}
           </StyledView>
        </Animated.View>
      ))}
    </ScrollView>

    {/* CGPA MODAL */}
    <Modal visible={cgpaModalVisible} transparent animationType="fade" onRequestClose={() => setCgpaModalVisible(false)}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Animated.View entering={SlideInDown.duration(400)} className="w-full h-[60%] rounded-t-[40px] p-8" style={{ backgroundColor: theme.surface }}>
          <View className="flex-row justify-between items-center mb-6">
             <Text className="text-2xl font-bold" style={{ color: theme.text }}>Grade History</Text>
             <TouchableOpacity onPress={() => setCgpaModalVisible(false)} className="p-2 rounded-full" style={{ backgroundColor: theme.bg }}><X color={theme.icon} size={24}/></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
             {GRADE_HISTORY.map((hist, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(100*i)} className="flex-row justify-between items-center p-5 rounded-2xl border mb-4" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                  <View>
                    <Text className="text-lg font-bold mb-1" style={{ color: theme.text }}>{hist.semester}</Text>
                    <Text className="text-sm font-medium" style={{ color: theme.textLight }}>Credits Earned: {hist.credits}</Text>
                  </View>
                  <View className="px-4 py-2 rounded-xl" style={{ backgroundColor: `${theme.primary}20` }}>
                    <Text className="text-xl font-bold" style={{ color: theme.primary }}>{hist.gpa.toFixed(2)}</Text>
                  </View>
                </Animated.View>
             ))}
             <View className="mt-4 p-5 rounded-2xl border border-dashed" style={{ borderColor: theme.primary, backgroundColor: `${theme.primary}05` }}>
                <Text className="text-center font-medium" style={{ color: theme.primary }}>Keep up the great work! You're in the top 5% of your class.</Text>
             </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
    </View>
  );
}