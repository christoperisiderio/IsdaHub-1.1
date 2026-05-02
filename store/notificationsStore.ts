import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types';
import { zustandPersistStorage } from './zustandPersistStorage';

interface NotificationsState {
  notifications: AppNotification[];
  getUserNotifications: (userId: string) => AppNotification[];
  getUnreadCount: (userId: string) => number;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  pushForUser: (userId: string, n: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'userId'>) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],

      getUserNotifications: (userId) =>
        get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getUnreadCount: (userId) => get().notifications.filter((n) => n.userId === userId && !n.read).length,

      markAsRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllAsRead: (userId) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        }));
      },

      pushForUser: (userId, partial) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const row: AppNotification = {
          ...partial,
          id,
          userId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [row, ...s.notifications] }));
      },
    }),
    {
      name: 'isdahub-notifications',
      storage: zustandPersistStorage,
      partialize: (s) => ({ notifications: s.notifications }),
      version: 1,
    }
  )
);
