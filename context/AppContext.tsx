import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type MoodType = 'great' | 'good' | 'ok' | 'notgood' | 'bad' | null;
type ThemeType = 'dark' | 'light';

export interface DayEntry {
  mood: MoodType;
  note: string;
}

export interface EntriesData {
  [key: string]: DayEntry;
}

export const MOOD_COLORS: Record<string, string> = {
  great: '#22c55e',
  good: '#3b82f6',
  ok: '#eab308',
  notgood: '#f97316',
  bad: '#ef4444',
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
    background: '#0d1117',
    surface: '#161b22',
    border: '#30363d',
    text: '#fff',
    textSecondary: '#8b949e',
    textMuted: '#666',
    empty: '#1e1e1e',
    button: '#238636',
    buttonSecondary: '#21262d',
    tabBar: '#161b22',
    tabInactive: '#8b949e',
    tabActive: '#fff',
  },
  light: {
    background: '#ffffff',
    surface: '#f6f8fa',
    border: '#d0d7de',
    text: '#1f2328',
    textSecondary: '#656d76',
    textMuted: '#999',
    empty: '#ebedf0',
    button: '#2da44e',
    buttonSecondary: '#f3f4f6',
    tabBar: '#f6f8fa',
    tabInactive: '#656d76',
    tabActive: '#1f2328',
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
  const [theme, setTheme] = useState<ThemeType>('dark');
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