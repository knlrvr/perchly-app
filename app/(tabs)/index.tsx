import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MOOD_COLORS, MOOD_IMAGES, MOOD_LABELS, MOOD_ORDER, useApp } from '../../context/AppContext';

const CIRCLE_GAP = 8;

function MoodKey() {
  const { colors } = useApp();

  return (
    <View style={[styles.moodKey, { backgroundColor: colors.surface }]}>
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

export default function OverviewTab() {
  const router = useRouter();
  const { entries, colors, formatDateKey, formatDisplayDate, todayKey, navigateToDate } = useApp();
  const [visibleEntries, setVisibleEntries] = useState(7);
  const { width: screenWidth } = useWindowDimensions();

  // Calculate circle size to fit ~18 per row (365 days ≈ 21 rows)
  const availableWidth = screenWidth - 32; // padding
  const circlesPerRow = 18;
  const circleSize = Math.floor((availableWidth - (CIRCLE_GAP * (circlesPerRow - 1))) / circlesPerRow);
  
  // Generate entire year
  const generateYearGrid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    
    const startDate = new Date(year, 0, 1); // Jan 1
    const endDate = new Date(year, 11, 31); // Dec 31
    
    const days: { date: Date; key: string; isToday: boolean; isFuture: boolean }[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const key = formatDateKey(current);
      const isToday = current.getTime() === today.getTime();
      const isFuture = current > today;
      days.push({ date: new Date(current), key, isToday, isFuture });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleDayPress = (dateKey: string) => {
    navigateToDate(dateKey);
    router.push('/daily');
  };

  const getAllEntriesSorted = () => {
    return Object.entries(entries)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, entry]) => ({ key, ...entry }));
  };

  const days = generateYearGrid();
  const sortedEntries = getAllEntriesSorted();
  const displayedEntries = sortedEntries.slice(0, visibleEntries);
  const hasMoreEntries = sortedEntries.length > visibleEntries;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Year Title */}
        <Text style={[styles.yearTitle, { color: colors.text }]}>{new Date().getFullYear()}</Text>
        
        {/* Circle Grid */}
        <View style={styles.gridContainer}>
          <View style={[styles.grid, { gap: CIRCLE_GAP }]}>
            {days.map((day) => {
              const entry = entries[day.key];
              const moodColor = entry?.mood ? MOOD_COLORS[entry.mood] : colors.empty;
              
              return (
                <TouchableOpacity
                  key={day.key}
                  onPress={() => handleDayPress(day.key)}
                  style={[
                    styles.circle,
                    {
                      width: circleSize,
                      height: circleSize,
                      backgroundColor: moodColor,
                      opacity: day.isFuture ? 0.4 : 1,
                      borderWidth: day.isToday ? 2 : 0,
                      borderColor: day.isToday ? colors.button : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.entriesSection}>
          <Text style={[styles.entriesTitle, { color: colors.text }]}>Recent Entries</Text>
          {displayedEntries.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No entries yet. Start tracking your mood today!
              </Text>
            </View>
          ) : (
            <>
              {displayedEntries.map((entry) => (
                <TouchableOpacity
                  key={entry.key}
                  style={[styles.entryCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleDayPress(entry.key)}
                >
                  <View style={styles.entryLeft}>
                    <Image source={MOOD_IMAGES[entry.mood!]} style={styles.entryMoodImage} />
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={[styles.entryDate, { color: colors.text }]}>
                      {formatDisplayDate(entry.key)}
                      {entry.key === todayKey && (
                        <Text style={{ color: colors.textMuted }}> • Today</Text>
                      )}
                    </Text>
                    {entry.note ? (
                      <Text style={[styles.entryNote, { color: colors.textSecondary }]} numberOfLines={2}>
                        {entry.note}
                      </Text>
                    ) : (
                      <Text style={[styles.entryNoteEmpty, { color: colors.textMuted }]}>No note</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {hasMoreEntries && (
                <TouchableOpacity
                  style={[styles.showMoreButton, { backgroundColor: colors.surface }]}
                  onPress={() => setVisibleEntries((prev) => prev + 7)}
                >
                  <Text style={[styles.showMoreText, { color: colors.text }]}>
                    Show more
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
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  gridContainer: {
    paddingVertical: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  circle: {
    borderRadius: 999,
  },
  moodKey: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
    borderRadius: 12,
  },
  moodKeyLabel: {
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  entriesSection: {
    flex: 1,
  },
  entriesTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
  },
  entryCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  entryLeft: {
    marginRight: 14,
  },
  entryMoodImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  showMoreButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
});