import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserPlus } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function BuddyScreen() {
  const { currentUser, allUsers, theme } = useContext(AppContext);
  
  const buddies = allUsers.filter(u => u.id !== currentUser?.id);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
       <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
         <StyledText className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>ML Matchmaking</StyledText>
         <StyledText className="text-4xl font-bold tracking-tight" style={{ color: theme.text }}>Study Buddies</StyledText>
       </Animated.View>

       {buddies.map((buddy, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i*150)} className="p-6 rounded-3xl border mb-4 flex-row justify-between items-center shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
             <StyledView className="flex-1">
                <StyledText className="text-xl font-bold" style={{ color: theme.text }}>{buddy.name}</StyledText>
                <StyledText className="font-bold text-sm mt-1" style={{ color: theme.primary }}>95% Compatibility</StyledText>
                <StyledText className="text-sm mt-1" style={{ color: theme.textLight }}>{buddy.branch}</StyledText>
             </StyledView>
             
             <View className="items-center space-y-2">
                <StyledView className="h-14 w-14 rounded-full items-center justify-center border shadow-sm" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                   <StyledText className="font-bold text-xl" style={{ color: theme.text }}>{buddy.avatar}</StyledText>
                </StyledView>
                <TouchableOpacity className="px-3 py-1 rounded-full mt-2" style={{ backgroundColor: `${theme.primary}10` }}>
                   <UserPlus size={16} color={theme.primary} />
                </TouchableOpacity>
             </View>
          </Animated.View>
       ))}
    </ScrollView>
  );
}