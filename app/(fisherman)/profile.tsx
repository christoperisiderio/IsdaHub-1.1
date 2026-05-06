// app/(fisherman)/profile.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

export default function FishermanProfile() {
  const { currentUser, logout } = useAuthStore();
  if (!currentUser) return null;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const menuItems = [
    { icon: 'fish-outline', label: 'My Listings', route: '/(fisherman)/my-listings', color: Colors.primary },
    { icon: 'receipt-outline', label: 'Order History', route: '/(fisherman)/orders', color: Colors.info },
    { icon: 'wallet-outline', label: 'Earnings', route: '/(fisherman)/earnings', color: Colors.success },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications', color: Colors.secondary },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null, color: Colors.muted },
    { icon: 'information-circle-outline', label: 'About IsdaHub PH', route: null, color: Colors.muted },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🎣</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.name}>{currentUser.fullName}</Text>
          <Text style={styles.role}>🎣 Fisherman</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.location}> {currentUser.barangay}, {currentUser.municipality}</Text>
          </View>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{currentUser.mobile}</Text>
          </View>
          {currentUser.fisheryRegNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoLabel}>Fishery Reg #</Text>
              <Text style={styles.infoValue}>{currentUser.fisheryRegNumber}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Verified</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>{new Date(currentUser.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long' })}</Text>
          </View>
        </View>

        {/* Menu */}
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

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
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
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarEmoji: { fontSize: 44 },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  name: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, marginBottom: 4 },
  role: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
  infoCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: -20,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10,
  },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.dark },
  statusBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  statusText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.success },
  menuCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.dark },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, backgroundColor: Colors.dangerLight, borderRadius: 14,
    padding: 14, gap: 8, marginBottom: 16, borderWidth: 1, borderColor: Colors.danger + '40',
  },
  logoutText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.danger },
  version: { textAlign: 'center', fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular' },
});
