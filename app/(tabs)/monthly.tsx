import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_COLORS, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

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
            <View style={[styles.moodKeyDot, { backgroundColor: MOOD_COLORS[mood!] }]} />
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

  const calendarDays = generateCalendarDays();
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateMonth(-1)}
          >
            <Text style={[styles.navButtonText, { color: colors.text }]}>{'<'}</Text>
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateMonth(1)}
          >
            <Text style={[styles.navButtonText, { color: colors.text }]}>{'>'}</Text>
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
                    style={[
                      styles.dayCell,
                      isToday && [styles.todayCell, { borderColor: colors.button }],
                    ]}
                    onPress={() => handleDayPress(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: isFuture ? colors.textMuted : colors.text },
                        isToday && [styles.todayText, { color: colors.button }],
                      ]}
                    >
                      {day}
                    </Text>
                    {entry?.mood && (
                      <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[entry.mood] }]} />
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

        <MoodKey />

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
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  calendar: {
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
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    borderWidth: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayText: {
    fontWeight: '700',
  },
  moodDot: {
    width: 6,
    height: 6,
    marginTop: 2,
  },
  moodKey: {
    padding: 16,
    borderWidth: 1,
  },
  moodKeyTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    gap: 6,
  },
  moodKeyDot: {
    width: 12,
    height: 12,
  },
  moodKeyLabel: {
    fontSize: 12,
  },
});