import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_COLORS, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            <ChevronLeft color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={!isCurrentWeek ? goToCurrentWeek : undefined}>
            <Text style={[styles.weekTitle, { color: colors.text }]}>{formatWeekRange()}</Text>
            {!isCurrentWeek && (
              <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to go to current week</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateWeek(1)}
          >
            <ChevronRight color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.weekContainer, { borderColor: colors.border }]}>
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
                  { backgroundColor: colors.surface },
                  !isLast && { borderRightWidth: 1, borderRightColor: colors.border },
                ]}
                onPress={() => handleDayPress(date)}
              >
                {/* Top accent bar for today or mood */}
                <View 
                  style={[
                    styles.accentBar,
                    { 
                      backgroundColor: entry?.mood 
                        ? MOOD_COLORS[entry.mood]      // has entry → mood color (works for today or not)
                        : isToday 
                          ? colors.textSecondary       // today, no entry → muted gray
                          : 'transparent'              // not today, no entry → invisible
                    },
                  ]} 
                />
                
                <View style={styles.dayContent}>
                  <Text style={[styles.weekdayLabel, { color: colors.textSecondary }]}>
                    {WEEKDAYS[index]}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: isFuture ? colors.textMuted : colors.text },
                      isToday && entry?.mood ? { color: MOOD_COLORS[entry.mood] } : { color: colors.text },
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  
                  <View style={styles.moodContainer}>
                    {entry?.mood ? (
                      <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[entry.mood] }]} />
                    ) : (
                      <View style={[styles.moodDotEmpty, { borderColor: colors.border }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <MoodKey />

        <View style={styles.entriesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week's Entries</Text>
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
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryDate, { color: colors.text }]}>
                    {WEEKDAYS[date.getDay()]}, {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isToday && entry?.mood && <Text style={{ color: colors.textMuted }}> (Today)</Text>}
                  </Text>
                  {entry?.mood && (
                    <View style={[styles.moodIndicator, { backgroundColor: MOOD_COLORS[entry.mood] }]} />
                  )}
                </View>
                {entry?.note ? (
                  <Text style={[styles.entryNote, { color: colors.textSecondary }]} numberOfLines={2}>
                    {entry.note}
                  </Text>
                ) : entry ? (
                  <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>No note</Text>
                ) : (
                  <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>
                    {isFuture ? 'Future date' : 'No entry yet - tap to add'}
                  </Text>
                )}
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
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  weekContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    marginBottom: 20,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  dayContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  moodContainer: {
    marginTop: 8,
    height: 12,
    justifyContent: 'center',
  },
  moodDot: {
    width: 10,
    height: 10,
  },
  moodDotEmpty: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  moodKey: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
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
  entriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  entryCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodIndicator: {
    width: 14,
    height: 14,
  },
  entryNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  entryNoteEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});