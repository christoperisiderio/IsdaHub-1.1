// app/splash.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 700,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // At least ~2.8s on screen, but only redirect after auth has rehydrated from AsyncStorage
    const deadline = Date.now() + 2800;
    const redirect = () => {
      const { isAuthenticated, isGuest, currentUser } = useAuthStore.getState();
      if (isAuthenticated && currentUser) {
        if (currentUser.role === 'fisherman') {
          router.replace('/(fisherman)');
        } else {
          router.replace('/(buyer)');
        }
      } else if (isGuest) {
        router.replace('/(buyer)');
      } else {
        router.replace('/(auth)/login');
      }
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      const delay = Math.max(0, deadline - Date.now());
      timer = setTimeout(redirect, delay);
    };
    let unsub: (() => void) | undefined;
    if (useAuthStore.persist.hasHydrated()) arm();
    else unsub = useAuthStore.persist.onFinishHydration(() => arm());

    return () => {
      unsub?.();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <LinearGradient colors={[Colors.dark, Colors.primary, '#0D8B64']} style={styles.container}>
      {/* Ocean wave decoration */}
      <View style={styles.wavesContainer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🐟</Text>
        </View>
        <Text style={styles.appName}>IsdaHub</Text>
        <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
          <Text style={styles.tagline}>Fresh Seafood. Direct from Sea.</Text>
        </Animated.View>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loadingRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>

      <Text style={styles.footer}>Buenavista · Nasipit · Agusan del Norte</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wavesContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  wave: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    opacity: 0.07,
    backgroundColor: Colors.white,
  },
  wave1: { bottom: -width * 1.3, left: -width * 0.5 },
  wave2: { bottom: -width * 1.5, left: -width * 0.2, opacity: 0.05 },
  wave3: { bottom: -width * 1.6, left: -width * 0.8, opacity: 0.04 },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: { fontSize: 56 },
  appName: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  loadingRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.white, width: 24 },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.8,
  },
});
