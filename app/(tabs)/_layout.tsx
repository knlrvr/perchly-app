import { Tabs } from 'expo-router';
import { Calendar, CalendarDays, CalendarRange, Moon, PenSquare, Search, Sun, User } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOOD_IMAGES, useApp } from '../../context/AppContext';

const TAB_TITLES: Record<string, string> = {
  index: 'Year',
  monthly: 'Month',
  weekly: 'Week',
  daily: 'Day',
  search: 'Search',
  profile: 'Profile',
};

const HEADER_TITLES: Record<string, string> = {
  index: 'Overview',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
  search: 'Search',
  profile: 'Profile',
};

function Header({ routeName }: { routeName: string }) {
  const { colors, theme, toggleTheme } = useApp();
  const title = HEADER_TITLES[routeName] || 'Perchly';

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        <Image source={MOOD_IMAGES.good} style={styles.headerBird} />
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      </View>
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={toggleTheme}
      >
        {theme === 'dark' ? (
          <Sun size={20} color={colors.text} />
        ) : (
          <Moon size={20} color={colors.text} />
        )}
      </TouchableOpacity>
    </View>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors } = useApp();
  
  const iconSize = 22;
  const iconColor = focused ? colors.tabActive : colors.tabInactive;

  const icons: Record<string, React.ReactNode> = {
    index: <CalendarDays size={iconSize} color={iconColor} />,
    monthly: <Calendar size={iconSize} color={iconColor} />,
    weekly: <CalendarRange size={iconSize} color={iconColor} />,
    daily: <PenSquare size={iconSize} color={iconColor} />,
    search: <Search size={iconSize} color={iconColor} />,
    profile: <User size={iconSize} color={iconColor} />,
  };

  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.iconWrapper}>
        {icons[name]}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color: focused ? colors.tabActive : colors.tabInactive },
        ]}
      >
        {TAB_TITLES[name]}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useApp();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        header: () => <Header routeName={route.name} />,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 90,
          paddingBottom: 24,
          paddingTop: 12,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          minWidth: 0,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="monthly" />
      <Tabs.Screen name="weekly" />
      <Tabs.Screen name="daily" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  headerBird: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    flexShrink: 1,
  },
  themeToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 22,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Satoshi-Medium',
    marginTop: 6,
    textAlign: 'center',
  },
});