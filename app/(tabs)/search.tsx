import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOOD_COLORS, MOOD_IMAGES, MOOD_LABELS, useApp } from '../../context/AppContext';

export default function SearchTab() {
  const router = useRouter();
  const { colors, searchEntries, formatDisplayDate, navigateToDate, entries } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = query.length >= 2 ? searchEntries(query) : [];
  const totalEntries = Object.keys(entries).length;

  const handleResultPress = (dateKey: string) => {
    navigateToDate(dateKey);
    router.push('/daily');
  };

  const clearSearch = () => {
    setQuery('');
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <Text style={{ backgroundColor: colors.button + '40' }}>
          {text.substring(index, index + searchQuery.length)}
        </Text>
        {text.substring(index + searchQuery.length)}
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SearchIcon size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search moods or notes..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {query.length >= 2 ? (
          <View style={styles.resultsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
            </Text>

            {searchResults.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No entries found. Try a different search term.
                </Text>
              </View>
            ) : (
              searchResults.map(({ dateKey, entry }) => (
                <TouchableOpacity
                  key={dateKey}
                  style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleResultPress(dateKey)}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.resultLeft}>
                      {entry.mood && (
                        <Image source={MOOD_IMAGES[entry.mood]} style={styles.resultMoodImage} />
                      )}
                      <View>
                        <Text style={[styles.resultDate, { color: colors.text }]}>
                          {formatDisplayDate(dateKey, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                        {entry.mood && (
                          <Text style={[styles.resultMood, { color: MOOD_COLORS[entry.mood] }]}>
                            {MOOD_LABELS[entry.mood]}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {entry.note && (
                    <View style={[styles.notePreview, { borderLeftColor: colors.button }]}>
                      <Text style={[styles.notePreviewText, { color: colors.textSecondary }]} numberOfLines={3}>
                        {highlightMatch(entry.note, query)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Search Your Entries</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Search by mood (e.g., "great", "bad") or keywords in your notes.
            </Text>
            <Text style={[styles.statsText, { color: colors.textMuted }]}>
              {totalEntries} total {totalEntries === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        )}

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Regular',
  },
  resultsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  statsText: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    marginTop: 16,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultMoodImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  resultDate: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
  },
  resultMood: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    marginTop: 2,
  },
  notePreview: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  notePreviewText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    lineHeight: 20,
  },
});