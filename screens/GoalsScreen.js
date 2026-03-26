import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronDown, ChevronUp, Trash2, Edit2, Zap } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function GoalsScreen() {
  const { currentUser, theme } = useContext(AppContext);
  const categories = Object.keys(currentUser?.goals || {});
  const [expanded, setExpanded] = useState(categories[0] || null); 

  // Motivational message logic per category
  const getMotivationalMessage = (cat, goals) => {
    if(!goals || goals.length === 0) return "Add some goals to get started!";
    const avgProgress = goals.reduce((a,b)=>a+b.progress, 0) / goals.length;
    if (avgProgress === 1) return `Incredible! All ${cat} goals crushed! 🎯`;
    if (avgProgress > 0.7) return `You're crushing your ${cat} goals! Keep it up! 🔥`;
    if (avgProgress > 0.3) return `Making steady progress on ${cat}. Stay focused! 📈`;
    return `Time to kickstart your ${cat} goals! 🚀`;
  };

  const handleEdit = (title) => Alert.alert("Edit Goal", `Editing '${title}'...`);
  const handleDelete = (title) => Alert.alert("Delete Goal", `Are you sure you want to delete '${title}'?`);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2">
         <StyledText className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>Target Tracker</StyledText>
         <StyledText className="text-4xl font-bold tracking-tight" style={{ color: theme.text }}>Your Goals</StyledText>
      </Animated.View>

      {categories.map((cat, i) => {
        const goals = currentUser?.goals?.[cat] || [];
        const isCatExpanded = expanded === cat;
        return (
          <Animated.View key={cat} entering={FadeInDown.delay(i * 100)} className="mb-4">
             {/* Category Header */}
             <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setExpanded(isCatExpanded ? null : cat)} 
                className="flex-row justify-between items-center p-5 rounded-2xl border"
                style={{ backgroundColor: isCatExpanded ? theme.primary : theme.surface, borderColor: isCatExpanded ? theme.primary : theme.border }}
             >
                <StyledText className="text-xl font-bold" style={{ color: isCatExpanded ? 'white' : theme.text }}>{cat}</StyledText>
                {isCatExpanded ? <ChevronUp color="white"/> : <ChevronDown color={theme.icon}/>}
             </TouchableOpacity>
             
             {/* Expanded Content */}
             {isCatExpanded && (
               <View className="mt-3 pl-2">
                  <View className="p-4 rounded-xl mb-4 border border-dashed flex-row items-center" style={{ backgroundColor: `${theme.primary}10`, borderColor: theme.primary }}>
                     <Zap color={theme.primary} size={20} className="mr-3" />
                     <StyledText className="font-medium flex-1 text-sm" style={{ color: theme.primary }}>{getMotivationalMessage(cat, goals)}</StyledText>
                  </View>

                  {goals.map((goal, idx) => (
                     <View key={idx} className="p-5 rounded-2xl border mb-3 ml-2 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                        <View className="flex-row justify-between mb-2">
                          <StyledText className="font-bold text-lg flex-1 mr-2" style={{ color: theme.text }}>{goal.title}</StyledText>
                          <StyledText className="font-bold" style={{ color: theme.primary }}>🔥 {goal.streak}</StyledText>
                        </View>
                        
                        {/* Progress Bar */}
                        <View className="h-3 rounded-full overflow-hidden mt-2 mb-3" style={{ backgroundColor: `${theme.primary}20` }}>
                          <View className="h-full" style={{ width: `${goal.progress * 100}%`, backgroundColor: theme.primary }}/>
                        </View>
                        
                        <View className="flex-row justify-between items-center mt-1">
                          <StyledText className="text-xs font-bold" style={{ color: theme.textLight }}>
                             {Math.round(goal.progress * 100)}% Completed  •  {(100 - Math.round(goal.progress * 100))}% Left
                          </StyledText>
                          
                          <View className="flex-row space-x-4">
                             <TouchableOpacity onPress={() => handleEdit(goal.title)}>
                               <Edit2 size={20} color={theme.textLight} />
                             </TouchableOpacity>
                             <TouchableOpacity onPress={() => handleDelete(goal.title)}>
                               <Trash2 size={20} color="#EF4444" />
                             </TouchableOpacity>
                          </View>
                        </View>
                     </View>
                  ))}
               </View>
             )}
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}