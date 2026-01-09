import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export type MoodType = 'great' | 'good' | 'ok' | 'notgood' | 'bad' | null;
type ThemeType = 'dark' | 'light';

export interface DayEntry {
  mood: MoodType;
  note: string;
}

export interface EntriesData {
  [key: string]: DayEntry;
}

export const MOOD_IMAGES: Record<string, ImageSourcePropType> = {
  great: require('../assets/moods/perchly-great.png'),
  good: require('../assets/moods/perchly-good.png'),
  ok: require('../assets/moods/perchly-ok.png'),
  notgood: require('../assets/moods/perchly-notgood.png'),
  bad: require('../assets/moods/perchly-bad.png'),
};

export const MOOD_COLORS: Record<string, string> = {
  great: '#a8e6cf',
  good: '#88c9f2',
  ok: '#b8c5d6',
  notgood: '#d4a9c7',
  bad: '#e88a9e',
};

export const MOOD_LABELS: Record<string, string> = {
  great: 'Great',
  good: 'Good',
  ok: 'Ok',
  notgood: 'Not Good',
  bad: 'Bad',
};

export const MOOD_ORDER: MoodType[] = ['great', 'good', 'ok', 'notgood', 'bad'];

export const THEMES = {
  dark: {
    background: '#1a1a2e',
    surface: '#252542',
    border: '#3d3d5c',
    text: '#ffffff',
    textSecondary: '#a0a0b8',
    textMuted: '#6b6b80',
    empty: '#2d2d44',
    button: '#6c63ff',
    buttonSecondary: '#3d3d5c',
    tabBar: '#252542',
    tabInactive: '#6b6b80',
    tabActive: '#ffffff',
  },
  light: {
    background: '#f8f9fa',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#2d2d3a',
    textSecondary: '#6b6b80',
    textMuted: '#a0a0b0',
    empty: '#eef0f2',
    button: '#6c63ff',
    buttonSecondary: '#f0f0f5',
    tabBar: '#ffffff',
    tabInactive: '#a0a0b0',
    tabActive: '#2d2d3a',
  },
};

const STORAGE_KEY = '@mood_entries';
const THEME_KEY = '@theme_preference';

interface AppContextType {
  entries: EntriesData;
  theme: ThemeType;
  colors: typeof THEMES.dark;
  selectedDate: string;
  todayKey: string;
  toggleTheme: () => void;
  setSelectedDate: (date: string) => void;
  navigateToDate: (date: string) => void;
  resetDailyToToday: () => void;
  saveEntry: (mood: MoodType, note: string) => Promise<void>;
  formatDateKey: (date: Date) => string;
  formatDisplayDate: (dateKey: string, options?: Intl.DateTimeFormatOptions) => string;
  isToday: (dateKey: string) => boolean;
  isFuture: (dateKey: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<EntriesData>({});
  const [theme, setTheme] = useState<ThemeType>('light');
  const [selectedDate, setSelectedDate] = useState('');
  const [todayKey, setTodayKey] = useState('');
  const shouldResetDailyRef = useRef(true);

  const colors = THEMES[theme];

  useEffect(() => {
    const today = new Date();
    const key = formatDateKey(today);
    setTodayKey(key);
    setSelectedDate(key);
    loadEntries();
    loadTheme();
  }, []);

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDisplayDate = (
    dateKey: string,
    options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  ): string => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', options);
  };

  const isToday = (dateKey: string): boolean => {
    return dateKey === todayKey;
  };

  const isFuture = (dateKey: string): boolean => {
    return dateKey > todayKey;
  };

  const loadEntries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const saveEntry = async (mood: MoodType, note: string) => {
    if (!mood) return;

    const newEntries = {
      ...entries,
      [todayKey]: { mood, note },
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const navigateToDate = useCallback((date: string) => {
    shouldResetDailyRef.current = false;
    setSelectedDate(date);
  }, []);

  const resetDailyToToday = useCallback(() => {
    if (shouldResetDailyRef.current) {
      setSelectedDate(todayKey);
    }
    shouldResetDailyRef.current = true;
  }, [todayKey]);

  return (
    <AppContext.Provider
      value={{
        entries,
        theme,
        colors,
        selectedDate,
        todayKey,
        toggleTheme,
        setSelectedDate,
        navigateToDate,
        resetDailyToToday,
        saveEntry,
        formatDateKey,
        formatDisplayDate,
        isToday,
        isFuture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}