// app/(buyer)/history.tsx
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

export default function OrderHistoryScreen() {
  const { currentUser, isGuest } = useAuthStore();
  const { getOrdersByBuyer } = useOrdersStore();

  if (isGuest || !currentUser) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
          <Text style={styles.headerTitle}>Order History</Text>
        </LinearGradient>
        <View style={styles.guestState}>
          <Text style={styles.guestEmoji}>🔒</Text>
          <Text style={styles.guestTitle}>Login Required</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allOrders = getOrdersByBuyer(currentUser.id);
  const doneOrders = allOrders.filter((o) => ['completed', 'cancelled', 'declined'].includes(o.status));

  const totalSpent = doneOrders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{doneOrders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>₱{totalSpent.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {doneOrders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No order history</Text>
            <Text style={styles.emptyDesc}>Your completed orders will appear here.</Text>
          </View>
        ) : (
          doneOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/(buyer)/order-tracking', params: { orderId: order.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.fishType}>{order.fishType}</Text>
                  <Text style={styles.seller}>from {order.fishermanName}</Text>
                </View>
                <View style={styles.cardRight}>
                  <StatusBadge status={order.status} />
                  <Text style={styles.amount}>₱{order.total.toLocaleString()}</Text>
                  <Text style={styles.qty}>{order.quantityKg}kg</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.date}>
                  {new Date(order.updatedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
                <View style={styles.chip}>
                  <Ionicons name={order.fulfillment === 'pickup' ? 'walk-outline' : 'bicycle-outline'} size={12} color={Colors.muted} />
                  <Text style={styles.chipText}>{order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
                </View>
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
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 28 },
  headerTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.white },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  scroll: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  guestState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestEmoji: { fontSize: 48, marginBottom: 12 },
  guestTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 16 },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  loginBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.white },
  empty: { flex: 1, alignItems: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.muted, marginBottom: 2 },
  fishType: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  seller: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  qty: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_500Medium' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  date: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_400Regular' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_500Medium' },
});
