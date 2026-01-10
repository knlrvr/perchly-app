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

export interface UserProfile {
  name: string;
  createdAt: string;
}

export interface StreakData {
  current: number;
  longest: number;
  totalDays: number;
  lastLoggedDate: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export const BADGES: Badge[] = [
  { id: 'first_entry', name: 'First Steps', description: 'Log your first mood', icon: '🐣', unlockedAt: null },
  { id: 'week_streak', name: 'Week Warrior', description: '7 day streak', icon: '🔥', unlockedAt: null },
  { id: 'month_streak', name: 'Monthly Master', description: '30 day streak', icon: '⭐', unlockedAt: null },
  { id: 'hundred_days', name: 'Century Club', description: 'Log 100 days total', icon: '💯', unlockedAt: null },
  { id: 'great_week', name: 'Great Week', description: '7 great days in a row', icon: '🌟', unlockedAt: null },
  { id: 'note_writer', name: 'Reflector', description: 'Write 10 notes', icon: '📝', unlockedAt: null },
  { id: 'fifty_notes', name: 'Storyteller', description: 'Write 50 notes', icon: '📖', unlockedAt: null },
  { id: 'two_weeks', name: 'Fortnight', description: '14 day streak', icon: '🏆', unlockedAt: null },
];

export const MOOD_IMAGES: Record<string, ImageSourcePropType> = {
  great: require('../assets/moods/perchly-great.png'),
  good: require('../assets/moods/perchly-good.png'),
  ok: require('../assets/moods/perchly-ok.png'),
  notgood: require('../assets/moods/perchly-notgood.png'),
  bad: require('../assets/moods/perchly-bad.png'),
  sus: require('../assets/images/sus.png')
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
    danger: '#e88a9e',
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
    danger: '#e55050',
  },
};

const STORAGE_KEY = '@mood_entries';
const THEME_KEY = '@theme_preference';
const PROFILE_KEY = '@user_profile';
const BADGES_KEY = '@user_badges';

// Helper functions defined outside component
const formatDateKeyHelper = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const calculateStreakHelper = (entriesData: EntriesData): StreakData => {
  const sortedDates = Object.keys(entriesData).sort((a, b) => b.localeCompare(a));
  
  if (sortedDates.length === 0) {
    return { current: 0, longest: 0, totalDays: 0, lastLoggedDate: null };
  }

  const totalDays = sortedDates.length;
  const lastLoggedDate = sortedDates[0];
  
  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  
  // If we haven't logged today, start from yesterday
  const todayKeyLocal = formatDateKeyHelper(checkDate);
  if (!entriesData[todayKeyLocal]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const dateKey = formatDateKeyHelper(checkDate);
    if (entriesData[dateKey]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedAsc = [...sortedDates].sort((a, b) => a.localeCompare(b));
  
  for (let i = 0; i < sortedAsc.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(sortedAsc[i]);
      const prevDate = new Date(sortedAsc[i - 1]);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return {
    current: currentStreak,
    longest: longestStreak,
    totalDays,
    lastLoggedDate,
  };
};

const unlockBadge = (badgeId: string, badgesList: Badge[]): Badge[] => {
  return badgesList.map(b => 
    b.id === badgeId && !b.unlockedAt 
      ? { ...b, unlockedAt: new Date().toISOString() } 
      : b
  );
};

const checkBadgesForEntries = (entriesData: EntriesData, currentBadges: Badge[]): Badge[] => {
  let updatedBadges = [...currentBadges];
  const entryCount = Object.keys(entriesData).length;
  
  if (entryCount === 0) return currentBadges;

  // First entry badge
  if (entryCount >= 1) {
    updatedBadges = unlockBadge('first_entry', updatedBadges);
  }

  // 100 days badge
  if (entryCount >= 100) {
    updatedBadges = unlockBadge('hundred_days', updatedBadges);
  }

  // Note badges
  const totalNotes = Object.values(entriesData).filter(e => e.note && e.note.trim()).length;
  if (totalNotes >= 10) {
    updatedBadges = unlockBadge('note_writer', updatedBadges);
  }
  if (totalNotes >= 50) {
    updatedBadges = unlockBadge('fifty_notes', updatedBadges);
  }

  // Streak badges
  const streakData = calculateStreakHelper(entriesData);
  if (streakData.current >= 7 || streakData.longest >= 7) {
    updatedBadges = unlockBadge('week_streak', updatedBadges);
  }
  if (streakData.current >= 14 || streakData.longest >= 14) {
    updatedBadges = unlockBadge('two_weeks', updatedBadges);
  }
  if (streakData.current >= 30 || streakData.longest >= 30) {
    updatedBadges = unlockBadge('month_streak', updatedBadges);
  }

  // Great week badge (check for any 7 consecutive great days in history)
  const sortedDates = Object.keys(entriesData).sort((a, b) => a.localeCompare(b));
  let consecutiveGreatDays = 0;
  for (const dateKey of sortedDates) {
    if (entriesData[dateKey].mood === 'great') {
      consecutiveGreatDays++;
      if (consecutiveGreatDays >= 7) {
        updatedBadges = unlockBadge('great_week', updatedBadges);
        break;
      }
    } else {
      consecutiveGreatDays = 0;
    }
  }

  return updatedBadges;
};

interface AppContextType {
  entries: EntriesData;
  theme: ThemeType;
  colors: typeof THEMES.dark;
  selectedDate: string;
  todayKey: string;
  profile: UserProfile | null;
  badges: Badge[];
  streak: StreakData;
  showConfetti: boolean;
  showCrisisModal: boolean;
  toggleTheme: () => void;
  setSelectedDate: (date: string) => void;
  navigateToDate: (date: string) => void;
  resetDailyToToday: () => void;
  saveEntry: (mood: MoodType, note: string) => Promise<void>;
  setShowConfetti: (show: boolean) => void;
  setShowCrisisModal: (show: boolean) => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  formatDateKey: (date: Date) => string;
  formatDisplayDate: (dateKey: string, options?: Intl.DateTimeFormatOptions) => string;
  isToday: (dateKey: string) => boolean;
  isFuture: (dateKey: string) => boolean;
  searchEntries: (query: string) => { dateKey: string; entry: DayEntry }[];
  getAnalytics: () => {
    moodCounts: Record<string, number>;
    dayOfWeekAverages: Record<string, { total: number; count: number }>;
    totalNotes: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<EntriesData>({});
  const [theme, setTheme] = useState<ThemeType>('light');
  const [selectedDate, setSelectedDate] = useState('');
  const [todayKey, setTodayKey] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const shouldResetDailyRef = useRef(true);

  const colors = THEMES[theme];

  const formatDateKey = formatDateKeyHelper;

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

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      const today = new Date();
      const key = formatDateKeyHelper(today);
      setTodayKey(key);
      setSelectedDate(key);
      
      // Load theme
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }

      // Load profile
      try {
        const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }

      // Load entries
      let loadedEntries: EntriesData = {};
      try {
        const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedEntries) {
          loadedEntries = JSON.parse(storedEntries);
          setEntries(loadedEntries);
        }
      } catch (error) {
        console.error('Failed to load entries:', error);
      }

      // Load badges
      let loadedBadges: Badge[] = BADGES;
      try {
        const storedBadges = await AsyncStorage.getItem(BADGES_KEY);
        if (storedBadges) {
          loadedBadges = JSON.parse(storedBadges);
        }
      } catch (error) {
        console.error('Failed to load badges:', error);
      }

      // Check and update badges based on entries
      if (Object.keys(loadedEntries).length > 0) {
        const updatedBadges = checkBadgesForEntries(loadedEntries, loadedBadges);
        if (JSON.stringify(updatedBadges) !== JSON.stringify(loadedBadges)) {
          setBadges(updatedBadges);
          try {
            await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(updatedBadges));
          } catch (error) {
            console.error('Failed to save badges:', error);
          }
        } else {
          setBadges(loadedBadges);
        }
      } else {
        setBadges(loadedBadges);
      }
    };
    
    initializeApp();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const streak = calculateStreakHelper(entries);

  const saveEntry = async (mood: MoodType, note: string) => {
    if (!mood) return;

    const newEntries = {
      ...entries,
      [todayKey]: { mood, note },
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);

      // Check for confetti (great day)
      if (mood === 'great') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Check for crisis modal (5+ consecutive bad days)
      const sortedDates = Object.keys(newEntries).sort((a, b) => b.localeCompare(a));
      let consecutiveBadDays = 0;
      for (const dateKey of sortedDates) {
        if (newEntries[dateKey].mood === 'bad') {
          consecutiveBadDays++;
        } else {
          break;
        }
      }
      if (consecutiveBadDays >= 5) {
        setShowCrisisModal(true);
      }

      // Check and update badges
      const updatedBadges = checkBadgesForEntries(newEntries, badges);
      if (JSON.stringify(updatedBadges) !== JSON.stringify(badges)) {
        setBadges(updatedBadges);
        await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(updatedBadges));
      }

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

  const searchEntries = useCallback((query: string): { dateKey: string; entry: DayEntry }[] => {
    const lowerQuery = query.toLowerCase();
    const results: { dateKey: string; entry: DayEntry }[] = [];

    Object.entries(entries).forEach(([dateKey, entry]) => {
      // Check if mood matches
      const moodMatches = entry.mood && MOOD_LABELS[entry.mood].toLowerCase().includes(lowerQuery);
      
      // Check if note matches
      const noteMatches = entry.note && entry.note.toLowerCase().includes(lowerQuery);

      if (moodMatches || noteMatches) {
        results.push({ dateKey, entry });
      }
    });

    return results.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [entries]);

  const getAnalytics = useCallback(() => {
    const moodCounts: Record<string, number> = {
      great: 0,
      good: 0,
      ok: 0,
      notgood: 0,
      bad: 0,
    };

    const dayOfWeekData: Record<string, { total: number; count: number }> = {
      Sun: { total: 0, count: 0 },
      Mon: { total: 0, count: 0 },
      Tue: { total: 0, count: 0 },
      Wed: { total: 0, count: 0 },
      Thu: { total: 0, count: 0 },
      Fri: { total: 0, count: 0 },
      Sat: { total: 0, count: 0 },
    };

    const moodValues: Record<string, number> = {
      great: 5,
      good: 4,
      ok: 3,
      notgood: 2,
      bad: 1,
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let totalNotes = 0;

    Object.entries(entries).forEach(([dateKey, entry]) => {
      if (!entry.mood) return;

      // Mood counts
      moodCounts[entry.mood]++;

      // Note count
      if (entry.note && entry.note.trim()) {
        totalNotes++;
      }

      const moodValue = moodValues[entry.mood];
      const [year, month, day] = dateKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Day of week
      const dayName = dayNames[date.getDay()];
      dayOfWeekData[dayName].total += moodValue;
      dayOfWeekData[dayName].count++;
    });

    return {
      moodCounts,
      dayOfWeekAverages: dayOfWeekData,
      totalNotes,
    };
  }, [entries]);

  return (
    <AppContext.Provider
      value={{
        entries,
        theme,
        colors,
        selectedDate,
        todayKey,
        profile,
        badges,
        streak,
        showConfetti,
        showCrisisModal,
        toggleTheme,
        setSelectedDate,
        navigateToDate,
        resetDailyToToday,
        saveEntry,
        setShowConfetti,
        setShowCrisisModal,
        updateProfile,
        formatDateKey,
        formatDisplayDate,
        isToday,
        isFuture,
        searchEntries,
        getAnalytics,
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