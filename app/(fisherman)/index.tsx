// app/(fisherman)/index.tsx — Fisherman Dashboard
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { useOrdersStore } from '../../store/ordersStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Colors } from '../../constants/Colors';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';

export default function FishermanDashboard() {
  const { currentUser } = useAuthStore();
  const { getListingsByFisherman } = useListingsStore();
  const { getOrdersByFisherman } = useOrdersStore();
  const { getUserNotifications, getUnreadCount } = useNotificationsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  if (!currentUser) return null;

  const listings = getListingsByFisherman(currentUser.id);
  const orders = getOrdersByFisherman(currentUser.id);
  const notifications = getUserNotifications(currentUser.id);
  const unread = getUnreadCount(currentUser.id);

  const activeListings = listings.filter((l) => l.status === 'active').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'accepted' || o.status === 'preparing').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalEarnings = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 3);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const quickActions = [
    { label: 'Add Catch', icon: 'add-circle', color: Colors.primary, route: '/(fisherman)/add-catch' },
    { label: 'My Listings', icon: 'fish', color: Colors.accent, route: '/(fisherman)/my-listings' },
    { label: 'Orders', icon: 'receipt', color: Colors.secondary, route: '/(fisherman)/orders' },
    { label: 'Earnings', icon: 'wallet', color: Colors.success, route: '/(fisherman)/earnings' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning! 🎣</Text>
              <Text style={styles.userName}>{currentUser.fullName}</Text>
              <Text style={styles.location}>
                <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
                {' '}{currentUser.barangay}, {currentUser.municipality}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              {unread > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Earnings highlight */}
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>₱{totalEarnings.toLocaleString()}</Text>
            <Text style={styles.earningsSub}>{completedOrders} completed orders</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard label="Active Listings" value={activeListings} icon="fish-outline" color={Colors.primary} bg={Colors.overlay} />
            <StatCard label="Pending Orders" value={pendingOrders} icon="time-outline" color={Colors.warning} bg={Colors.warningLight} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="In Progress" value={confirmedOrders} icon="sync-outline" color={Colors.info} bg={Colors.infoLight} />
            <StatCard label="Completed" value={completedOrders} icon="checkmark-circle-outline" color={Colors.success} bg={Colors.successLight} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionBtn}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon as any} size={26} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/(fisherman)/orders')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No orders yet. Post your catch to get started!</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push({ pathname: '/(fisherman)/order-detail', params: { orderId: order.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderFish}>{order.fishType}</Text>
                  <Text style={styles.orderBuyer}>{order.buyerName}</Text>
                  <Text style={styles.orderMeta}>{order.quantityKg}kg · ₱{order.total.toLocaleString()}</Text>
                </View>
                <View style={styles.orderRight}>
                  <StatusBadge status={order.status} />
                  <Ionicons name="chevron-forward" size={16} color={Colors.muted} style={{ marginTop: 6 }} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Notifications */}
        {notifications.slice(0, 2).map((n) => (
          <View key={n.id} style={[styles.notifCard, !n.read && styles.notifCardUnread]}>
            <Ionicons name="notifications" size={18} color={n.read ? Colors.muted : Colors.primary} />
            <View style={styles.notifContent}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifMsg} numberOfLines={1}>{n.message}</Text>
            </View>
            {!n.read && <View style={styles.unreadDot} />}
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium' },
  userName: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, marginTop: 2 },
  location: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  notifBtn: { padding: 8, position: 'relative' },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: Colors.danger, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, color: Colors.white, fontFamily: 'Inter_700Bold' },
  earningsCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  earningsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium' },
  earningsValue: { fontSize: 32, fontFamily: 'Nunito_900Black', color: Colors.white, marginVertical: 4 },
  earningsSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' },
  statsContainer: { padding: 16, paddingTop: 20 },
  statsRow: { flexDirection: 'row', marginBottom: 0 },
  section: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  seeAll: { fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: { width: '47%', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.dark },
  emptyState: { alignItems: 'center', paddingVertical: 32, backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  orderLeft: { flex: 1 },
  orderFish: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  orderBuyer: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', marginTop: 2 },
  orderMeta: { fontSize: 13, color: Colors.primary, fontFamily: 'Inter_700Bold', marginTop: 4 },
  orderRight: { alignItems: 'flex-end' },
  notifCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  notifCardUnread: { borderColor: Colors.primary + '40', backgroundColor: Colors.overlay },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.dark },
  notifMsg: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});
