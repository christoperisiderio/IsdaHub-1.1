// app/(buyer)/listing-detail.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { Colors } from '../../constants/Colors';
import { FISH_EMOJIS } from '../../constants/fishTypes';

export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { currentUser, isGuest } = useAuthStore();
  const { listings } = useListingsStore();

  const listing = listings.find((l) => l.id === listingId);
  const [quantity, setQuantity] = useState('1');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>(
    listing?.pickupAvailable ? 'pickup' : 'delivery'
  );

  if (!listing) return null;

  const available = listing.quantityKg - listing.reservedKg;
  const qty = parseFloat(quantity) || 0;
  const subtotal = qty * listing.pricePerKg;
  const emoji = FISH_EMOJIS[listing.fishType] || '🐟';

  const FRESHNESS_COLORS: Record<string, string> = {
    'Fresh catch this morning': Colors.success,
    'Fresh catch today': Colors.primary,
    'Frozen': Colors.info,
    'Live seafood': Colors.accent,
    'Pre-ordered catch': Colors.warning,
  };
  const freshnessColor = FRESHNESS_COLORS[listing.freshness] || Colors.primary;

  const handleOrder = () => {
    if (isGuest) {
      Alert.alert('Login Required', 'Please log in or create an account to place orders.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (qty <= 0) { Alert.alert('Invalid Quantity', 'Please enter a valid quantity.'); return; }
    if (qty > available) { Alert.alert('Insufficient Stock', `Only ${available}kg is available.`); return; }
    router.push({ pathname: '/(buyer)/checkout', params: { listingId: listing.id, quantity, fulfillment } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.heroGrad}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.emojiBox}>
              <Text style={styles.heroEmoji}>{emoji}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.body}>
          {/* Fish name & price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fishType}>{listing.fishType}</Text>
              <Text style={styles.sellerName}>by {listing.fishermanName}</Text>
            </View>
            <View>
              <Text style={styles.price}>₱{listing.pricePerKg}</Text>
              <Text style={styles.priceUnit}>per kg</Text>
            </View>
          </View>

          {/* Freshness badge */}
          <View style={[styles.freshnessBadge, { backgroundColor: freshnessColor + '20', borderColor: freshnessColor + '50' }]}>
            <View style={[styles.freshnessDot, { backgroundColor: freshnessColor }]} />
            <Text style={[styles.freshnessText, { color: freshnessColor }]}>{listing.freshness}</Text>
          </View>

          {/* Key stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="scale-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{available}kg</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{listing.municipality}</Text>
              <Text style={styles.statLabel}>Location</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue} numberOfLines={1}>{listing.availableSchedule.split('–')[0].trim()}</Text>
              <Text style={styles.statLabel}>From</Text>
            </View>
          </View>

          {/* Info rows */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={Colors.muted} />
              <Text style={styles.infoText}>{listing.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={Colors.muted} />
              <Text style={styles.infoText}>Schedule: {listing.availableSchedule}</Text>
            </View>
            <View style={styles.infoRow}>
              {listing.pickupAvailable && <View style={styles.chip}><Text style={styles.chipText}>🚶 Pickup</Text></View>}
              {listing.deliveryAvailable && <View style={[styles.chip, { backgroundColor: Colors.secondary + '18' }]}><Text style={[styles.chipText, { color: Colors.secondary }]}>🚗 Delivery</Text></View>}
            </View>
            {listing.notes && (
              <View style={styles.notes}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                <Text style={styles.notesText}>{listing.notes}</Text>
              </View>
            )}
          </View>

          {/* Order section */}
          <View style={styles.orderSection}>
            <Text style={styles.orderTitle}>Place Your Order</Text>

            <Text style={styles.orderLabel}>Quantity (kg)</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((q) => String(Math.max(1, (parseFloat(q) || 1) - 1)))}>
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                textAlign="center"
              />
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity((q) => String(Math.min(available, (parseFloat(q) || 0) + 1)))}>
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.orderLabel}>Fulfillment Method</Text>
            <View style={styles.fulfillmentRow}>
              {listing.pickupAvailable && (
                <TouchableOpacity style={[styles.fulfillmentBtn, fulfillment === 'pickup' && styles.fulfillmentBtnActive]} onPress={() => setFulfillment('pickup')}>
                  <Ionicons name="walk-outline" size={18} color={fulfillment === 'pickup' ? Colors.white : Colors.primary} />
                  <Text style={[styles.fulfillmentText, fulfillment === 'pickup' && styles.fulfillmentTextActive]}>Pickup</Text>
                </TouchableOpacity>
              )}
              {listing.deliveryAvailable && (
                <TouchableOpacity style={[styles.fulfillmentBtn, fulfillment === 'delivery' && styles.fulfillmentBtnActive]} onPress={() => setFulfillment('delivery')}>
                  <Ionicons name="bicycle-outline" size={18} color={fulfillment === 'delivery' ? Colors.white : Colors.primary} />
                  <Text style={[styles.fulfillmentText, fulfillment === 'delivery' && styles.fulfillmentTextActive]}>Delivery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Summary */}
            {qty > 0 && (
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{qty}kg × ₱{listing.pricePerKg}/kg</Text>
                  <Text style={styles.summaryValue}>₱{subtotal.toLocaleString()}</Text>
                </View>
                {fulfillment === 'delivery' && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery fee</Text>
                    <Text style={styles.summaryValue}>See checkout</Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Subtotal</Text>
                  <Text style={styles.summaryTotalValue}>₱{subtotal.toLocaleString()}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.85}>
              <Ionicons name="cart-outline" size={20} color={Colors.white} />
              <Text style={styles.orderBtnText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  hero: { height: 220 },
  heroGrad: { flex: 1, padding: 20, paddingTop: 16, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 20 },
  emojiBox: { width: 110, height: 110, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  heroEmoji: { fontSize: 60 },
  body: { backgroundColor: Colors.surface, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  fishType: { fontSize: 26, fontFamily: 'Nunito_900Black', color: Colors.dark },
  sellerName: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', marginTop: 2 },
  price: { fontSize: 26, fontFamily: 'Nunito_900Black', color: Colors.primary, textAlign: 'right' },
  priceUnit: { fontSize: 12, color: Colors.muted, textAlign: 'right' },
  freshnessBadge: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10, borderWidth: 1, marginBottom: 16, alignSelf: 'flex-start', gap: 6 },
  freshnessDot: { width: 8, height: 8, borderRadius: 4 },
  freshnessText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surfaceSecondary, borderRadius: 14, padding: 16, marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.dark, textAlign: 'center' },
  statLabel: { fontSize: 11, color: Colors.muted, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  infoCard: { backgroundColor: Colors.surfaceSecondary, borderRadius: 14, padding: 14, marginBottom: 20, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  infoText: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', flex: 1 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, backgroundColor: Colors.overlay },
  chipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  notes: { flexDirection: 'row', gap: 6, backgroundColor: Colors.infoLight, borderRadius: 10, padding: 10 },
  notesText: { fontSize: 12, color: Colors.info, fontFamily: 'Inter_400Regular', flex: 1 },
  orderSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 20 },
  orderTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 16 },
  orderLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.textSecondary, marginBottom: 8 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  qtyBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  qtyInput: { flex: 1, fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, backgroundColor: Colors.surfaceSecondary, borderRadius: 12, paddingVertical: 10 },
  fulfillmentRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  fulfillmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.transparent },
  fulfillmentBtnActive: { backgroundColor: Colors.primary },
  fulfillmentText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.primary },
  fulfillmentTextActive: { color: Colors.white },
  summary: { backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 14, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  summaryValue: { fontSize: 13, color: Colors.dark, fontFamily: 'Inter_600SemiBold' },
  summaryTotal: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 6, paddingTop: 10 },
  summaryTotalLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark },
  summaryTotalValue: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  orderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, gap: 8, marginBottom: 30, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  orderBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
