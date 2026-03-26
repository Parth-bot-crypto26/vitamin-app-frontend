import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { styled } from 'nativewind';
import { EVENTS, AppContext } from '../context/AppContext';
import { X, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CALENDAR_DAYS = [
  { date: 12, label: "12 Oct", isHoliday: false },
  { date: 13, label: "13 Oct", isHoliday: true, note: "Dussehra" },
  { date: 14, label: "14 Oct", isHoliday: false },
  { date: 15, label: "15 Oct", isHoliday: false },
  { date: 16, label: "16 Oct", isHoliday: false },
  { date: 17, label: "17 Oct", isHoliday: false },
  { date: 18, label: "18 Oct", isHoliday: false, note: "Fest" },
  { date: 19, label: "19 Oct", isHoliday: false },
  { date: 20, label: "20 Oct", isHoliday: false },
];

const EVENT_COLORS = {
  'Tech': { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' },
  'Cultural': { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  'Workshop': { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' },
  'Lit': { bg: '#FEF9C3', text: '#CA8A04', border: '#FEF08A' },
  'Biz': { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  'Default': { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' }
};

const StyledView = styled(View);
const StyledText = styled(Text);

export default function EventsScreen() {
  const { theme, themeMode } = useContext(AppContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState("12 Oct");

  const filteredEvents = EVENTS.filter(e => e.date === selectedDateLabel);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
       <Animated.View entering={FadeInDown.duration(600)} className="mb-6 mt-2">
          <StyledText className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textLight }}>Campus Life</StyledText>
          <StyledText className="text-4xl font-bold" style={{ color: theme.text }}>Events & Fests</StyledText>
       </Animated.View>
       
       {/* CALENDAR STRIP */}
       <ScrollView horizontal className="mb-8" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {CALENDAR_DAYS.map((day, i) => {
             const isSelected = selectedDateLabel === day.label;
             const highlightColor = day.isHoliday ? '#EF4444' : (day.note ? theme.primary : theme.text);
             return (
               <TouchableOpacity key={day.label} onPress={() => setSelectedDateLabel(day.label)}>
                 <Animated.View 
                    entering={FadeInDown.delay(i*50)} 
                    className="mr-3 w-16 h-28 rounded-[24px] items-center justify-center border"
                    style={{ 
                       backgroundColor: isSelected ? theme.primary : theme.surface, 
                       borderColor: isSelected ? theme.primary : theme.border,
                       shadowColor: isSelected ? theme.primary : 'transparent',
                       elevation: isSelected ? 8 : 0
                    }}
                 >
                    {/* Note Dot Indicator */}
                    {(day.isHoliday || day.note) && (
                       <View className="absolute top-3 w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? 'white' : highlightColor }} />
                    )}
                    <Text className="font-bold text-xs mt-2" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textLight }}>OCT</Text>
                    <Text className="text-2xl font-bold" style={{ color: isSelected ? 'white' : theme.text }}>{day.date}</Text>
                    
                    {day.note && !isSelected && (
                      <Text className="text-[9px] font-bold mt-1 text-center px-1" style={{ color: highlightColor }} numberOfLines={1}>{day.note}</Text>
                    )}
                 </Animated.View>
               </TouchableOpacity>
             );
          })}
       </ScrollView>

       {/* EVENTS LIST */}
       <StyledText className="text-xl font-bold mb-4" style={{ color: theme.text }}>{selectedDateLabel} Schedule</StyledText>
       
       {filteredEvents.length === 0 ? (
          <View className="py-10 items-center justify-center border border-dashed rounded-3xl" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
             <Text className="text-lg font-medium" style={{ color: theme.textLight }}>No events scheduled for this day.</Text>
             <Text className="text-sm mt-2" style={{ color: theme.textLight }}>Enjoy your free time!</Text>
          </View>
       ) : (
         filteredEvents.map((event, i) => {
           const colors = EVENT_COLORS[event.type] || EVENT_COLORS.Default;
           return (
             <TouchableOpacity key={i} onPress={() => setSelectedEvent(event)} activeOpacity={0.9}>
                <Animated.View entering={FadeInDown.delay(i*100)} className="p-6 rounded-3xl border mb-4 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                   <View className="flex-row justify-between items-start mb-3">
                      <View className="px-3 py-1 rounded-full border" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                        <Text className="font-bold text-[10px] uppercase tracking-wider" style={{ color: colors.text }}>{event.type}</Text>
                      </View>
                      <Text className="font-bold text-base" style={{ color: theme.text }}>{event.time}</Text>
                   </View>
                   <StyledText className="text-2xl font-bold mb-2 leading-tight" style={{ color: theme.text }}>{event.title}</StyledText>
                   <View className="flex-row items-center">
                      <MapPin size={14} color={theme.textLight} />
                      <StyledText className="text-sm ml-1 font-medium" style={{ color: theme.textLight }}>{event.loc}</StyledText>
                   </View>
                </Animated.View>
             </TouchableOpacity>
           );
         })
       )}

       {/* EVENT DETAIL POPUP */}
       <Modal visible={!!selectedEvent} transparent={true} animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
             <View className="h-[60%] rounded-t-[40px] p-8 shadow-2xl" style={{ backgroundColor: theme.surface }}>
                {selectedEvent && (
                  <>
                    <View className="flex-row justify-between items-center mb-6">
                       <Text className="font-bold uppercase tracking-widest" style={{ color: theme.primary }}>{selectedEvent.org}</Text>
                       <TouchableOpacity onPress={() => setSelectedEvent(null)} className="p-2 rounded-full" style={{ backgroundColor: theme.bg }}><X size={24} color={theme.icon}/></TouchableOpacity>
                    </View>
                    
                    <Text className="text-3xl font-bold mb-4 leading-tight" style={{ color: theme.text }}>{selectedEvent.title}</Text>
                    <Text className="text-base font-medium mb-6" style={{ color: theme.textLight }}>{selectedEvent.desc}</Text>
                    
                    <View className="space-y-4 mb-8 p-6 rounded-2xl border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                       <View className="flex-row items-center"><Clock size={20} color={theme.textLight}/><Text className="ml-3 text-lg font-medium" style={{ color: theme.text }}>{selectedEvent.date} @ {selectedEvent.time}</Text></View>
                       <View className="flex-row items-center mt-3"><MapPin size={20} color={theme.textLight}/><Text className="ml-3 text-lg font-medium" style={{ color: theme.text }}>{selectedEvent.loc}</Text></View>
                    </View>
                    
                    <TouchableOpacity className="min-h-[64px] rounded-2xl items-center justify-center flex-row shadow-lg mt-auto mb-6" style={{ backgroundColor: themeMode === 'light' ? 'black' : theme.primary }}>
                       <Text className="text-white font-bold text-xl mr-2">RSVP Now</Text>
                       <ArrowRight color="white" size={20} />
                    </TouchableOpacity>
                  </>
                )}
             </View>
          </View>
       </Modal>
    </ScrollView>
  );
}