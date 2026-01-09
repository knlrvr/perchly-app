import { useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOOD_IMAGES, MOOD_LABELS, MOOD_ORDER, MoodType, useApp } from '../../context/AppContext';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DailyTab() {
  const { 
    entries, 
    colors, 
    selectedDate, 
    todayKey, 
    setSelectedDate, 
    saveEntry, 
    isToday, 
    isFuture,
    resetDailyToToday,
  } = useApp();

  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const entry = entries[selectedDate];
  const canEdit = isToday(selectedDate);
  const isFutureDate = isFuture(selectedDate);

  useFocusEffect(
    useCallback(() => {
      resetDailyToToday();
    }, [resetDailyToToday])
  );

  useEffect(() => {
    if (entry) {
      setSelectedMood(entry.mood);
      setNote(entry.note);
      setIsEditing(false);
    } else {
      setSelectedMood(null);
      setNote('');
      setIsEditing(canEdit);
    }
  }, [selectedDate, entry, canEdit]);

  const getDateParts = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      weekday: WEEKDAYS[date.getDay()],
      month: MONTHS[month - 1],
      day,
      year,
    };
  };

  const handleSave = async () => {
    if (!selectedMood || !canEdit) return;
    await saveEntry(selectedMood, note);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (entry) {
      setSelectedMood(entry.mood);
      setNote(entry.note);
    } else {
      setSelectedMood(null);
      setNote('');
    }
    setIsEditing(false);
  };

  const navigateDay = (direction: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + direction);
    const newKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(newKey);
  };

  const goToToday = () => {
    setSelectedDate(todayKey);
  };

  const dateParts = getDateParts();
  const showGoToToday = selectedDate !== todayKey;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateDay(-1)}
          >
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={showGoToToday ? goToToday : undefined}>
            <Text style={[styles.dateTitle, { color: colors.text }]}>{dateParts.weekday}</Text>
            <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>
              {dateParts.month} {dateParts.day}, {dateParts.year}
            </Text>
            {showGoToToday && (
              <Text style={[styles.tapHint, { color: colors.button }]}>Tap for today</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateDay(1)}
          >
            <ChevronRight color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {isFutureDate ? (
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyHeroCircle, { backgroundColor: colors.empty }]}>
              <Text style={[styles.emptyHeroText, { color: colors.textMuted }]}>?</Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Future Date</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Come back on this day to log your mood
            </Text>
          </View>
        ) : !entry && !canEdit ? (
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyHeroCircle, { backgroundColor: colors.empty }]}>
              <Text style={[styles.emptyHeroText, { color: colors.textMuted }]}>—</Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>No Entry</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              No mood was recorded for this day
            </Text>
          </View>
        ) : !isEditing && entry ? (
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={MOOD_IMAGES[entry.mood!]} style={styles.heroMoodImage} />
            <Text style={[styles.heroTitle, { color: colors.text }]}>{MOOD_LABELS[entry.mood!]}</Text>
            
            {entry.note ? (
              <View style={[styles.noteContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.noteText, { color: colors.text }]}>{entry.note}</Text>
              </View>
            ) : (
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>No note added</Text>
            )}

            {canEdit && (
              <TouchableOpacity
                style={[styles.editButton, { borderColor: colors.border }]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Entry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : canEdit ? (
          <View style={[styles.editCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>How are you feeling?</Text>

            <View style={styles.moodGrid}>
              {MOOD_ORDER.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodOption,
                    selectedMood === mood && styles.moodOptionSelected,
                    selectedMood === mood && { borderColor: colors.button },
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Image source={MOOD_IMAGES[mood!]} style={styles.moodOptionImage} />
                  <Text style={[
                    styles.moodOptionLabel,
                    { color: selectedMood === mood ? colors.text : colors.textSecondary }
                  ]}>
                    {MOOD_LABELS[mood!]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.noteLabel, { color: colors.text }]}>Add a note (optional)</Text>
            <TextInput
              style={[
                styles.noteInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={240}
              value={note}
              onChangeText={setNote}
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>{note.length}/240</Text>

            <View style={styles.formButtons}>
              {entry && (
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.buttonSecondary }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.button },
                  !selectedMood && styles.saveButtonDisabled,
                  !entry && { flex: 1 },
                ]}
                onPress={handleSave}
                disabled={!selectedMood}
              >
                <Text style={styles.saveButtonText}>{entry ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {isToday(selectedDate) && (
          <View style={[styles.todayBadge, { backgroundColor: colors.button }]}>
            <Text style={styles.todayBadgeText}>Today</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  dateTitle: {
    fontSize: 22,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  },
  dateSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    marginTop: 4,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroMoodImage: {
    width: 140,
    height: 140,
    borderRadius: 2,
    marginBottom: 16,
  },
  emptyHeroCircle: {
    width: 140,
    height: 140,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyHeroText: {
    fontSize: 48,
    fontFamily: 'Satoshi-Bold',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
  },
  noteContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Regular',
    lineHeight: 22,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  },
  todayBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },
  editCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  moodOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionSelected: {
    borderWidth: 2,
  },
  moodOptionImage: {
    width: 56,
    height: 56,
    borderRadius: 2,
    marginBottom: 6,
  },
  moodOptionLabel: {
    fontSize: 11,
    fontFamily: 'Satoshi-Medium',
  },
  noteLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  noteInput: {
    borderRadius: 2,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Satoshi-Regular',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
});