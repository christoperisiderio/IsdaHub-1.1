// app/(fisherman)/add-catch.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, KeyboardAvoidingView, Platform, TextInput, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';
import { FISH_TYPES, FRESHNESS_OPTIONS, FISH_EMOJIS } from '../../constants/fishTypes';
import { MUNICIPALITIES_WITH_BARANGAYS } from '../../constants/locations';
import { FreshnessStatus } from '../../types';

const MAX_PHOTOS = 4;

export default function AddCatchScreen() {
  const { currentUser } = useAuthStore();
  const { addListing } = useListingsStore();

  const [form, setForm] = useState({
    fishType: '',
    quantityKg: '',
    pricePerKg: '',
    freshness: '' as FreshnessStatus | '',
    barangay: currentUser?.barangay || '',
    notes: '',
    availableSchedule: '',
    pickupAvailable: true,
    deliveryAvailable: false,
    photos: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photos', 'Please allow photo library access to add catch images.');
      return;
    }
    const remain = MAX_PHOTOS - form.photos.length;
    if (remain <= 0) {
      Alert.alert('Photo limit', `You can add up to ${MAX_PHOTOS} photos per listing.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remain,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    const uris = result.assets.map((a) => a.uri).slice(0, remain);
    setForm((f) => ({ ...f, photos: [...f.photos, ...uris].slice(0, MAX_PHOTOS) }));
  };

  const removePhoto = (uri: string) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== uri) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fishType) e.fishType = 'Fish type is required.';
    if (!form.quantityKg || parseFloat(form.quantityKg) <= 0) e.quantityKg = 'Quantity must be greater than 0.';
    if (!form.pricePerKg || parseFloat(form.pricePerKg) <= 0) e.pricePerKg = 'Price must be greater than 0.';
    if (!form.freshness) e.freshness = 'Select freshness status.';
    if (!form.barangay) e.barangay = 'Location is required.';
    if (!form.pickupAvailable && !form.deliveryAvailable) e.fulfillment = 'Select at least one: Pickup or Delivery.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePost = (asDraft = false) => {
    if (!asDraft && !validate()) return;
    if (!currentUser) return;

    setLoading(true);
    setTimeout(() => {
      addListing({
        fishermanId: currentUser.id,
        fishermanName: currentUser.fullName,
        fishType: form.fishType,
        quantityKg: parseFloat(form.quantityKg) || 0,
        pricePerKg: parseFloat(form.pricePerKg) || 0,
        freshness: form.freshness as FreshnessStatus,
        photos: form.photos,
        location: `${form.barangay}, ${currentUser.municipality}`,
        municipality: currentUser.municipality,
        barangay: form.barangay,
        pickupAvailable: form.pickupAvailable,
        deliveryAvailable: form.deliveryAvailable,
        availableSchedule: form.availableSchedule || 'Contact seller',
        notes: form.notes || undefined,
        status: asDraft ? 'draft' : 'active',
      });
      setLoading(false);
      Alert.alert(
        asDraft ? 'Saved as Draft' : '✅ Catch Posted!',
        asDraft ? 'Your listing has been saved as a draft.' : 'Your catch is now visible to buyers.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 700);
  };

  const barangays = currentUser ? MUNICIPALITIES_WITH_BARANGAYS[currentUser.municipality] || [] : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient colors={['#1A2E25', '#0A6E4F']} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Your Catch</Text>
            <Text style={styles.headerSub}>Add details about your available seafood</Text>
          </LinearGradient>

          <View style={styles.formCard}>
            {/* Fish Type */}
            <Text style={styles.sectionLabel}>Fish Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
              {FISH_TYPES.map((ft) => (
                <TouchableOpacity
                  key={ft.value}
                  style={[styles.typeChip, form.fishType === ft.value && styles.typeChipActive]}
                  onPress={() => set('fishType', ft.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{FISH_EMOJIS[ft.value] || '🐟'}</Text>
                  <Text style={[styles.typeLabel, form.fishType === ft.value && styles.typeLabelActive]}>
                    {ft.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.fishType && <Text style={styles.errorText}>{errors.fishType}</Text>}

            {/* Quantity & Price */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Quantity (kg) *"
                  placeholder="e.g. 50"
                  value={form.quantityKg}
                  onChangeText={(v) => set('quantityKg', v)}
                  keyboardType="decimal-pad"
                  icon="scale-outline"
                  error={errors.quantityKg}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Price per kg (₱) *"
                  placeholder="e.g. 120"
                  value={form.pricePerKg}
                  onChangeText={(v) => set('pricePerKg', v)}
                  keyboardType="decimal-pad"
                  icon="pricetag-outline"
                  error={errors.pricePerKg}
                />
              </View>
            </View>

            {/* Freshness */}
            <Text style={styles.sectionLabel}>Freshness Status *</Text>
            <View style={styles.freshnessGrid}>
              {FRESHNESS_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.freshnessChip, form.freshness === f.value && styles.freshnessChipActive]}
                  onPress={() => set('freshness', f.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freshnessLabel, form.freshness === f.value && styles.freshnessLabelActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.freshness && <Text style={styles.errorText}>{errors.freshness}</Text>}

            {/* Photos */}
            <Text style={styles.sectionLabel}>Photos (optional)</Text>
            <TouchableOpacity style={styles.photoUpload} activeOpacity={0.8} onPress={pickPhotos}>
              <Ionicons name="images-outline" size={28} color={Colors.muted} />
              <Text style={styles.photoText}>Add from gallery</Text>
              <Text style={styles.photoSub}>Up to {MAX_PHOTOS} images · tap to choose</Text>
            </TouchableOpacity>
            {form.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
                {form.photos.map((uri) => (
                  <View key={uri} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.photoRemove}
                      onPress={() => removePhoto(uri)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close-circle" size={22} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Location */}
            <Text style={styles.sectionLabel}>Pickup Location *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
              {barangays.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.locationChip, form.barangay === b && styles.typeChipActive]}
                  onPress={() => set('barangay', b)}
                >
                  <Text style={[styles.locationLabel, form.barangay === b && styles.typeLabelActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.barangay && <Text style={styles.errorText}>{errors.barangay}</Text>}

            {/* Schedule */}
            <Input
              label="Available Schedule"
              placeholder="e.g. 6:00 AM – 12:00 PM"
              value={form.availableSchedule}
              onChangeText={(v) => set('availableSchedule', v)}
              icon="time-outline"
            />

            {/* Fulfillment */}
            <Text style={styles.sectionLabel}>Fulfillment Options *</Text>
            <View style={styles.switchRow}>
              <View style={styles.switchItem}>
                <View style={styles.switchLeft}>
                  <Ionicons name="walk-outline" size={20} color={Colors.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.switchLabel}>Pickup Available</Text>
                    <Text style={styles.switchDesc}>Buyer picks up from you</Text>
                  </View>
                </View>
                <Switch
                  value={form.pickupAvailable}
                  onValueChange={(v) => set('pickupAvailable', v)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                  thumbColor={form.pickupAvailable ? Colors.primary : Colors.muted}
                />
              </View>
              <View style={styles.switchItem}>
                <View style={styles.switchLeft}>
                  <Ionicons name="bicycle-outline" size={20} color={Colors.secondary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.switchLabel}>Delivery Available</Text>
                    <Text style={styles.switchDesc}>You deliver to buyer</Text>
                  </View>
                </View>
                <Switch
                  value={form.deliveryAvailable}
                  onValueChange={(v) => set('deliveryAvailable', v)}
                  trackColor={{ false: Colors.border, true: Colors.secondary + '60' }}
                  thumbColor={form.deliveryAvailable ? Colors.secondary : Colors.muted}
                />
              </View>
            </View>
            {errors.fulfillment && <Text style={styles.errorText}>{errors.fulfillment}</Text>}

            {/* Notes */}
            <Text style={styles.sectionLabel}>Notes (Optional)</Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder={'e.g. "Please bring container."\n"Fresh catch from this morning."'}
                placeholderTextColor={Colors.mutedLight}
                value={form.notes}
                onChangeText={(v) => set('notes', v)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Buttons */}
            <Button title="🐟 Post Catch" onPress={() => handlePost(false)} loading={loading} style={styles.postBtn} />
            <View style={styles.bottomRow}>
              <Button
                title="Save as Draft"
                onPress={() => handlePost(true)}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
                fullWidth={false}
              />
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="ghost"
                style={{ flex: 1 }}
                fullWidth={false}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 40 },
  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 32 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  formCard: {
    backgroundColor: Colors.surface, marginTop: -16, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, paddingTop: 28,
  },
  sectionLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark, marginBottom: 10, marginTop: 8 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4, marginBottom: 8 },
  typeScroll: { paddingBottom: 12, gap: 8 },
  typeChip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, minWidth: 72,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  typeEmoji: { fontSize: 22, marginBottom: 4 },
  typeLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  typeLabelActive: { color: Colors.primary },
  row: { flexDirection: 'row', marginTop: 8 },
  freshnessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  freshnessChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  freshnessChipActive: { borderColor: Colors.primary, backgroundColor: Colors.overlay },
  freshnessLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.text },
  freshnessLabelActive: { color: Colors.primary, fontFamily: 'Inter_700Bold' },
  photoUpload: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border,
    borderRadius: 16, padding: 24, alignItems: 'center', marginVertical: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  photoText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary, marginTop: 8 },
  photoSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  photoStrip: { flexDirection: 'row', gap: 10, marginBottom: 16, paddingVertical: 4 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 88, height: 88, borderRadius: 12, backgroundColor: Colors.border },
  photoRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: Colors.surface, borderRadius: 12 },
  locationChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  locationLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.text },
  switchRow: { gap: 12, marginBottom: 8 },
  switchItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  switchLeft: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.dark },
  switchDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'Inter_400Regular' },
  notesContainer: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    backgroundColor: Colors.surface, padding: 12, marginBottom: 24,
  },
  notesInput: { fontSize: 14, color: Colors.text, minHeight: 70, textAlignVertical: 'top' },
  postBtn: { marginBottom: 12 },
  bottomRow: { flexDirection: 'row' },
});
