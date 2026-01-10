import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { AppProvider, useApp } from '../context/AppContext';

import Confetti from '@/components/confetti';
import CrisisModal from '@/components/crisis-modal';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme, colors, showConfetti } = useApp();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      {showConfetti && <Confetti />}
      <CrisisModal />
    </View>
  );
}

export default function RootLayout() {
  // Satoshi fonts - download from https://www.fontshare.com/fonts/satoshi
  // Place .otf files in assets/fonts/
  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutContent />
    </AppProvider>
  );
}