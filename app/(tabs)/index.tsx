import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_COLORS, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

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

export default function OverviewTab() {
  const router = useRouter();
  const { entries, colors, formatDateKey, formatDisplayDate, todayKey, navigateToDate } = useApp();
  const [visibleEntries, setVisibleEntries] = useState(7);

  const generateYearGrid = () => {
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: { date: Date; key: string; isPast: boolean; isToday: boolean }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const key = formatDateKey(current);
      const isPast = current < today;
      const isToday = current.getTime() === today.getTime();
      days.push({ date: new Date(current), key, isPast, isToday });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getWeeksGrid = () => {
    const days = generateYearGrid();
    const weeks: (typeof days[0] | null)[][] = [];

    const firstDayOfWeek = days[0].date.getDay();
    const paddedDays: (typeof days[0] | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...days,
    ];

    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    return weeks;
  };

  const getAllEntriesSorted = () => {
    return Object.entries(entries)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, entry]) => ({ key, ...entry }));
  };

  const handleDayPress = (dateKey: string) => {
    navigateToDate(dateKey);
    router.push('/daily');
  };

  const weeks = getWeeksGrid();
  const sortedEntries = getAllEntriesSorted();
  const displayedEntries = sortedEntries.slice(0, visibleEntries);
  const hasMoreEntries = sortedEntries.length > visibleEntries;

  const screenWidth = Dimensions.get('window').width;
  const cellSize = Math.floor((screenWidth - 40) / 53);
  const cellMargin = 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.yearTitle, { color: colors.text }]}>{new Date().getFullYear()}</Text>

        <View style={styles.graphContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.grid}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.week}>
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <View
                          key={`empty-${dayIndex}`}
                          style={[
                            styles.cell,
                            {
                              width: cellSize,
                              height: cellSize,
                              margin: cellMargin,
                              backgroundColor: 'transparent',
                            },
                          ]}
                        />
                      );
                    }

                    const entry = entries[day.key];
                    const moodColor = entry?.mood ? MOOD_COLORS[entry.mood] : colors.empty;

                    return (
                      <TouchableOpacity
                        key={day.key}
                        onPress={() => handleDayPress(day.key)}
                        style={[
                          styles.cell,
                          {
                            width: cellSize,
                            height: cellSize,
                            margin: cellMargin,
                            backgroundColor: moodColor,
                            opacity: day.isPast || day.isToday ? 1 : 0.3,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <MoodKey />

        <View style={styles.entriesSection}>
          <Text style={[styles.entriesTitle, { color: colors.text }]}>Recent Entries</Text>
          {displayedEntries.length === 0 ? (
            <Text style={[styles.noEntries, { color: colors.textSecondary }]}>
              No entries yet. Add your first entry for today!
            </Text>
          ) : (
            <>
              {displayedEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.key}
                  style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleDayPress(entry.key)}
                >
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryDate, { color: colors.text }]}>
                      {formatDisplayDate(entry.key)}
                      {entry.key === todayKey && (
                        <Text style={{ color: colors.textSecondary }}> (Today)</Text>
                      )}
                    </Text>
                    <View
                      style={[styles.moodIndicator, { backgroundColor: MOOD_COLORS[entry.mood!] }]}
                    />
                  </View>
                  {entry.note ? (
                    <Text style={[styles.entryNote, { color: colors.textSecondary }]} numberOfLines={2}>
                      {entry.note}
                    </Text>
                  ) : (
                    <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>No note</Text>
                  )}
                </TouchableOpacity>
              ))}

              {hasMoreEntries && (
                <TouchableOpacity
                  style={[styles.showMoreButton, { borderColor: colors.border }]}
                  onPress={() => setVisibleEntries((prev) => prev + 7)}
                >
                  <Text style={[styles.showMoreText, { color: colors.textSecondary }]}>
                    Show 7 more ({sortedEntries.length - visibleEntries} remaining)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  yearTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  graphContainer: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
  },
  week: {
    flexDirection: 'column',
  },
  cell: {},
  moodKey: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
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
    flex: 1,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  noEntries: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  entryCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodIndicator: {
    width: 16,
    height: 16,
  },
  entryNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  entryNoteEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  showMoreButton: {
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});