import { useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight, PenSquare } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOOD_COLORS, MOOD_LABELS, MOOD_ORDER, MoodType, useApp } from '../../context/AppContext';


const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
            <ChevronLeft color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={showGoToToday ? goToToday : undefined}>
            <Text style={[styles.dateTitle, { color: colors.text }]}>{dateParts.weekday}</Text>
            {showGoToToday && (
              <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to go to today</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigateDay(1)}
          >
            <ChevronRight color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.monthYear, { color: colors.textSecondary }]}>
            {dateParts.month} {dateParts.year}
          </Text>
          <Text style={[styles.dayNumber, { color: colors.text }]}>{dateParts.day}</Text>
          {isToday(selectedDate) && (
            <View style={[styles.todayBadge, { backgroundColor: colors.border }]}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
        </View>

        {/* <MoodKey /> */}

        {isFutureDate ? (
          <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>Future Date</Text>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              You can't add an entry for this day yet. Come back when it arrives!
            </Text>
          </View>
        ) : !entry && !canEdit ? (
          <View style={[styles.messageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.messageTitle, { color: colors.text }]}>No Entry</Text>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              No mood was recorded for this day.
            </Text>
          </View>
        ) : !isEditing && entry ? (
          <View style={[styles.entryDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryLabel, { color: colors.textSecondary }]}>Mood</Text>
              {canEdit && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <PenSquare color={colors.text} size={16} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.moodDisplay}>
              <View style={[styles.moodBadge, { backgroundColor: MOOD_COLORS[entry.mood!] }]}>
                <Text style={styles.moodLabel}>
                  {MOOD_LABELS[entry.mood!]}
                </Text>
              </View>
            </View>

            <Text style={[styles.entryLabel, { color: colors.textSecondary, marginTop: 20 }]}>Note</Text>
            {entry.note ? (
              <Text style={[styles.noteText, { color: colors.text }]}>{entry.note}</Text>
            ) : (
              <Text style={[styles.noteEmpty, { color: colors.textMuted }]}>No note added</Text>
            )}
          </View>
        ) : canEdit ? (
          <View style={[styles.editForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.text }]}>How was your day?</Text>

            <View style={styles.moodOptions}>
              {MOOD_ORDER.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    { backgroundColor: MOOD_COLORS[mood!] },
                    selectedMood === mood && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={styles.moodButtonText}>{MOOD_LABELS[mood!]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, { color: colors.text, marginTop: 20 }]}>
              Add a note (optional)
            </Text>
            <TextInput
              style={[
                styles.noteInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="What happened today?"
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
                  style={[styles.cancelButton, { backgroundColor: colors.buttonSecondary, borderColor: colors.border }]}
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
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  calendarCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 64,
    fontWeight: '700',
  },
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  messageCard: {
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  entryDisplay: {
    borderWidth: 1,
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodDisplay: {
    alignItems: 'flex-start',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  moodLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  noteEmpty: {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 8,
  },
  editForm: {
    borderWidth: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  moodButtonSelected: {
    opacity: 1,
    borderWidth: 3,
    borderColor: '#fff',
  },
  moodButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  noteInput: {
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});