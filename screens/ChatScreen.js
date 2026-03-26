import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext';
import { Send, Image as ImageIcon, MapPin, MoreVertical, ChevronLeft, Phone, Video } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function ChatScreen() {
  const { currentUser, allUsers, updateAllUsers, theme, triggerBellAnimation } = useContext(AppContext);
  const navigation = useNavigation();
  const [activeChatId, setActiveChatId] = useState(null);

  const potentialBuddies = allUsers.filter(u => u.id !== currentUser.id);

  if (activeChatId) {
    const buddy = allUsers.find(u => u.id === activeChatId);
    return <ChatWindow buddy={buddy} onBack={() => setActiveChatId(null)} theme={theme} currentUser={currentUser} allUsers={allUsers} updateAllUsers={updateAllUsers} triggerBellAnimation={triggerBellAnimation} />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-6 mt-2 px-6">
          <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>Messages</Text>
          <Text className="text-4xl font-bold tracking-tight" style={{ color: theme.text }}>Inbox</Text>
        </Animated.View>

        <View className="px-6">
        {potentialBuddies.map((buddy, index) => {
           const myChats = currentUser.chats[buddy.id] || [];
           const theirChats = buddy.chats[currentUser.id] || [];
           const allObj = [...myChats, ...theirChats].sort((a,b) => a.timestamp - b.timestamp);
           const lastMsg = allObj.length > 0 ? allObj[allObj.length-1] : null;
           
           return (
            <TouchableOpacity key={buddy.id} onPress={() => setActiveChatId(buddy.id)} activeOpacity={0.8}>
              <Animated.View entering={FadeInDown.delay(index * 100)} className="flex-row items-center border p-5 rounded-3xl mb-4 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <View className="h-14 w-14 rounded-full items-center justify-center mr-4 border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                  <Text className="font-bold text-xl" style={{ color: theme.text }}>{buddy.avatar}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-lg" style={{ color: theme.text }}>{buddy.name}</Text>
                  <Text className="text-sm" style={{ color: theme.textLight }} numberOfLines={1}>{lastMsg ? lastMsg.text : "Start a conversation..."}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
           );
        })}
        </View>
      </ScrollView>
    </View>
  );
}

function ChatWindow({ buddy, onBack, theme, currentUser, allUsers, updateAllUsers, triggerBellAnimation }) {
  const [msg, setMsg] = useState('');
  const scrollViewRef = useRef();

  const mySent = currentUser.chats[buddy.id] || [];
  const theirSent = buddy.chats[currentUser.id] || [];
  const allMessages = [...mySent.map(m => ({ ...m, type: 'sent' })), ...theirSent.map(m => ({ ...m, type: 'received' }))].sort((a,b) => a.timestamp - b.timestamp);

  const sendMessage = () => {
    if(!msg.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newMsgObj = { text: msg.trim(), sender: 'me', status: 'delivered', timestamp: Date.now() };
    
    const updatedUsersState = JSON.parse(JSON.stringify(allUsers));
    const meIndex = updatedUsersState.findIndex(u => u.id === currentUser.id);
    if (!updatedUsersState[meIndex].chats[buddy.id]) updatedUsersState[meIndex].chats[buddy.id] = [];
    updatedUsersState[meIndex].chats[buddy.id].push(newMsgObj);

    updateAllUsers(updatedUsersState);
    setMsg('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate reply after 1.5s
    setTimeout(() => {
        if(triggerBellAnimation) triggerBellAnimation();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const replyMsgObj = { text: "Got it! Thanks.", sender: 'me', status: 'delivered', timestamp: Date.now() };
        
        const nextUsersState = JSON.parse(JSON.stringify(updatedUsersState));
        const buddyIndex = nextUsersState.findIndex(u => u.id === buddy.id);
        if (!nextUsersState[buddyIndex].chats[currentUser.id]) nextUsersState[buddyIndex].chats[currentUser.id] = [];
        nextUsersState[buddyIndex].chats[currentUser.id].push(replyMsgObj);
        
        updateAllUsers(nextUsersState);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [allMessages.length]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.surface }}>
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b z-10 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
         <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4 p-2 rounded-full border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}><ChevronLeft size={24} color={theme.text}/></TouchableOpacity>
            <View>
               <Text className="text-xl font-bold" style={{ color: theme.text }}>{buddy.name}</Text>
               <Text className="text-xs font-bold" style={{ color: theme.primary }}>Online</Text>
            </View>
         </View>
         <View className="flex-row space-x-3">
            <TouchableOpacity className="p-2 rounded-full border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}><Phone size={20} color={theme.text}/></TouchableOpacity>
            <TouchableOpacity className="p-2 rounded-full border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}><Video size={20} color={theme.text}/></TouchableOpacity>
         </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" ref={scrollViewRef} showsVerticalScrollIndicator={false}>
         {allMessages.map((m, i) => {
            const isMe = m.type === 'sent';
            let formattedTime = "";
            try { formattedTime = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch(e){}
            return (
              <Animated.View key={i} entering={FadeInUp.delay((i%10)*50)} className={`mb-4 w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                 <View className={`p-4 rounded-3xl ${isMe ? 'rounded-tr-sm shadow-md' : 'rounded-tl-sm border shadow-sm'}`} style={{ backgroundColor: isMe ? theme.primary : theme.bg, borderColor: isMe ? theme.primary : theme.border, shadowColor: isMe ? theme.primary : '#000' }}>
                    <Text className={`text-[15px] leading-6 font-medium`} style={{ color: isMe ? 'white' : theme.text }}>{m.text}</Text>
                 </View>
                 <Text className={`text-[10px] mt-1 font-bold`} style={{ color: theme.textLight, textAlign: isMe ? 'right' : 'left' }}>{formattedTime}</Text>
              </Animated.View>
            )
         })}
         <View className="h-6" />
      </ScrollView>

      <View className="p-4 border-t flex-row items-center z-10 pb-8" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
         <TouchableOpacity className="p-3 mr-3 rounded-full border shadow-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border }}><ImageIcon color={theme.textLight} size={20}/></TouchableOpacity>
         <View className="flex-1 flex-row items-center rounded-full px-4 h-14 border shadow-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
            <TextInput 
               value={msg} 
               onChangeText={setMsg} 
               placeholder="Type a message..." 
               placeholderTextColor={theme.textLight}
               style={{ flex: 1, color: theme.text, fontSize: 16 }}
               onSubmitEditing={sendMessage}
            />
         </View>
         <TouchableOpacity onPress={sendMessage} className="h-14 w-14 rounded-full items-center justify-center ml-3 shadow-lg" style={{ backgroundColor: theme.primary, shadowColor: theme.primary }}>
            <Send color="white" size={20} style={{ marginLeft: -2 }} />
         </TouchableOpacity>
      </View>
    </View>
  );
}