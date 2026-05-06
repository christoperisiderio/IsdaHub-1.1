// app/(auth)/register.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { MUNICIPALITIES_WITH_BARANGAYS, COVERED_MUNICIPALITIES } from '../../constants/locations';
import { UserRole } from '../../types';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ mobile?: string; otpVerified?: string }>();
  const { register } = useAuthStore();
  const [form, setForm] = useState({
    fullName: '',
    mobile: params.mobile || '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    municipality: '',
    barangay: '',
    businessName: '',
    fisheryRegNumber: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(params.otpVerified === '1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((f) => {
      if (key === 'mobile') {
        setMobileVerified(false);
        setOtpSent(false);
        setOtpCode('');
      }
      return { ...f, [key]: val };
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required.';
    else if (!/^09\d{9}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid PH mobile number (09XXXXXXXXX).';
    if (!mobileVerified) e.mobile = 'Please verify your mobile number first.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.role) e.role = 'Please select a role.';
    if (!form.municipality) e.municipality = 'Please select your municipality.';
    if (!form.barangay) e.barangay = 'Please select your barangay.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = () => {
    if (!/^09\d{9}$/.test(form.mobile.trim())) {
      setErrors((prev) => ({ ...prev, mobile: 'Enter a valid PH mobile number (09XXXXXXXXX).' }));
      return;
    }
    setErrors((prev) => ({ ...prev, mobile: '', otp: '' }));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Presentation mode: any 6-digit OTP will verify.');
    }, 500);
  };

  const handleVerifyOtp = () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setErrors((prev) => ({ ...prev, otp: 'Enter a valid 6-digit OTP.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, otp: '' }));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMobileVerified(true);
      Alert.alert('Verified', 'Mobile number successfully verified.');
    }, 450);
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const result = register({
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
        role: form.role as UserRole,
        municipality: form.municipality,
        barangay: form.barangay,
        businessName: form.businessName || undefined,
        fisheryRegNumber: form.fisheryRegNumber || undefined,
      });
      setLoading(false);
      if (!result.success) {
        Alert.alert('Registration Failed', result.message);
      }
    }, 700);
  };

  const barangays = form.municipality ? MUNICIPALITIES_WITH_BARANGAYS[form.municipality] || [] : [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Join IsdaHub PH — fresh seafood marketplace</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          {/* Role Selection */}
          <Text style={styles.sectionLabel}>I am a…</Text>
          <View style={styles.roleRow}>
            {(['fisherman', 'buyer'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleCard, form.role === r && styles.roleCardActive]}
                onPress={() => set('role', r)}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>{r === 'fisherman' ? '🎣' : '🛒'}</Text>
                <Text style={[styles.roleLabel, form.role === r && styles.roleLabelActive]}>
                  {r === 'fisherman' ? 'Fisherman' : 'Buyer'}
                </Text>
                <Text style={styles.roleDesc}>
                  {r === 'fisherman' ? 'Sell your catch' : 'Buy fresh seafood'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

          <View style={styles.divider} />

          {/* Personal Info */}
          <Text style={styles.sectionLabel}>Personal Information</Text>

          <Input
            label="Full Name"
            placeholder="Juan Dela Cruz"
            value={form.fullName}
            onChangeText={(v) => set('fullName', v)}
            icon="person-outline"
            error={errors.fullName}
          />
          <Input
            label="Mobile Number"
            placeholder="09XXXXXXXXX"
            value={form.mobile}
            onChangeText={(v) => set('mobile', v)}
            icon="call-outline"
            keyboardType="phone-pad"
            rightText={mobileVerified ? 'Verified' : 'Verify'}
            onRightTextPress={mobileVerified ? undefined : handleSendOtp}
            error={errors.mobile}
          />
          {otpSent && !mobileVerified && (
            <Input
              label="OTP Code"
              placeholder="Enter 6-digit OTP"
              value={otpCode}
              onChangeText={setOtpCode}
              icon="key-outline"
              keyboardType="number-pad"
              maxLength={6}
              rightText="Verify OTP"
              onRightTextPress={handleVerifyOtp}
              error={errors.otp}
            />
          )}
          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={form.password}
            onChangeText={(v) => set('password', v)}
            icon="lock-closed-outline"
            isPassword
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChangeText={(v) => set('confirmPassword', v)}
            icon="lock-closed-outline"
            isPassword
            error={errors.confirmPassword}
          />

          <View style={styles.divider} />

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>
          <Text style={styles.sectionDesc}>Select your covered service area</Text>

          <View style={styles.pickerGroup}>
            <Text style={styles.pickerLabel}>Municipality</Text>
            <View style={styles.optionRow}>
              {COVERED_MUNICIPALITIES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.optionChip, form.municipality === m && styles.optionChipActive]}
                  onPress={() => { set('municipality', m); set('barangay', ''); }}
                >
                  <Text style={[styles.optionChipText, form.municipality === m && styles.optionChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.municipality && <Text style={styles.errorText}>{errors.municipality}</Text>}
          </View>

          {barangays.length > 0 && (
            <View style={styles.pickerGroup}>
              <Text style={styles.pickerLabel}>Barangay</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barangayScroll}>
                {barangays.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.optionChip, form.barangay === b && styles.optionChipActive]}
                    onPress={() => set('barangay', b)}
                  >
                    <Text style={[styles.optionChipText, form.barangay === b && styles.optionChipTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.barangay && <Text style={styles.errorText}>{errors.barangay}</Text>}
            </View>
          )}

          {/* Optional fields */}
          {form.role === 'buyer' && (
            <Input
              label="Business Name (Optional)"
              placeholder="Restaurant, store, or reseller name"
              value={form.businessName}
              onChangeText={(v) => set('businessName', v)}
              icon="business-outline"
            />
          )}
          {form.role === 'fisherman' && (
            <Input
              label="Fishery Registration No. (Optional)"
              placeholder="FR-XXXX-XXXX"
              value={form.fisheryRegNumber}
              onChangeText={(v) => set('fisheryRegNumber', v)}
              icon="document-text-outline"
            />
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.createBtn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1 },
  header: { paddingTop: 56, paddingBottom: 36, paddingHorizontal: 24 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  formCard: {
    flex: 1, backgroundColor: Colors.surface,
    marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingTop: 32,
  },
  sectionLabel: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  roleCard: {
    flex: 1, padding: 16, borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  roleEmoji: { fontSize: 32, marginBottom: 6 },
  roleLabel: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4, marginBottom: 8 },
  pickerGroup: { marginBottom: 16 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  barangayScroll: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  optionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  optionChipText: { fontSize: 13, color: Colors.text, fontFamily: 'Inter_500Medium' },
  optionChipTextActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  createBtn: { marginTop: 8, marginBottom: 20 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  loginText: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },
  loginLink: { fontSize: 14, color: Colors.primary, fontFamily: 'Inter_700Bold' },
});
