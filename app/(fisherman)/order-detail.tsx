// app/(fisherman)/order-detail.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { OrderStatus } from '../../types';

const STATUS_FLOW: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready_pickup', 'out_delivery', 'completed'];

const STATUS_ACTIONS: Partial<Record<OrderStatus, { label: string; next: OrderStatus; icon: string }>> = {
  accepted: { label: 'Mark as Preparing', next: 'preparing', icon: 'restaurant-outline' },
  preparing: { label: 'Mark as Ready for Pickup', next: 'ready_pickup', icon: 'checkmark-circle-outline' },
  ready_pickup: { label: 'Mark as Out for Delivery', next: 'out_delivery', icon: 'bicycle-outline' },
  out_delivery: { label: 'Mark as Completed', next: 'completed', icon: 'checkmark-done-circle-outline' },
};

export default function FishermanOrderDetail() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { currentUser } = useAuthStore();
  const { getOrderById, updateOrderStatus } = useOrdersStore();

  const order = getOrderById(orderId);
  if (!order || !currentUser) return null;

  const action = STATUS_ACTIONS[order.status];

  const handleStatusUpdate = (next: OrderStatus, label: string) => {
    Alert.alert(`Update Order`, `Set order status to "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => updateOrderStatus(order.id, next, currentUser.id) },
    ]);
  };

  const handleAccept = () =>
    Alert.alert('Accept Order', 'Confirm this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateOrderStatus(order.id, 'accepted', currentUser.id) },
    ]);

  const handleDecline = () =>
    Alert.alert('Decline Order', 'Decline this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => updateOrderStatus(order.id, 'declined', currentUser.id) },
    ]);

  const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: Colors.primary, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        </View>
        <StatusBadge status={order.status} />
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Buyer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <Row label="Name" value={order.buyerName} />
          <Row label="Mobile" value={order.buyerMobile} />
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <Row label="Fish Type" value={order.fishType} />
          <Row label="Quantity" value={`${order.quantityKg}kg`} />
          <Row label="Price per kg" value={`₱${order.pricePerKg}`} />
          <Row label="Subtotal" value={`₱${order.subtotal.toLocaleString()}`} />
          {order.deliveryFee > 0 && <Row label="Delivery Fee" value={`₱${order.deliveryFee}`} />}
          <Row label="Total Amount" value={`₱${order.total.toLocaleString()}`} highlight />
        </View>

        {/* Fulfillment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fulfillment</Text>
          <Row label="Method" value={order.fulfillment === 'pickup' ? '🚶 Pickup' : '🚗 Delivery'} />
          <Row label="Schedule" value={new Date(order.scheduledAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })} />
          <Row label="Payment" value={order.paymentMethod === 'cash_pickup' ? 'Cash on Pickup' : 'Cash on Delivery'} />
          {order.deliveryAddress && <Row label="Delivery Address" value={order.deliveryAddress} />}
          {order.notes && <Row label="Buyer Notes" value={order.notes} />}
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          {STATUS_FLOW.map((s, i) => {
            const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <View key={s} style={styles.timelineItem}>
                <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]} />
                {i < STATUS_FLOW.length - 1 && <View style={[styles.timelineLine, done && styles.timelineLineDone]} />}
                <Text style={[styles.timelineLabel, done && styles.timelineLabelDone, active && styles.timelineLabelActive]}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        {order.status === 'pending' && (
          <View style={styles.actionsSection}>
            <Button title="✅ Accept Order" onPress={handleAccept} style={{ marginBottom: 10 }} />
            <Button title="✕ Decline Order" onPress={handleDecline} variant="danger" />
          </View>
        )}

        {action && (
          <View style={styles.actionsSection}>
            <Button
              title={action.label}
              onPress={() => handleStatusUpdate(action.next, action.label)}
            />
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { marginBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  orderId: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_600SemiBold' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 30 },
  section: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.dark, maxWidth: '60%', textAlign: 'right' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.border, marginRight: 10, marginTop: 2 },
  timelineDotDone: { backgroundColor: Colors.primary },
  timelineDotActive: { backgroundColor: Colors.secondary, width: 18, height: 18, borderRadius: 9, marginTop: 0 },
  timelineLine: { position: 'absolute', left: 6, top: 16, width: 2, height: 22, backgroundColor: Colors.border },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.muted, marginBottom: 16 },
  timelineLabelDone: { color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
  timelineLabelActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  actionsSection: { marginTop: 4, marginBottom: 8 },
});
