import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_IMAGES, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function MoodKey() {
  const { colors } = useApp();

  return (
    <View style={[styles.moodKey, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.moodKeyTitle, { color: colors.text }]}>Mood Key</Text>
      <View style={styles.moodKeyItems}>
        {MOOD_ORDER.map((mood) => (
          <View key={mood} style={styles.moodKeyItem}>
            <Image source={MOOD_IMAGES[mood!]} style={styles.moodKeyImage} />
            <Text style={[styles.moodKeyLabel, { color: colors.textSecondary }]}>
              {MOOD_LABELS[mood!]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MonthlyTab() {
  const router = useRouter();
  const { entries, colors, navigateToDate, todayKey } = useApp();
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleDayPress = (day: number) => {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigateToDate(dateKey);
    router.push('/daily');
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const calendarDays = generateCalendarDays();
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateMonth(-1)}
          >
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={!isCurrentMonth ? goToCurrentMonth : undefined}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            {!isCurrentMonth && (
              <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap for current month</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateMonth(1)}
          >
            <ChevronRight color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.calendar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: colors.textSecondary }]}>{day}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <View key={`empty-${dayIndex}`} style={styles.dayCell} />;
                }

                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = entries[dateKey];
                const isToday = dateKey === todayKey;
                const isFuture = dateKey > todayKey;

                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.dayCell}
                    onPress={() => handleDayPress(day)}
                  >
                    {entry?.mood ? (
                      <View style={[
                        styles.moodCircle,
                        isToday && styles.todayCircle,
                        isToday && { borderColor: colors.button }
                      ]}>
                        <Image source={MOOD_IMAGES[entry.mood]} style={styles.moodImage} />
                      </View>
                    ) : (
                      <View style={[
                        styles.emptyCircle,
                        { backgroundColor: 'transparent' },
                        isToday && styles.todayCircle,
                        isToday && { borderColor: colors.button }
                      ]}>
                        <Text
                          style={[
                            styles.dayText,
                            { color: isFuture ? colors.textMuted : colors.textSecondary },
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              {week.length < 7 &&
                Array(7 - week.length)
                  .fill(null)
                  .map((_, i) => <View key={`pad-${i}`} style={styles.dayCell} />)}
            </View>
          ))}
        </View>

        {/* <MoodKey /> */}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 22,
  },
  monthTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  calendar: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  moodCircle: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  emptyCircle: {
    width: '90%',
    aspectRatio: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 3,
  },
  moodImage: {
    width: '100%',
    height: '100%',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  moodKey: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  moodKeyTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 12,
  },
  moodKeyItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  moodKeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodKeyImage: {
    width: 24,
    height: 24,
    borderRadius: 2,
  },
  moodKeyLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
});