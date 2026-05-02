import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared JSON storage adapter for Zustand `persist` (device-local only). */
export const zustandPersistStorage = createJSONStorage(() => AsyncStorage);
