// app/(fisherman)/my-listings.tsx
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { Colors } from '../../constants/Colors';
import { FISH_EMOJIS } from '../../constants/fishTypes';
import { Badge } from '../../components/ui/Badge';
import { CatchListing } from '../../types';

export default function MyListingsScreen() {
  const { currentUser } = useAuthStore();
  const { getListingsByFisherman, updateListing, deleteListing } = useListingsStore();

  if (!currentUser) return null;
  const listings = getListingsByFisherman(currentUser.id);

  const handleDelete = (l: CatchListing) => {
    Alert.alert('Delete Listing', `Remove ${l.fishType} listing?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteListing(l.id) },
    ]);
  };

  const toggleStatus = (l: CatchListing) => {
    const newStatus = l.status === 'active' ? 'draft' : 'active';
    updateListing(l.id, { status: newStatus });
  };

  const statusConfig = {
    active: { label: 'Active', color: Colors.success, bg: Colors.successLight },
    sold_out: { label: 'Sold Out', color: Colors.danger, bg: Colors.dangerLight },
    draft: { label: 'Draft', color: Colors.muted, bg: Colors.surfaceSecondary },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <Text style={styles.headerSub}>{listings.length} total listings</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {listings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐟</Text>
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyDesc}>Post your first catch to start receiving orders.</Text>
            <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/(fisherman)/add-catch')}>
              <Text style={styles.postBtnText}>+ Post Catch</Text>
            </TouchableOpacity>
          </View>
        ) : (
          listings.map((l) => {
            const s = statusConfig[l.status];
            const available = l.quantityKg - l.reservedKg;
            return (
              <View key={l.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.emojiBox}>
                    <Text style={styles.emoji}>{FISH_EMOJIS[l.fishType] || '🐟'}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.fishType}>{l.fishType}</Text>
                      <Badge label={s.label} color={s.color} bg={s.bg} size="sm" />
                    </View>
                    <Text style={styles.price}>₱{l.pricePerKg}/kg</Text>
                    <Text style={styles.meta}>{available}kg available · {l.freshness}</Text>
                    <Text style={styles.location}>
                      <Ionicons name="location-outline" size={12} color={Colors.muted} /> {l.location}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(l)}>
                    <Ionicons name={l.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionText}>{l.status === 'active' ? 'Pause' : 'Activate'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(l)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                    <Text style={[styles.actionText, { color: Colors.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 20 },
  postBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  postBtnText: { color: Colors.white, fontFamily: 'Inter_700Bold', fontSize: 15 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', marginBottom: 12 },
  emojiBox: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  emoji: { fontSize: 30 },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fishType: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold', color: Colors.dark },
  price: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.primary },
  meta: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', marginTop: 2 },
  location: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
});
