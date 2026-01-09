import { Tabs } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppContext';

const TAB_TITLES: Record<string, string> = {
  index: 'Year',
  monthly: 'Month',
  weekly: 'Week',
  daily: 'Day',
};

const HEADER_TITLES: Record<string, string> = {
  index: 'Overview',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
};

function Header({ routeName }: { routeName: string }) {
  const { colors, theme, toggleTheme } = useApp();
  const title = HEADER_TITLES[routeName] || 'Mood Tracker';

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: colors.background }]}
        onPress={toggleTheme}
      >
        {theme === 'dark' ? (
          <Sun color={colors.text} size={20} />
        ) : (
          <Moon color={colors.text} size={20} />
        )}
      </TouchableOpacity>
    </View>
  );
}

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const { colors } = useApp();

  const icons: Record<string, string> = {
    index: 'Y',
    monthly: 'M',
    weekly: 'W',
    daily: 'D',
  };

  return (
    <View style={styles.tabIconContainer}>
      <View
        style={[
          styles.tabIconBox,
          { 
            backgroundColor: focused ? colors.text : 'transparent',
            borderColor: focused ? colors.text : colors.tabInactive,
          },
        ]}
      >
        <Text
          style={[
            styles.tabIconText,
            { color: focused ? colors.background : colors.tabInactive },
          ]}
        >
          {icons[name]}
        </Text>
      </View>
      <Text 
        numberOfLines={1} 
        style={[styles.tabLabel, { color: focused ? colors.tabActive : colors.tabInactive }]}
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
          height: 120,
          paddingBottom: 20,
          paddingTop: 30,
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  tabIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 55,
  },
  tabIconText: {
    fontSize: 14,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});