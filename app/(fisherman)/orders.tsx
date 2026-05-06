// app/(fisherman)/orders.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/ui/Badge';
import { Order, OrderStatus } from '../../types';

const FILTER_TABS: { label: string; statuses: OrderStatus[] | null }[] = [
  { label: 'All', statuses: null },
  { label: 'Pending', statuses: ['pending'] },
  { label: 'Active', statuses: ['accepted', 'preparing', 'ready_pickup', 'out_delivery'] },
  { label: 'Done', statuses: ['completed', 'cancelled', 'declined'] },
];

export default function FishermanOrdersScreen() {
  const { currentUser } = useAuthStore();
  const { getOrdersByFisherman, updateOrderStatus } = useOrdersStore();
  const [activeTab, setActiveTab] = useState(0);

  if (!currentUser) return null;
  const allOrders = getOrdersByFisherman(currentUser.id);
  const tab = FILTER_TABS[activeTab];
  const orders = tab.statuses
    ? allOrders.filter((o) => tab.statuses!.includes(o.status))
    : allOrders;

  const handleAccept = (order: Order) => {
    Alert.alert('Accept Order', `Accept ${order.quantityKg}kg ${order.fishType} from ${order.buyerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: () => updateOrderStatus(order.id, 'accepted', currentUser.id),
      },
    ]);
  };

  const handleDecline = (order: Order) => {
    Alert.alert('Decline Order', 'Are you sure you want to decline this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline', style: 'destructive',
        onPress: () => updateOrderStatus(order.id, 'declined', currentUser.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <Text style={styles.headerSub}>{allOrders.length} total orders</Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {FILTER_TABS.map((t, i) => (
            <TouchableOpacity
              key={t.label}
              style={[styles.tab, activeTab === i && styles.tabActive]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No orders here</Text>
            <Text style={styles.emptyDesc}>Orders from buyers will appear here.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/(fisherman)/order-detail', params: { orderId: order.id } })}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.buyerName}>{order.buyerName}</Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fish Type</Text>
                  <Text style={styles.detailValue}>{order.fishType}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{order.quantityKg}kg</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={[styles.detailValue, { color: Colors.primary }]}>₱{order.total.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.chip}>
                  <Ionicons name={order.fulfillment === 'pickup' ? 'walk-outline' : 'bicycle-outline'} size={12} color={Colors.textSecondary} />
                  <Text style={styles.chipText}> {order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="card-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.chipText}> {order.paymentMethod === 'cash_pickup' ? 'Cash on Pickup' : 'Cash on Delivery'}</Text>
                </View>
              </View>

              {order.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAccept(order)}>
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => handleDecline(order)}>
                    <Ionicons name="close" size={16} color={Colors.danger} />
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.viewRow}>
                <Text style={styles.viewDetails}>View Details</Text>
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
  tabsContainer: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 100,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.muted, marginBottom: 2 },
  buyerName: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  detailsRow: { flexDirection: 'row', marginBottom: 10 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.muted, marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  chipText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 4 },
  acceptBtn: { backgroundColor: Colors.primary },
  declineBtn: { backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: Colors.danger + '50' },
  acceptText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.white },
  declineText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.danger },
  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  viewDetails: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.primary, marginRight: 4 },
});
