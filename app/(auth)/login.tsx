// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const { login, continueAsGuest } = useAuthStore();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!mobile.trim()) e.mobile = 'Mobile number is required.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const result = login(mobile.trim(), password);
      setLoading(false);
      if (!result.success) {
        Alert.alert('Login Failed', result.message);
      }
    }, 600);
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(buyer)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🐟</Text>
            </View>
            <View>
              <Text style={styles.appName}>IsdaHub</Text>
              <Text style={styles.tagline}>Fresh seafood, direct from sea.</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Log in to continue trading seafood.</Text>

          <Input
            label="Mobile Number"
            placeholder="09XXXXXXXXX"
            value={mobile}
            onChangeText={setMobile}
            icon="call-outline"
            keyboardType="phone-pad"
            error={errors.mobile}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            isPassword
            error={errors.password}
          />

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
            <Text style={styles.demoText}>
              {'  '}Demo — Fisherman: <Text style={styles.bold}>09171234567</Text>{' / '}
              Buyer: <Text style={styles.bold}>09271234567</Text>{'\n'}
              {'         '}Password: <Text style={styles.bold}>123456</Text>
            </Text>
          </View>

          <Button title="Log In" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continue as Guest"
            onPress={handleGuest}
            variant="ghost"
            style={styles.guestBtn}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoBox: {
    width: 58, height: 58, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 28, fontFamily: 'Nunito_900Black', color: Colors.white, letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_500Medium' },
  formCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 32,
  },
  title: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', marginBottom: 28 },
  demoHint: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  demoText: { fontSize: 12, color: Colors.info, fontFamily: 'Inter_400Regular', flex: 1 },
  bold: { fontFamily: 'Inter_700Bold' },
  loginBtn: { marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 12, color: Colors.muted, marginHorizontal: 12, fontFamily: 'Inter_600SemiBold' },
  guestBtn: { marginBottom: 24 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },
  signupLink: { fontSize: 14, color: Colors.primary, fontFamily: 'Inter_700Bold' },
});
