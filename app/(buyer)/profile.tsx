// app/(buyer)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

export default function BuyerProfile() {
  const { currentUser, isGuest, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.guestHeader}>
          <View style={styles.guestAvatar}><Text style={{ fontSize: 44 }}>👤</Text></View>
          <Text style={styles.guestTitle}>Guest User</Text>
          <Text style={styles.guestSub}>Browsing mode only</Text>
        </LinearGradient>
        <View style={styles.guestCTA}>
          <Text style={styles.guestCTATitle}>Join IsdaHub PH today!</Text>
          <Text style={styles.guestCTADesc}>Log in or create an account to place orders, track deliveries, and more.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) return null;

  const menuItems = [
    { icon: 'receipt-outline', label: 'My Orders', route: '/(buyer)/orders', color: Colors.primary },
    { icon: 'time-outline', label: 'Order History', route: '/(buyer)/history', color: Colors.info },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications', color: Colors.secondary },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null, color: Colors.muted },
    { icon: 'information-circle-outline', label: 'About IsdaHub PH', route: null, color: Colors.muted },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🛒</Text>
          </View>
          <Text style={styles.name}>{currentUser.fullName}</Text>
          <Text style={styles.role}>🛒 Buyer</Text>
          {currentUser.businessName && <Text style={styles.business}>{currentUser.businessName}</Text>}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.location}> {currentUser.barangay}, {currentUser.municipality}</Text>
          </View>
        </LinearGradient>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{currentUser.mobile}</Text>
          </View>
          {currentUser.businessName && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoLabel}>Business</Text>
              <Text style={styles.infoValue}>{currentUser.businessName}</Text>
            </View>
          )}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>{new Date(currentUser.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long' })}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.mutedLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>IsdaHub PH v1.0 · Agusan del Norte</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { paddingTop: 20, paddingBottom: 36, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  avatarEmoji: { fontSize: 44 },
  name: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, marginBottom: 4 },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  business: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_500Medium', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
  infoCard: { backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.dark },
  menuCard: { backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.dark },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, backgroundColor: Colors.dangerLight, borderRadius: 14, padding: 14, gap: 8, marginBottom: 16, borderWidth: 1, borderColor: Colors.danger + '40' },
  logoutText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.danger },
  version: { textAlign: 'center', fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular' },
  guestHeader: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  guestAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  guestTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  guestSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  guestCTA: { flex: 1, padding: 24 },
  guestCTATitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 8 },
  guestCTADesc: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 24 },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  loginBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.white },
  registerBtn: { backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  registerBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.primary },
});
