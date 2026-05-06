// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const { isAuthenticated, isGuest, currentUser } = useAuthStore();
  const [authHydrated, setAuthHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setAuthHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setAuthHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !authHydrated) return;

    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'fisherman') {
        router.replace('/(fisherman)');
      } else {
        router.replace('/(buyer)');
      }
    } else if (isGuest) {
      router.replace('/(buyer)');
    } else {
      router.replace('/splash');
    }
  }, [isAuthenticated, isGuest, currentUser, fontsLoaded, authHydrated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(fisherman)" />
          <Stack.Screen name="(buyer)" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="order-chat" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
