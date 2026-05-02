// components/ui/FishCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { CatchListing } from '../../types';
import { FISH_EMOJIS } from '../../constants/fishTypes';
import { Badge } from './Badge';

interface FishCardProps {
  listing: CatchListing;
  onPress: () => void;
}

const FRESHNESS_COLORS: Record<string, string> = {
  'Fresh catch this morning': Colors.success,
  'Fresh catch today': Colors.primary,
  'Frozen': Colors.info,
  'Live seafood': Colors.accent,
  'Pre-ordered catch': Colors.warning,
};

export const FishCard: React.FC<FishCardProps> = ({ listing, onPress }) => {
  const available = listing.quantityKg - listing.reservedKg;
  const emoji = FISH_EMOJIS[listing.fishType] || '🐟';
  const freshnessColor = FRESHNESS_COLORS[listing.freshness] || Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Photo / Emoji placeholder */}
      <View style={styles.imageContainer}>
        {listing.photos.length > 0 ? (
          <Image source={{ uri: listing.photos[0] }} style={styles.image} />
        ) : (
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        )}
        <View style={styles.freshnessTag}>
          <View style={[styles.freshnessBar, { backgroundColor: freshnessColor }]} />
          <Text style={styles.freshnessText} numberOfLines={1}>{listing.freshness}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.fishType}>{listing.fishType}</Text>
        <Text style={styles.price}>₱{listing.pricePerKg}/kg</Text>

        <View style={styles.row}>
          <Ionicons name="scale-outline" size={13} color={Colors.muted} />
          <Text style={styles.info}> {available}kg available</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={Colors.muted} />
          <Text style={styles.info} numberOfLines={1}> {listing.municipality}</Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.seller} numberOfLines={1}>{listing.fishermanName}</Text>
          <View style={styles.fulfillment}>
            {listing.pickupAvailable && (
              <View style={styles.chip}>
                <Ionicons name="walk-outline" size={10} color={Colors.primary} />
                <Text style={styles.chipText}> Pickup</Text>
              </View>
            )}
            {listing.deliveryAvailable && (
              <View style={styles.chip}>
                <Ionicons name="bicycle-outline" size={10} color={Colors.secondary} />
                <Text style={[styles.chipText, { color: Colors.secondary }]}> Delivery</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    margin: 6,
  },
  imageContainer: {
    height: 110,
    backgroundColor: Colors.surfaceSecondary,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  emojiContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  emoji: { fontSize: 44 },
  freshnessTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    maxWidth: '90%',
  },
  freshnessBar: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  freshnessText: { fontSize: 9, fontWeight: '600', color: Colors.text },
  body: { padding: 10 },
  fishType: { fontSize: 15, fontWeight: '800', color: Colors.dark, marginBottom: 2 },
  price: { fontSize: 17, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  info: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  seller: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  fulfillment: { flexDirection: 'row', gap: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  chipText: { fontSize: 9, fontWeight: '600', color: Colors.primary },
});
