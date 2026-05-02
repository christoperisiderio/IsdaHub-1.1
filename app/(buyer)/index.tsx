// app/(buyer)/index.tsx — Buyer Dashboard
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
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
import { FishCard } from '../../components/ui/FishCard';
import { FISH_EMOJIS } from '../../constants/fishTypes';
import { CatchListing } from '../../types';
import { COVERED_MUNICIPALITIES, isInCoverageArea } from '../../constants/locations';

const CATEGORIES = [
  { label: 'All', icon: '🌊' },
  { label: 'Fish', icon: '🐟' },
  { label: 'Shrimp', icon: '🦐' },
  { label: 'Crab', icon: '🦀' },
  { label: 'Squid', icon: '🦑' },
  { label: 'Live', icon: '🪣' },
];

export default function BuyerDashboard() {
  const { currentUser, isGuest } = useAuthStore();
  const listings = useListingsStore((s) => s.listings);
  const { getOrdersByBuyer } = useOrdersStore();
  const { getUnreadCount } = useNotificationsStore();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');

  const municipality = currentUser?.municipality || 'Buenavista';
  const inCoverage = isGuest ? true : isInCoverageArea(municipality);
  const unread = currentUser ? getUnreadCount(currentUser.id) : 0;

  const allListings = React.useMemo(
    () => useListingsStore.getState().getActiveListings(municipality),
    [listings, municipality]
  );
  const featured = allListings.slice(0, 4);
  const recentOrders = currentUser ? getOrdersByBuyer(currentUser.id).slice(0, 2) : [];

  if (!inCoverage) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notAvailable}>
          <Text style={styles.naEmoji}>🗺️</Text>
          <Text style={styles.naTitle}>Not Yet Available</Text>
          <Text style={styles.naDesc}>
            IsdaHub is not yet available in your area.{'\n'}
            We currently serve Buenavista and Nasipit, Agusan del Norte.
          </Text>
          <Text style={styles.naFooter}>Stay tuned for expansion!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello{currentUser ? `, ${currentUser.fullName.split(' ')[0]}` : ''}! 👋</Text>
              {isGuest ? (
                <Text style={styles.guestTag}>Browsing as Guest</Text>
              ) : (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.locationText}> {currentUser?.municipality}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
              {unread > 0 && (
                <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unread}</Text></View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fish, fisherman, location..."
              placeholderTextColor={Colors.mutedLight}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => router.push({ pathname: '/(buyer)/browse', params: { search } })}
              returnKeyType="search"
            />
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={[styles.categoryChip, activeCategory === c.label && styles.categoryChipActive]}
                onPress={() => {
                  setActiveCategory(c.label);
                  router.push({ pathname: '/(buyer)/browse', params: { category: c.label } });
                }}
              >
                <Text style={styles.categoryEmoji}>{c.icon}</Text>
                <Text style={[styles.categoryLabel, activeCategory === c.label && styles.categoryLabelActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Guest CTA */}
        {isGuest && (
          <TouchableOpacity style={styles.guestBanner} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.secondary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.guestBannerTitle}>Log in to place orders</Text>
              <Text style={styles.guestBannerSub}>Create a free account to buy directly from fishermen.</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
          </TouchableOpacity>
        )}

        {/* Featured listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🐟 Fresh Catch Near You</Text>
            <TouchableOpacity onPress={() => router.push('/(buyer)/browse')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {featured.map((listing) => (
              <View key={listing.id} style={styles.gridItem}>
                <FishCard
                  listing={listing}
                  onPress={() => router.push({ pathname: '/(buyer)/listing-detail', params: { listingId: listing.id } })}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/(buyer)/orders')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push({ pathname: '/(buyer)/order-tracking', params: { orderId: order.id } })}
                activeOpacity={0.85}
              >
                <Text style={styles.orderFish}>{order.fishType}</Text>
                <Text style={styles.orderMeta}>{order.quantityKg}kg · ₱{order.total.toLocaleString()}</Text>
                <View style={[styles.orderStatus, { backgroundColor: order.status === 'completed' ? Colors.successLight : Colors.warningLight }]}>
                  <Text style={[styles.orderStatusText, { color: order.status === 'completed' ? Colors.success : Colors.warning }]}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Area coverage badge */}
        <View style={styles.coverageBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={styles.coverageText}>
            {' '}Serving <Text style={{ fontFamily: 'Inter_700Bold' }}>Buenavista</Text> and <Text style={{ fontFamily: 'Inter_700Bold' }}>Nasipit</Text>
          </Text>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  guestTag: { fontSize: 12, color: Colors.secondary, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular' },
  notifBtn: { padding: 8, position: 'relative' },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: Colors.danger, width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, color: Colors.white, fontFamily: 'Inter_700Bold' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark, fontFamily: 'Inter_400Regular' },
  categoriesSection: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categories: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100, backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5, borderColor: Colors.border, gap: 6,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  categoryLabelActive: { color: Colors.white },
  guestBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.secondary + '18', borderRadius: 14,
    marginHorizontal: 16, marginTop: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.secondary + '50',
  },
  guestBannerTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark },
  guestBannerSub: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  seeAll: { fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%' },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  orderFish: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  orderMeta: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', marginTop: 4 },
  orderStatus: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  orderStatusText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  coverageBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 12, paddingVertical: 8,
    backgroundColor: Colors.overlay, borderRadius: 100,
  },
  coverageText: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_500Medium' },
  notAvailable: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  naEmoji: { fontSize: 64, marginBottom: 16 },
  naTitle: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark, marginBottom: 12 },
  naDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  naFooter: { fontSize: 13, color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
});
