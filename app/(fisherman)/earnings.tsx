// app/(fisherman)/earnings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';

const PERIOD_TABS = ['Today', 'This Week', 'This Month', 'All Time'];

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}
function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function EarningsScreen() {
  const { currentUser } = useAuthStore();
  const { getOrdersByFisherman } = useOrdersStore();
  const [period, setPeriod] = useState(3);

  if (!currentUser) return null;
  const allOrders = getOrdersByFisherman(currentUser.id);
  const completed = allOrders.filter((o) => o.status === 'completed');
  const pending = allOrders.filter((o) => ['pending', 'accepted', 'preparing', 'ready_pickup', 'out_delivery'].includes(o.status));

  const todayEarnings = completed.filter((o) => isToday(o.updatedAt)).reduce((s, o) => s + o.total, 0);
  const weekEarnings = completed.filter((o) => isThisWeek(o.updatedAt)).reduce((s, o) => s + o.total, 0);
  const monthEarnings = completed.filter((o) => isThisMonth(o.updatedAt)).reduce((s, o) => s + o.total, 0);
  const allEarnings = completed.reduce((s, o) => s + o.total, 0);
  const pendingAmount = pending.reduce((s, o) => s + o.total, 0);

  const periodAmounts = [todayEarnings, weekEarnings, monthEarnings, allEarnings];

  const filterOrders = () => {
    if (period === 0) return completed.filter((o) => isToday(o.updatedAt));
    if (period === 1) return completed.filter((o) => isThisWeek(o.updatedAt));
    if (period === 2) return completed.filter((o) => isThisMonth(o.updatedAt));
    return completed;
  };

  const displayOrders = filterOrders();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <Text style={styles.earningsValue}>₱{periodAmounts[period].toLocaleString()}</Text>
          <Text style={styles.earningsPeriod}>{PERIOD_TABS[period]}</Text>

          {/* Mini stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{displayOrders.length}</Text>
              <Text style={styles.miniStatLabel}>Orders</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>₱{pendingAmount.toLocaleString()}</Text>
              <Text style={styles.miniStatLabel}>Pending</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{pending.length}</Text>
              <Text style={styles.miniStatLabel}>In Progress</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Period tabs */}
        <View style={styles.periodTabs}>
          {PERIOD_TABS.map((t, i) => (
            <TouchableOpacity
              key={t}
              style={[styles.periodTab, period === i && styles.periodTabActive]}
              onPress={() => setPeriod(i)}
            >
              <Text style={[styles.periodTabText, period === i && styles.periodTabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview cards */}
        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <Ionicons name="today-outline" size={18} color={Colors.primary} />
            <Text style={styles.overviewValue}>₱{todayEarnings.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>Today</Text>
          </View>
          <View style={styles.overviewCard}>
            <Ionicons name="calendar-outline" size={18} color={Colors.secondary} />
            <Text style={styles.overviewValue}>₱{weekEarnings.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>This Week</Text>
          </View>
          <View style={styles.overviewCard}>
            <Ionicons name="wallet-outline" size={18} color={Colors.success} />
            <Text style={styles.overviewValue}>₱{monthEarnings.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>This Month</Text>
          </View>
        </View>

        {/* Earnings history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales History</Text>
          {displayOrders.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💰</Text>
              <Text style={styles.emptyText}>No completed sales for this period.</Text>
            </View>
          ) : (
            displayOrders.map((order) => (
              <View key={order.id} style={styles.earningItem}>
                <View style={styles.earningLeft}>
                  <Text style={styles.earningFish}>{order.fishType}</Text>
                  <Text style={styles.earningBuyer}>{order.buyerName}</Text>
                  <Text style={styles.earningMeta}>
                    {order.quantityKg}kg · {new Date(order.updatedAt).toLocaleDateString('en-PH')}
                  </Text>
                </View>
                <View style={styles.earningRight}>
                  <Text style={styles.earningAmount}>+₱{order.total.toLocaleString()}</Text>
                  <Text style={styles.earningId}>#{order.id.slice(-6).toUpperCase()}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  earningsValue: { fontSize: 44, fontFamily: 'Nunito_900Black', color: Colors.white },
  earningsPeriod: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_500Medium', marginTop: 4, marginBottom: 20 },
  miniStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 12, width: '100%' },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  miniStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
  miniStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  periodTabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  periodTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  periodTabActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.primary },
  periodTabText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.muted },
  periodTabTextActive: { color: Colors.primary },
  overviewRow: { flexDirection: 'row', padding: 16, gap: 10 },
  overviewCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  overviewValue: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginVertical: 4 },
  overviewLabel: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular' },
  section: { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  earningItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  earningLeft: { flex: 1 },
  earningFish: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  earningBuyer: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', marginTop: 2 },
  earningMeta: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  earningRight: { alignItems: 'flex-end' },
  earningAmount: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.success },
  earningId: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_500Medium', marginTop: 2 },
});
