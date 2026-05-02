// app/(buyer)/browse.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { Colors } from '../../constants/Colors';
import { FishCard } from '../../components/ui/FishCard';
import { COVERED_MUNICIPALITIES } from '../../constants/locations';

const SORT_OPTIONS = [
  { label: 'Nearest First', value: 'nearest' },
  { label: 'Cheapest First', value: 'cheapest' },
  { label: 'Newest Catch', value: 'newest' },
];
const FRESHNESS_FILTERS = ['All', 'Fresh catch this morning', 'Fresh catch today', 'Live seafood', 'Frozen'];

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ search?: string }>();
  const { currentUser } = useAuthStore();
  const listings = useListingsStore((s) => s.listings);

  const [search, setSearch] = useState(params.search || '');
  const [sort, setSort] = useState('nearest');
  const [showFilters, setShowFilters] = useState(false);
  const [filterFreshness, setFilterFreshness] = useState('All');
  const [filterPickup, setFilterPickup] = useState(false);
  const [filterDelivery, setFilterDelivery] = useState(false);
  const [filterMuni, setFilterMuni] = useState('');

  const municipality = currentUser?.municipality || 'Buenavista';
  const allListings = useMemo(
    () => useListingsStore.getState().getActiveListings(municipality),
    [listings, municipality]
  );

  const filtered = useMemo(() => {
    let list = [...allListings];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) => l.fishType.toLowerCase().includes(q) || l.fishermanName.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
      );
    }
    if (filterFreshness !== 'All') list = list.filter((l) => l.freshness === filterFreshness);
    if (filterPickup) list = list.filter((l) => l.pickupAvailable);
    if (filterDelivery) list = list.filter((l) => l.deliveryAvailable);
    if (filterMuni) list = list.filter((l) => l.municipality === filterMuni);
    if (sort === 'cheapest') list.sort((a, b) => a.pricePerKg - b.pricePerKg);
    else if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [allListings, search, sort, filterFreshness, filterPickup, filterDelivery, filterMuni]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={Colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fish, fisherman, location..."
              placeholderTextColor={Colors.mutedLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={20} color={showFilters ? Colors.white : Colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortTabs}>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity key={s.value} style={[styles.sortTab, sort === s.value && styles.sortTabActive]} onPress={() => setSort(s.value)}>
              <Text style={[styles.sortTabText, sort === s.value && styles.sortTabTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterTitle}>Freshness</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FRESHNESS_FILTERS.map((f) => (
              <TouchableOpacity key={f} style={[styles.filterChip, filterFreshness === f && styles.filterChipActive]} onPress={() => setFilterFreshness(f)}>
                <Text style={[styles.filterChipText, filterFreshness === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterTitle}>Fulfillment</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, filterPickup && styles.filterChipActive]} onPress={() => setFilterPickup(!filterPickup)}>
              <Text style={[styles.filterChipText, filterPickup && styles.filterChipTextActive]}>🚶 Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, filterDelivery && styles.filterChipActive]} onPress={() => setFilterDelivery(!filterDelivery)}>
              <Text style={[styles.filterChipText, filterDelivery && styles.filterChipTextActive]}>🚗 Delivery</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterTitle}>Area</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, filterMuni === '' && styles.filterChipActive]} onPress={() => setFilterMuni('')}>
              <Text style={[styles.filterChipText, filterMuni === '' && styles.filterChipTextActive]}>All Areas</Text>
            </TouchableOpacity>
            {COVERED_MUNICIPALITIES.map((m) => (
              <TouchableOpacity key={m} style={[styles.filterChip, filterMuni === m && styles.filterChipActive]} onPress={() => setFilterMuni(m)}>
                <Text style={[styles.filterChipText, filterMuni === m && styles.filterChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => { setFilterFreshness('All'); setFilterPickup(false); setFilterDelivery(false); setFilterMuni(''); }}>
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</Text>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or filters.</Text>
          </View>
        ) : (
          <View style={styles.gridInner}>
            {filtered.map((listing) => (
              <View key={listing.id} style={styles.gridItem}>
                <FishCard listing={listing} onPress={() => router.push({ pathname: '/(buyer)/listing-detail', params: { listingId: listing.id } })} />
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: 16, paddingBottom: 0 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceSecondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark, fontFamily: 'Inter_400Regular' },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  filterBtnActive: { backgroundColor: Colors.primary },
  sortTabs: { paddingBottom: 12, gap: 8 },
  sortTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: Colors.surfaceSecondary },
  sortTabActive: { backgroundColor: Colors.primary },
  sortTabText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  sortTabTextActive: { color: Colors.white },
  filtersPanel: { backgroundColor: Colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTitle: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  filterChipText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.text },
  filterChipTextActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  clearFiltersText: { fontSize: 13, color: Colors.danger, fontFamily: 'Inter_600SemiBold' },
  scroll: { flex: 1 },
  gridContent: { padding: 12, flexGrow: 1 },
  resultCount: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_500Medium', marginBottom: 8, marginLeft: 6 },
  gridInner: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridItem: { width: '50%' },
  empty: { flex: 1, alignItems: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
});
