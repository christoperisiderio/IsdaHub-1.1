// app/(buyer)/orders.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/ui/Badge';
import { OrderStatus } from '../../types';

const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready_pickup', 'out_delivery'];

export default function BuyerOrdersScreen() {
  const { currentUser, isGuest } = useAuthStore();
  const { getOrdersByBuyer } = useOrdersStore();

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </LinearGradient>
        <View style={styles.guestState}>
          <Text style={styles.guestEmoji}>🔒</Text>
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestDesc}>Log in or create an account to track your orders.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) return null;
  const allOrders = getOrdersByBuyer(currentUser.id);
  const activeOrders = allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeOrders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptyDesc}>Your active orders will appear here.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/browse')}>
              <Text style={styles.browseBtnText}>Browse Fresh Catch</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/(buyer)/order-tracking', params: { orderId: order.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.fishType}>{order.fishType}</Text>
                </View>
                <StatusBadge status={order.status} />
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="scale-outline" size={14} color={Colors.muted} />
                  <Text style={styles.infoText}>{order.quantityKg}kg</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={14} color={Colors.muted} />
                  <Text style={styles.infoText}>₱{order.total.toLocaleString()}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name={order.fulfillment === 'pickup' ? 'walk-outline' : 'bicycle-outline'} size={14} color={Colors.muted} />
                  <Text style={styles.infoText}>{order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
                </View>
              </View>
              <Text style={styles.seller}>from {order.fishermanName}</Text>
              <View style={styles.viewRow}>
                <Text style={styles.viewText}>Track Order</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  guestState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestEmoji: { fontSize: 48, marginBottom: 12 },
  guestTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 8 },
  guestDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  loginBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.white },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, marginBottom: 24 },
  browseBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  browseBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.white },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.muted, marginBottom: 2 },
  fishType: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  infoRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  seller: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  viewText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.primary, marginRight: 4 },
});
