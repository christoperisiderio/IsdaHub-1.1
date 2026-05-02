// app/(buyer)/checkout.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { useOrdersStore } from '../../store/ordersStore';
import { Colors } from '../../constants/Colors';
import { DELIVERY_FEES } from '../../constants/locations';
import { PaymentMethod } from '../../types';

const PAYMENT_OPTIONS: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: 'Cash on Pickup', value: 'cash_pickup', icon: 'cash-outline' },
  { label: 'Cash on Delivery', value: 'cash_delivery', icon: 'bicycle-outline' },
];

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ listingId: string; quantity: string; fulfillment: string }>();
  const { currentUser } = useAuthStore();
  const { listings } = useListingsStore();
  const { placeOrder } = useOrdersStore();

  const listing = listings.find((l) => l.id === params.listingId);
  const qty = parseFloat(params.quantity) || 1;
  const fulfillment = (params.fulfillment as 'pickup' | 'delivery') || 'pickup';

  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser ? `${currentUser.barangay}, ${currentUser.municipality}` : ''
  );
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    fulfillment === 'pickup' ? 'cash_pickup' : 'cash_delivery'
  );
  const [loading, setLoading] = useState(false);

  if (!listing || !currentUser) return null;

  const subtotal = qty * listing.pricePerKg;
  const deliveryFee = fulfillment === 'delivery' ? (DELIVERY_FEES[listing.municipality] || 50) : 0;
  const total = subtotal + deliveryFee;

  const availablePaymentOptions = PAYMENT_OPTIONS.filter((p) => {
    if (fulfillment === 'pickup') return p.value === 'cash_pickup';
    return p.value === 'cash_delivery';
  });

  const handleConfirm = () => {
    if (fulfillment === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter your delivery address.'); return;
    }
    if (!scheduledAt.trim()) {
      Alert.alert('Missing Schedule', 'Please enter your preferred schedule.'); return;
    }
    setLoading(true);
    setTimeout(() => {
      const orderId = placeOrder({
        listingId: listing.id,
        fishermanId: listing.fishermanId,
        fishermanName: listing.fishermanName,
        buyerId: currentUser.id,
        buyerName: currentUser.fullName,
        buyerMobile: currentUser.mobile,
        fishType: listing.fishType,
        quantityKg: qty,
        pricePerKg: listing.pricePerKg,
        subtotal,
        deliveryFee,
        total,
        fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : undefined,
        scheduledAt: new Date().toISOString(),
        paymentMethod,
        status: 'pending',
        notes: notes || undefined,
      });
      setLoading(false);
      router.replace({ pathname: '/(buyer)/order-tracking', params: { orderId } });
    }, 800);
  };

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <Text style={styles.headerSub}>Review your order before confirming</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <Row label="Fish Type" value={listing.fishType} />
          <Row label="Quantity" value={`${qty}kg`} />
          <Row label="Price per kg" value={`₱${listing.pricePerKg}`} />
          <Row label="Subtotal" value={`₱${subtotal.toLocaleString()}`} />
          {deliveryFee > 0 && <Row label="Delivery Fee" value={`₱${deliveryFee}`} />}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Supplier</Text>
          <Row label="Fisherman" value={listing.fishermanName} />
          <Row label="Location" value={listing.location} />
          <Row label="Fulfillment" value={fulfillment === 'pickup' ? '🚶 Pickup' : '🚗 Delivery'} />
        </View>

        {/* Delivery Address */}
        {fulfillment === 'delivery' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address *</Text>
            <TextInput
              style={styles.textInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter your complete delivery address"
              placeholderTextColor={Colors.mutedLight}
              multiline
            />
          </View>
        )}

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferred Schedule *</Text>
          <TextInput
            style={styles.textInput}
            value={scheduledAt}
            onChangeText={setScheduledAt}
            placeholder="e.g. May 2, 2026 · 8:00 AM"
            placeholderTextColor={Colors.mutedLight}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {availablePaymentOptions.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.paymentOption, paymentMethod === p.value && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(p.value)}
            >
              <Ionicons name={p.icon as any} size={20} color={paymentMethod === p.value ? Colors.primary : Colors.muted} />
              <Text style={[styles.paymentLabel, paymentMethod === p.value && styles.paymentLabelActive]}>{p.label}</Text>
              {paymentMethod === p.value && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes to Seller (Optional)</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 60 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special instructions for the fisherman?"
            placeholderTextColor={Colors.mutedLight}
            multiline
          />
        </View>

        {/* Confirm button */}
        <TouchableOpacity style={[styles.confirmBtn, loading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <Text style={styles.confirmBtnText}>Placing Order…</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color={Colors.white} />
              <Text style={styles.confirmBtnText}>Confirm Order · ₱{total.toLocaleString()}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 28 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  rowValue: { fontSize: 13, color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
  rowValueBold: { fontFamily: 'Inter_700Bold' },
  totalRow: { borderBottomWidth: 0, paddingTop: 10, borderTopWidth: 2, borderTopColor: Colors.border, marginTop: 4 },
  totalLabel: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  totalValue: { fontSize: 20, fontFamily: 'Nunito_900Black', color: Colors.primary },
  textInput: { fontSize: 14, color: Colors.dark, fontFamily: 'Inter_400Regular', backgroundColor: Colors.surfaceSecondary, borderRadius: 10, padding: 12, borderWidth: 1.5, borderColor: Colors.border, textAlignVertical: 'top' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 8, gap: 10 },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  paymentLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  paymentLabelActive: { color: Colors.primary },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  confirmBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
