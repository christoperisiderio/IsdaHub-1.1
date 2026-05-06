// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const { loginWithOtp, continueAsGuest, isRegisteredMobile } = useAuthStore();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; otp?: string }>({});

  const validateMobile = () => {
    const e: typeof errors = {};
    if (!mobile.trim()) e.mobile = 'Mobile number is required.';
    else if (!/^09\d{9}$/.test(mobile.trim())) e.mobile = 'Enter a valid PH mobile number (09XXXXXXXXX).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOtp = () => {
    const e: typeof errors = {};
    if (!mobile.trim()) e.mobile = 'Mobile number is required.';
    else if (!/^09\d{9}$/.test(mobile.trim())) e.mobile = 'Enter a valid PH mobile number (09XXXXXXXXX).';
    if (!otp.trim()) e.otp = 'OTP code is required.';
    else if (!/^\d{6}$/.test(otp.trim())) e.otp = 'Enter a valid 6-digit OTP.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateMobile()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'For presentation, any 6-digit OTP code will work.');
    }, 500);
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    setLoading(true);
    setTimeout(() => {
      const normalizedMobile = mobile.trim();
      if (!isRegisteredMobile(normalizedMobile)) {
        setLoading(false);
        Alert.alert(
          'Number not registered',
          'This mobile number is not registered yet. Continue to sign up.',
          [
            {
              text: 'Continue',
              onPress: () => router.push({
                pathname: '/(auth)/register',
                params: { mobile: normalizedMobile, otpVerified: '1' },
              }),
            },
          ]
        );
        return;
      }

      const result = loginWithOtp(mobile.trim(), otp.trim());
      setLoading(false);
      if (!result.success) Alert.alert('Verification Failed', result.message);
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
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.appName}>IsdaHub PH</Text>
              <Text style={styles.tagline}>Your Link from sea to doorstep.</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>Enter your mobile number, then input OTP to continue.</Text>

          <Input
            label="Mobile Number"
            placeholder="09XXXXXXXXX"
            value={mobile}
            onChangeText={setMobile}
            icon="call-outline"
            keyboardType="phone-pad"
            error={errors.mobile}
          />
          {otpSent && (
            <Input
              label="OTP Code"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              icon="key-outline"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.otp}
            />
          )}

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
            <Text style={styles.demoText}>
              {'  '}Presentation mode: no SMS API connected.{'\n'}
              {'  '}Any <Text style={styles.bold}>6-digit OTP</Text> will verify this number.
            </Text>
          </View>

          <Button
            title={otpSent ? 'Verify OTP' : 'Send OTP'}
            onPress={otpSent ? handleVerifyOtp : handleSendOtp}
            loading={loading}
            style={styles.loginBtn}
          />

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
  logoImage: { width: 40, height: 40, borderRadius: 10 },
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
