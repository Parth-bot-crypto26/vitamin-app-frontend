import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { AppContext } from '../context/AppContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronDown, ChevronUp, Trash2, Edit2, Zap, X, Check } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function GoalsScreen() {
  const { currentUser, allUsers, updateAllUsers, theme } = useContext(AppContext);
  const categories = Object.keys(currentUser?.goals || {});
  const [expanded, setExpanded] = useState(categories[0] || null); 

  const [editModal, setEditModal] = useState({ visible: false, cat: null, goalIdx: null, title: '', progress: 0 });

  const getMotivationalMessage = (cat, goals) => {
    if(!goals || goals.length === 0) return "Add some goals to get started!";
    const avgProgress = goals.reduce((a,b)=>a+b.progress, 0) / goals.length;
    if (avgProgress === 1) return `Incredible! All ${cat} goals crushed! 🎯`;
    if (avgProgress > 0.7) return `You're crushing your ${cat} goals! Keep it up! 🔥`;
    if (avgProgress > 0.3) return `Making steady progress on ${cat}. Stay focused! 📈`;
    return `Time to kickstart your ${cat} goals! 🚀`;
  };

  const syncUpdate = (modifierFunc) => {
    let updatedUsers = JSON.parse(JSON.stringify(allUsers));
    const meIndex = updatedUsers.findIndex(u => u.id === currentUser.id);
    if(meIndex !== -1) {
       modifierFunc(updatedUsers[meIndex].goals);
       updateAllUsers(updatedUsers);
    }
  };

  const handleEdit = (cat, idx, goal) => {
     setEditModal({ visible: true, cat, goalIdx: idx, title: goal.title, progress: (goal.progress*100).toString() });
  };

  const saveEdit = () => {
     syncUpdate((goals) => {
        goals[editModal.cat][editModal.goalIdx].title = editModal.title;
        goals[editModal.cat][editModal.goalIdx].progress = Math.min(100, Math.max(0, parseInt(editModal.progress) || 0)) / 100;
     });
     setEditModal({ ...editModal, visible: false });
  };

  const handleDelete = (cat, idx) => {
     syncUpdate((goals) => {
        goals[cat].splice(idx, 1);
     });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 mt-2 px-6">
           <Text className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>Target Tracker</Text>
           <Text className="text-4xl font-bold tracking-tight" style={{ color: theme.text }}>Your Goals</Text>
        </Animated.View>

        <View className="px-6">
        {categories.map((cat, i) => {
          const goals = currentUser?.goals?.[cat] || [];
          const isCatExpanded = expanded === cat;
          return (
            <Animated.View key={cat} entering={FadeInDown.delay(i * 100)} className="mb-4">
               <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setExpanded(isCatExpanded ? null : cat)} 
                  className="flex-row justify-between items-center p-5 rounded-2xl border"
                  style={{ backgroundColor: isCatExpanded ? theme.primary : theme.bg, borderColor: isCatExpanded ? theme.primary : theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}
               >
                  <Text className="text-xl font-bold" style={{ color: isCatExpanded ? 'white' : theme.text }}>{cat}</Text>
                  {isCatExpanded ? <ChevronUp color="white"/> : <ChevronDown color={theme.icon}/>}
               </TouchableOpacity>
               
               {isCatExpanded && (
                 <View className="mt-3 pl-2">
                    <View className="p-4 rounded-xl mb-4 border border-dashed flex-row items-center" style={{ backgroundColor: `${theme.primary}10`, borderColor: theme.primary, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                       <Zap color={theme.primary} size={20} className="mr-3" />
                       <Text className="font-medium flex-1 text-sm" style={{ color: theme.primary }}>{getMotivationalMessage(cat, goals)}</Text>
                    </View>

                    {goals.map((goal, idx) => (
                       <View key={idx} className="p-5 rounded-2xl border mb-3 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                          <View className="flex-row justify-between mb-2">
                            <Text className="font-bold text-lg flex-1 mr-2" style={{ color: theme.text }}>{goal.title}</Text>
                            <Text className="font-bold" style={{ color: theme.primary }}>🔥 {goal.streak}</Text>
                          </View>
                          
                          <View className="h-3 rounded-full overflow-hidden mt-2 mb-3" style={{ backgroundColor: `${theme.primary}20` }}>
                            <View className="h-full" style={{ width: `${goal.progress * 100}%`, backgroundColor: theme.primary }}/>
                          </View>
                          
                          <View className="flex-row justify-between items-center mt-1">
                            <Text className="text-xs font-bold" style={{ color: theme.textLight }}>
                               {Math.round(goal.progress * 100)}% Completed  •  {(100 - Math.round(goal.progress * 100))}% Left
                            </Text>
                            
                            <View className="flex-row space-x-4">
                               <TouchableOpacity onPress={() => handleEdit(cat, idx, goal)}>
                                 <Edit2 size={20} color={theme.textLight} />
                               </TouchableOpacity>
                               <TouchableOpacity onPress={() => handleDelete(cat, idx)}>
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
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModal.visible} animationType="fade" transparent={true} onRequestClose={() => setEditModal({...editModal, visible: false})}>
         <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="w-full rounded-3xl p-6 shadow-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
               <View className="flex-row justify-between items-center mb-6">
                 <Text className="text-xl font-bold" style={{ color: theme.text }}>Edit Goal</Text>
                 <TouchableOpacity onPress={() => setEditModal({...editModal, visible: false})}><X color={theme.icon} size={24}/></TouchableOpacity>
               </View>

               <Text className="text-sm font-bold mb-2 mt-4" style={{ color: theme.textLight }}>Goal Title</Text>
               <View className="rounded-xl border px-4 h-14 justify-center" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                 <TextInput value={editModal.title} onChangeText={(t) => setEditModal({...editModal, title: t})} style={{ color: theme.text, fontSize: 16 }} />
               </View>

               <Text className="text-sm font-bold mb-2 mt-4" style={{ color: theme.textLight }}>Progress (0-100%)</Text>
               <View className="rounded-xl border px-4 h-14 justify-center" style={{ backgroundColor: theme.bg, borderColor: theme.border, borderRadius: theme.radius, borderWidth: theme.borderWidth, shadowOpacity: theme.shadowOp, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, shadowColor: theme.shadowColor, elevation: theme.elevation }}>
                 <TextInput value={editModal.progress} keyboardType="numeric" onChangeText={(t) => setEditModal({...editModal, progress: t})} style={{ color: theme.text, fontSize: 16 }} />
               </View>

               <TouchableOpacity onPress={saveEdit} className="mt-8 h-14 rounded-full items-center justify-center flex-row shadow-sm" style={{ backgroundColor: theme.primary }}>
                  <Check color="white" size={20} className="mr-2" />
                  <Text className="text-white font-bold text-lg">Save Changes</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}