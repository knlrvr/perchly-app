import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_IMAGES, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export default function WeeklyTab() {
  const router = useRouter();
  const { entries, colors, formatDateKey, navigateToDate, todayKey } = useApp();

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));

  const navigateWeek = (direction: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setWeekStart(newStart);
  };

  const getWeekDays = () => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatWeekRange = () => {
    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = endOfWeek.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const handleDayPress = (date: Date) => {
    const dateKey = formatDateKey(date);
    navigateToDate(dateKey);
    router.push('/daily');
  };

  const goToCurrentWeek = () => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  const weekDays = getWeekDays();
  const isCurrentWeek = formatDateKey(weekStart) === formatDateKey(getStartOfWeek(new Date()));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateWeek(-1)}
          >
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={!isCurrentWeek ? goToCurrentWeek : undefined}>
            <Text style={[styles.weekTitle, { color: colors.text }]}>{formatWeekRange()}</Text>
            {!isCurrentWeek && (
              <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap for current week</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateWeek(1)}
          >
            <ChevronRight color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.weekContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {weekDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const entry = entries[dateKey];
            const isToday = dateKey === todayKey;
            const isFuture = dateKey > todayKey;
            const isLast = index === 6;

            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.dayCard,
                  !isLast && { borderRightWidth: 1, borderRightColor: colors.border },
                ]}
                onPress={() => handleDayPress(date)}
              >
                <Text style={[
                  styles.weekdayLabel, 
                  { color: isToday ? colors.button : colors.textSecondary }
                ]}>
                  {WEEKDAYS[index]}
                </Text>
                
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
                        styles.dayNumber,
                        { color: isFuture ? colors.textMuted : colors.text },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                )}

                <Text style={[
                  styles.dateLabel, 
                  { color: isToday ? colors.button : colors.textMuted }
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* <MoodKey /> */}

        <View style={styles.entriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
          {weekDays.map((date) => {
            const dateKey = formatDateKey(date);
            const entry = entries[dateKey];
            const isToday = dateKey === todayKey;
            const isFuture = dateKey > todayKey;

            if (!entry && !isToday) return null;

            return (
              <TouchableOpacity
                key={dateKey}
                style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleDayPress(date)}
              >
                <View style={styles.entryLeft}>
                  {entry?.mood ? (
                    <Image source={MOOD_IMAGES[entry.mood]} style={styles.entryMoodImage} />
                  ) : (
                    <View style={[styles.entryEmptyCircle, { backgroundColor: colors.empty }]}>
                      <Text style={[styles.entryEmptyText, { color: colors.textMuted }]}>?</Text>
                    </View>
                  )}
                </View>
                <View style={styles.entryRight}>
                  <Text style={[styles.entryDate, { color: colors.text }]}>
                    {WEEKDAYS_FULL[date.getDay()]}, {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isToday && <Text style={{ color: colors.button }}> • Today</Text>}
                  </Text>
                  {entry?.note ? (
                    <Text style={[styles.entryNote, { color: colors.textSecondary }]} numberOfLines={2}>
                      {entry.note}
                    </Text>
                  ) : entry ? (
                    <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>No note added</Text>
                  ) : (
                    <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>
                      {isFuture ? 'Future date' : 'Tap to add entry'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

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
  weekTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  weekContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  moodCircle: {
    width: 40,
    height: 40,
    borderRadius: 2,
    overflow: 'hidden',
  },
  emptyCircle: {
    width: 40,
    height: 40,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 2,
  },
  moodImage: {
    width: '100%',
    height: '100%',
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Regular',
    marginTop: 6,
  },
  moodKey: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
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
  entriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 12,
  },
  entryCard: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 10,
    alignItems: 'center',
  },
  entryLeft: {
    marginRight: 14,
  },
  entryMoodImage: {
    width: 44,
    height: 44,
    borderRadius: 2,
  },
  entryEmptyCircle: {
    width: 44,
    height: 44,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryEmptyText: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  entryRight: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 4,
  },
  entryNote: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    lineHeight: 18,
  },
  entryNoteEmpty: {
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    fontStyle: 'italic',
  },
});