import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegisterPayload, User, UserRole } from '../types';
import { zustandPersistStorage } from './zustandPersistStorage';

type AuthResult = { success: true } | { success: false; message: string };

type UserRecord = User & { password: string };

function seedUsers(): UserRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'user-fisher-demo',
      fullName: 'Juan Dela Cruz',
      mobile: '09111111111',
      password: 'password',
      role: 'fisherman',
      municipality: 'Buenavista',
      barangay: 'Poblacion',
      fisheryRegNumber: 'FR-2024-001',
      createdAt: now,
    },
    {
      id: 'user-buyer-demo',
      fullName: 'Maria Santos',
      mobile: '09222222222',
      password: 'password',
      role: 'buyer',
      municipality: 'Buenavista',
      barangay: 'Rizal',
      businessName: 'Sari-sari ni Maria',
      createdAt: now,
    },
  ];
}

interface AuthState {
  users: UserRecord[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (mobile: string, password: string) => AuthResult;
  register: (payload: RegisterPayload) => AuthResult;
  logout: () => void;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: seedUsers(),
      currentUser: null,
      isAuthenticated: false,
      isGuest: false,

      login: (mobile, password) => {
        const u = get().users.find((x) => x.mobile === mobile && x.password === password);
        if (!u) {
          return { success: false, message: 'Invalid mobile number or password.' };
        }
        const { password: _p, ...publicUser } = u;
        set({ currentUser: publicUser, isAuthenticated: true, isGuest: false });
        return { success: true };
      },

      register: (payload) => {
        if (get().users.some((x) => x.mobile === payload.mobile)) {
          return { success: false, message: 'This mobile number is already registered.' };
        }
        const now = new Date().toISOString();
        const record: UserRecord = {
          id: `user-${Date.now()}`,
          fullName: payload.fullName,
          mobile: payload.mobile,
          password: payload.password,
          role: payload.role,
          municipality: payload.municipality,
          barangay: payload.barangay,
          businessName: payload.businessName,
          fisheryRegNumber: payload.fisheryRegNumber,
          createdAt: now,
        };
        const { password: _p, ...publicUser } = record;
        set((s) => ({
          users: [...s.users, record],
          currentUser: publicUser,
          isAuthenticated: true,
          isGuest: false,
        }));
        return { success: true };
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false, isGuest: false });
      },

      continueAsGuest: () => {
        set({ currentUser: null, isAuthenticated: false, isGuest: true });
      },
    }),
    {
      name: 'isdahub-auth',
      storage: zustandPersistStorage,
      partialize: (s) => ({
        users: s.users,
        currentUser: s.currentUser,
        isAuthenticated: s.isAuthenticated,
        isGuest: s.isGuest,
      }),
      version: 1,
      onRehydrateStorage: () => (_state, error) => {
        if (error) return;
        queueMicrotask(() => {
          const { currentUser, users, logout } = useAuthStore.getState();
          if (currentUser && !users.some((x) => x.id === currentUser.id)) {
            logout();
          }
        });
      },
    }
  )
);
