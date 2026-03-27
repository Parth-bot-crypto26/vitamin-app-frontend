import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Modal, TextInput, ScrollView, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Home, Zap, Calendar, Users, MessageSquare, Bot, LogOut, X, Send, Bell, Moon, Sun } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSpring, withSequence, withRepeat } from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GoalsScreen from './screens/GoalsScreen';
import EventsScreen from './screens/EventsScreen';
import BuddyScreen from './screens/BuddyScreen';
import VTOPSyncScreen from './screens/VTOPSyncScreen';
import ChatScreen from './screens/ChatScreen';

// Import Context
import { AppProvider, AppContext } from './context/AppContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <SafeAreaProvider>
          <NavigationContainer>
             <MainNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

function MainNavigator() {
  const { currentUser, themeMode, theme } = useContext(AppContext);
  return (
    <>
      <StatusBar barStyle={themeMode === 'light' ? "dark-content" : "light-content"} backgroundColor={theme?.bg || '#FAFAFA'} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
             <Stack.Screen name="Main" component={MainLayout} />
             <Stack.Screen name="VTOPSync" component={VTOPSyncScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

// === MAIN LAYOUT ===
function MainLayout() {
  const { currentUser, logout, theme, cycleTheme, themeMode, notificationPulse } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCocoOpen, setCocoOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  
  const offset = useSharedValue(-300); 
  const bellRotation = useSharedValue(0);



  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${bellRotation.value}deg` }]
  }));

  const toggleSidebar = () => {
    const isOpen = !isSidebarOpen;
    setSidebarOpen(isOpen);
    offset.value = withTiming(isOpen ? 0 : -300, { duration: 300 });
  };
  const animatedSidebarStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const handleSwipeOpen = () => { if (!isSidebarOpen) toggleSidebar(); };
  const handleSwipeClose = () => { if (isSidebarOpen) toggleSidebar(); };

  const sidebarOpenGesture = Gesture.Pan().activeOffsetX(20).onEnd(e => {
    if (e.translationX > 50) runOnJS(handleSwipeOpen)();
  });

  const sidebarCloseGesture = Gesture.Pan().activeOffsetX(-20).onEnd(e => {
    if (e.translationX < -50) runOnJS(handleSwipeClose)();
  });

  // Draggable Bot
  const botX = useSharedValue(0);
  const botY = useSharedValue(0);
  const botCtxX = useSharedValue(0);
  const botCtxY = useSharedValue(0);

  const botGesture = Gesture.Pan()
    .onUpdate(e => {
      botX.value = botCtxX.value + e.translationX;
      botY.value = botCtxY.value + e.translationY;
    })
    .onEnd(() => {
      botCtxX.value = botX.value;
      botCtxY.value = botY.value;
    });

  const animatedBotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: botX.value }, { translateY: botY.value }]
  }));

  const renderScreen = () => {
    switch(activeTab) {
      case 'Home': return <HomeScreen />;
      case 'Goals': return <GoalsScreen />;
      case 'Events': return <EventsScreen />;
      case 'Buddy': return <BuddyScreen />;
      case 'Chat': return <ChatScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView className="flex-1 relative" style={{ backgroundColor: theme.bg }}>
      
      {/* HEADER */}
      <StyledView className="flex-row justify-between items-center px-6 py-4 z-10 border-b shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
        <TouchableOpacity onPress={toggleSidebar} className="p-2 rounded-full border shadow-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
          <Menu color={theme.icon} size={24} />
        </TouchableOpacity>
        
        <Image source={require('./assets/images/logo.png')} className="h-8 w-8" resizeMode="contain" />
        
        <StyledView className="flex-row space-x-3 items-center">
          {/* THEME SWITCHER */}
          <TouchableOpacity onPress={cycleTheme} className="p-2 rounded-full border shadow-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
            {themeMode === 'light' ? <Moon color={theme.icon} size={20} /> : <Sun color={theme.icon} size={20} />}
          </TouchableOpacity>

          {/* NOTIFICATION */}
          <TouchableOpacity onPress={() => setNotifOpen(true)} className="p-2 rounded-full border shadow-sm relative" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
             <Animated.View style={bellAnimatedStyle}>
               <Bell color={theme.icon} size={20} />
             </Animated.View>
             <StyledView className="absolute top-2 right-2 h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
          </TouchableOpacity>
        </StyledView>
      </StyledView>

      {/* SCREEN CONTENT */}
      <StyledView className="flex-1 px-6 pt-2">
        {renderScreen()}
      </StyledView>

      {/* SWIPE TO OPEN AREA */}
      {!isSidebarOpen && (
        <GestureDetector gesture={sidebarOpenGesture}>
          <Animated.View style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 25, zIndex: 15}} />
        </GestureDetector>
      )}

      {/* DRAGGABLE COCO BOT */}
      {activeTab !== 'Chat' && (
        <GestureDetector gesture={botGesture}>
          <Animated.View style={[animatedBotStyle, { position: 'absolute', bottom: 32, right: 24, zIndex: 20 }]}>
            <TouchableOpacity 
              onPress={() => setCocoOpen(true)}
              className="h-16 w-16 rounded-full items-center justify-center shadow-2xl"
              style={{ backgroundColor: themeMode === 'light' ? 'black' : theme.primary }}
              activeOpacity={0.9}
            >
              <Bot color="white" size={28} />
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      )}

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && <TouchableOpacity activeOpacity={1} onPress={toggleSidebar} className="absolute inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />}
      
      {/* SIDEBAR */}
      <GestureDetector gesture={sidebarCloseGesture}>
        <Animated.View style={[animatedSidebarStyle, { backgroundColor: theme.surface, borderColor: theme.border }]} className="absolute top-0 bottom-0 left-0 w-[75%] z-50 shadow-2xl border-r p-6 pt-16">
          <StyledView className="mb-10">
             <StyledText className="text-3xl font-bold tracking-tighter" style={{ color: theme.text }}>VITamin<StyledText style={{ color: theme.primary }}>.</StyledText></StyledText>
             <StyledText className="text-sm mt-1" style={{ color: theme.textLight }}>Hello, {currentUser.name.split(' ')[0]}</StyledText>
          </StyledView>
          <StyledView className="space-y-3">
            {['Home', 'Goals', 'Events', 'Buddy', 'Chat'].map((tab) => (
               <SidebarItem key={tab} label={tab} active={activeTab === tab} onPress={() => { setActiveTab(tab); toggleSidebar(); }} theme={theme} />
            ))}
          </StyledView>
          <TouchableOpacity onPress={logout} className="absolute bottom-10 left-6 flex-row items-center space-x-3">
            <LogOut size={20} color="#EF4444" />
            <StyledText className="text-red-500 font-bold">Logout</StyledText>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      {/* MODALS */}
      <Modal visible={isCocoOpen} animationType="slide" transparent={true} onRequestClose={() => setCocoOpen(false)}>
         <CocoBot onClose={() => setCocoOpen(false)} user={currentUser} theme={theme} />
      </Modal>
      <Modal visible={isNotifOpen} animationType="fade" transparent={true} onRequestClose={() => setNotifOpen(false)}>
         <NotificationPopup onClose={() => setNotifOpen(false)} theme={theme} />
      </Modal>

    </SafeAreaView>
  );
}

const SidebarItem = ({ label, active, onPress, theme }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center p-4 rounded-2xl" style={{ backgroundColor: active ? `${theme.primary}20` : 'transparent' }}>
    <StyledText className="ml-4 font-bold text-lg" style={{ color: active ? theme.primary : theme.textLight }}>{label}</StyledText>
  </TouchableOpacity>
);

function NotificationPopup({ onClose, theme }) {
  return (
    <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <View className="w-full rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: theme.surface }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Notifications</Text>
          <TouchableOpacity onPress={onClose}><X color={theme.icon} size={24}/></TouchableOpacity>
        </View>
        <View className="space-y-4">
           <NotifItem title="Class Reminder" desc="Compiler Design Lab starts in 15 mins." time="Now" theme={theme} />
           <NotifItem title="New Event" desc="HackTheFall 2.0 registration opens today." time="2h ago" theme={theme} />
           <NotifItem title="Coco Bot" desc="You missed your goal streak yesterday!" time="5h ago" theme={theme} />
        </View>
      </View>
    </View>
  );
}

const NotifItem = ({ title, desc, time, theme }) => (
  <View className="flex-row items-start border-b pb-3" style={{ borderColor: theme.border }}>
    <View className="h-2 w-2 rounded-full mt-2 mr-3" style={{ backgroundColor: theme.primary }} />
    <View className="flex-1">
      <Text className="font-bold" style={{ color: theme.text }}>{title}</Text>
      <Text className="text-xs" style={{ color: theme.textLight }}>{desc}</Text>
    </View>
    <Text className="text-[10px]" style={{ color: theme.textLight }}>{time}</Text>
  </View>
);

function CocoBot({ onClose, user, theme }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(`Hi ${user.name.split(' ')[0]}! Ask me about your schedule, attendance, or goals.`);
  const handleAsk = () => {
    const q = query.toLowerCase();
    if (q.includes('schedule') || q.includes('class')) setResponse(`You have ${user.schedule?.length || 0} classes today.`);
    else if (q.includes('attendance')) setResponse(`Your attendance is ${user.attendance}%.`);
    else setResponse("I can help with VTOP sync and finding buddies.");
    setQuery('');
  };
  return (
    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
       <View className="h-[50%] rounded-t-[40px] p-6 shadow-2xl" style={{ backgroundColor: theme.surface }}>
          <View className="flex-row justify-between items-center mb-4">
             <Text className="font-bold text-xl" style={{ color: theme.text }}>Coco AI</Text>
             <TouchableOpacity onPress={onClose}><X color={theme.icon} size={24}/></TouchableOpacity>
          </View>
          <ScrollView className="flex-1 rounded-3xl p-4 mb-4" style={{ backgroundColor: theme.bg }}>
             <Text className="text-lg leading-7" style={{ color: theme.text }}>{response}</Text>
          </ScrollView>
          <View className="flex-row items-center rounded-full px-2 border h-14" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
             <TextInput value={query} onChangeText={setQuery} placeholder="Ask Coco..." placeholderTextColor={theme.textLight} className="flex-1 p-4" style={{ color: theme.text }} />
             <TouchableOpacity onPress={handleAsk} className="h-10 w-10 rounded-full items-center justify-center m-1" style={{ backgroundColor: theme.text }}><Send size={18} color={theme.bg} /></TouchableOpacity>
          </View>
       </View>
    </View>
  );
}