import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CatchListing, ListingStatus } from '../types';
import { COVERED_MUNICIPALITIES } from '../constants/locations';
import { zustandPersistStorage } from './zustandPersistStorage';

const DEMO_FISHER_ID = 'user-fisher-demo';

function seedListings(): CatchListing[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'listing-seed-1',
      fishermanId: DEMO_FISHER_ID,
      fishermanName: 'Juan Dela Cruz',
      fishType: 'Bangus',
      quantityKg: 25,
      reservedKg: 0,
      pricePerKg: 180,
      freshness: 'Fresh catch this morning',
      photos: [],
      location: 'Poblacion, Buenavista',
      municipality: 'Buenavista',
      barangay: 'Poblacion',
      pickupAvailable: true,
      deliveryAvailable: true,
      availableSchedule: '6:00 AM – 6:00 PM',
      notes: 'Fresh from this morning’s catch.',
      status: 'active',
      createdAt: now,
    },
    {
      id: 'listing-seed-2',
      fishermanId: DEMO_FISHER_ID,
      fishermanName: 'Juan Dela Cruz',
      fishType: 'Galunggong',
      quantityKg: 40,
      reservedKg: 0,
      pricePerKg: 120,
      freshness: 'Fresh catch today',
      photos: [],
      location: 'Poblacion, Buenavista',
      municipality: 'Buenavista',
      barangay: 'Poblacion',
      pickupAvailable: true,
      deliveryAvailable: false,
      availableSchedule: 'Until sold out',
      status: 'active',
      createdAt: now,
    },
    {
      id: 'listing-seed-3',
      fishermanId: DEMO_FISHER_ID,
      fishermanName: 'Juan Dela Cruz',
      fishType: 'Hipon',
      quantityKg: 8,
      reservedKg: 0,
      pricePerKg: 350,
      freshness: 'Live seafood',
      photos: [],
      location: 'Poblacion, Buenavista',
      municipality: 'Buenavista',
      barangay: 'Poblacion',
      pickupAvailable: true,
      deliveryAvailable: true,
      availableSchedule: 'Morning pickup preferred',
      status: 'active',
      createdAt: now,
    },
  ];
}

export type AddListingInput = Omit<CatchListing, 'id' | 'reservedKg' | 'createdAt'>;

interface ListingsState {
  listings: CatchListing[];
  getActiveListings: (municipality: string) => CatchListing[];
  getListingsByFisherman: (fishermanId: string) => CatchListing[];
  addListing: (input: AddListingInput) => void;
  updateListing: (id: string, patch: Partial<CatchListing>) => void;
  deleteListing: (id: string) => void;
  reserveKg: (listingId: string, kg: number) => boolean;
  releaseReservedKg: (listingId: string, kg: number) => void;
  completeSaleKg: (listingId: string, kg: number) => void;
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: seedListings(),

      getActiveListings: (homeMunicipality: string) =>
        get()
          .listings.filter(
            (l) =>
              l.status === 'active' &&
              COVERED_MUNICIPALITIES.includes(l.municipality) &&
              l.quantityKg - l.reservedKg > 0
          )
          .sort((a, b) => {
            const aLocal = a.municipality === homeMunicipality ? 0 : 1;
            const bLocal = b.municipality === homeMunicipality ? 0 : 1;
            if (aLocal !== bLocal) return aLocal - bLocal;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }),

      getListingsByFisherman: (fishermanId) =>
        get()
          .listings.filter((l) => l.fishermanId === fishermanId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      addListing: (input) => {
        const row: CatchListing = {
          ...input,
          id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          reservedKg: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ listings: [row, ...s.listings] }));
      },

      updateListing: (id, patch) => {
        set((s) => ({
          listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        }));
      },

      deleteListing: (id) => {
        set((s) => ({ listings: s.listings.filter((l) => l.id !== id) }));
      },

      reserveKg: (listingId, kg) => {
        const l = get().listings.find((x) => x.id === listingId);
        if (!l || l.quantityKg - l.reservedKg < kg) return false;
        set((s) => ({
          listings: s.listings.map((x) =>
            x.id === listingId ? { ...x, reservedKg: x.reservedKg + kg } : x
          ),
        }));
        return true;
      },

      releaseReservedKg: (listingId, kg) => {
        set((s) => ({
          listings: s.listings.map((x) => {
            if (x.id !== listingId) return x;
            const next = Math.max(0, x.reservedKg - kg);
            return { ...x, reservedKg: next };
          }),
        }));
      },

      completeSaleKg: (listingId, kg) => {
        set((s) => ({
          listings: s.listings.map((x) => {
            if (x.id !== listingId) return x;
            const reserved = Math.max(0, x.reservedKg - kg);
            const qty = Math.max(0, x.quantityKg - kg);
            const status: ListingStatus =
              qty <= 0 ? 'sold_out' : x.status === 'draft' ? 'draft' : 'active';
            return { ...x, reservedKg: reserved, quantityKg: qty, status };
          }),
        }));
      },
    }),
    {
      name: 'isdahub-listings',
      storage: zustandPersistStorage,
      partialize: (s) => ({ listings: s.listings }),
      version: 1,
    }
  )
);
