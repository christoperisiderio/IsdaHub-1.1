// app/(buyer)/order-tracking.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/ui/Badge';
import { OrderStatus } from '../../types';

const TIMELINE_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'pending', label: 'Order Placed', icon: 'receipt-outline' },
  { key: 'accepted', label: 'Fisherman Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'preparing', label: 'Preparing Catch', icon: 'restaurant-outline' },
  { key: 'ready_pickup', label: 'Ready for Pickup', icon: 'bag-check-outline' },
  { key: 'out_delivery', label: 'Out for Delivery', icon: 'bicycle-outline' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done-circle-outline' },
];

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { currentUser, users } = useAuthStore();
  const { getOrderById, updateOrderStatus } = useOrdersStore();

  const order = getOrderById(orderId);
  if (!order || !currentUser) return null;

  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const isDone = order.status === 'completed';
  const isCancellable = order.status === 'pending';
  const isDeclined = order.status === 'declined';
  const isCancelled = order.status === 'cancelled';
  const fishermanMobile = users.find((u) => u.id === order.fishermanId)?.mobile;

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'Keep Order', style: 'cancel' },
      { text: 'Cancel Order', style: 'destructive', onPress: () => updateOrderStatus(order.id, 'cancelled', currentUser.id) },
    ]);
  };

  const handleMarkReceived = () => {
    Alert.alert('Mark as Received', 'Confirm that you have received your order?', [
      { text: 'Not Yet', style: 'cancel' },
      { text: 'Yes, Received!', onPress: () => updateOrderStatus(order.id, 'completed', currentUser.id) },
    ]);
  };

  const handleSms = async () => {
    if (!fishermanMobile) {
      Alert.alert('Contact unavailable', 'Seller mobile number is not available.');
      return;
    }
    const body = encodeURIComponent(`Order ${order.id.slice(-6).toUpperCase()}: `);
    const smsUrl = `sms:${fishermanMobile}?body=${body}`;
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (!canOpen) {
      Alert.alert('SMS unavailable', 'No SMS app available on this device.');
      return;
    }
    await Linking.openURL(smsUrl);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[Colors.dark, Colors.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
        </View>
        <StatusBadge status={order.status} />
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Success state */}
        {isDone && (
          <View style={styles.successBanner}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Order Completed!</Text>
            <Text style={styles.successSub}>Thank you for using IsdaHub PH. Enjoy your seafood!</Text>
          </View>
        )}

        {/* Declined/Cancelled state */}
        {(isDeclined || isCancelled) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorEmoji}>❌</Text>
            <Text style={styles.errorTitle}>{isDeclined ? 'Order Declined' : 'Order Cancelled'}</Text>
            <Text style={styles.errorSub}>
              {isDeclined ? 'The fisherman has declined your order. Stock has been released.' : 'This order has been cancelled.'}
            </Text>
          </View>
        )}

        {/* Order info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Fish Type</Text><Text style={styles.infoValue}>{order.fishType}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Quantity</Text><Text style={styles.infoValue}>{order.quantityKg}kg</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Total</Text><Text style={[styles.infoValue, { color: Colors.primary }]}>₱{order.total.toLocaleString()}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Supplier</Text><Text style={styles.infoValue}>{order.fishermanName}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Method</Text><Text style={styles.infoValue}>{order.fulfillment === 'pickup' ? '🚶 Pickup' : '🚗 Delivery'}</Text></View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>{order.paymentMethod === 'cash_pickup' ? 'Cash on Pickup' : 'Cash on Delivery'}</Text>
          </View>
          <View style={styles.inlineActions}>
            <TouchableOpacity style={styles.inlineActionBtn} onPress={handleSms}>
              <Ionicons name="chatbox-outline" size={16} color={Colors.primary} />
              <Text style={styles.inlineActionText}>SMS Seller</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inlineActionBtnPrimary} onPress={() => router.push({ pathname: '/order-chat', params: { orderId: order.id } })}>
              <Ionicons name="chatbubbles" size={16} color={Colors.white} />
              <Text style={styles.inlineActionTextPrimary}>Order Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline */}
        {!isDeclined && !isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Timeline</Text>
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <View key={step.key} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, done && styles.timelineDotDone, active && styles.timelineDotActive]}>
                      {done && <Ionicons name={active ? 'radio-button-on' : 'checkmark'} size={active ? 12 : 10} color={Colors.white} />}
                    </View>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <View style={[styles.timelineConnector, done && i < currentStepIdx && styles.timelineConnectorDone]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, active && styles.timelineLabelActive, done && !active && styles.timelineLabelDone]}>
                      {step.label}
                    </Text>
                    {active && <Text style={styles.timelineStatus}>Current Status</Text>}
                  </View>
                  <Ionicons name={step.icon as any} size={18} color={done ? Colors.primary : Colors.mutedLight} />
                </View>
              );
            })}
          </View>
        )}

        {/* Actions */}
        {isCancellable && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {order.status === 'ready_pickup' && (
          <TouchableOpacity style={styles.receivedBtn} onPress={handleMarkReceived}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.receivedBtnText}>Mark as Received</Text>
          </TouchableOpacity>
        )}

        {isDone && (
          <View style={styles.doneActions}>
            <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(buyer)/browse')}>
              <Text style={styles.doneBtnText}>Browse More Seafood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/(buyer)/history')}>
              <Text style={styles.historyBtnText}>View Order History</Text>
            </TouchableOpacity>
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
  content: { padding: 16, flexGrow: 1 },
  successBanner: { alignItems: 'center', backgroundColor: Colors.successLight, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.success + '40' },
  successEmoji: { fontSize: 44, marginBottom: 8 },
  successTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.success },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  errorBanner: { alignItems: 'center', backgroundColor: Colors.dangerLight, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.danger + '40' },
  errorEmoji: { fontSize: 44, marginBottom: 8 },
  errorTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.danger },
  errorSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  infoValue: { fontSize: 13, color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 24 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: Colors.primary },
  timelineDotActive: { backgroundColor: Colors.secondary, width: 28, height: 28, borderRadius: 14, marginLeft: -2 },
  timelineConnector: { width: 2, height: 28, backgroundColor: Colors.border, marginTop: 2 },
  timelineConnectorDone: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, paddingBottom: 20 },
  timelineLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.muted },
  timelineLabelDone: { color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
  timelineLabelActive: { color: Colors.primary, fontFamily: 'Inter_700Bold', fontSize: 15 },
  timelineStatus: { fontSize: 11, color: Colors.secondary, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dangerLight, borderRadius: 14, paddingVertical: 14, gap: 8, marginBottom: 12, borderWidth: 1, borderColor: Colors.danger + '40' },
  cancelBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.danger },
  receivedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 14, gap: 8, marginBottom: 12 },
  receivedBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.white },
  doneActions: { gap: 10 },
  doneBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.white },
  historyBtn: { backgroundColor: Colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  historyBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.primary },
  inlineActions: { marginTop: 12, flexDirection: 'row', gap: 8 },
  inlineActionBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  inlineActionBtnPrimary: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  inlineActionText: { color: Colors.primary, fontSize: 12, fontFamily: 'Inter_700Bold' },
  inlineActionTextPrimary: { color: Colors.white, fontSize: 12, fontFamily: 'Inter_700Bold' },
});
