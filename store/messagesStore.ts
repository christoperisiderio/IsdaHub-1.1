import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderMessage } from '../types';
import { zustandPersistStorage } from './zustandPersistStorage';

interface MessagesState {
  messages: OrderMessage[];
  getMessagesByOrder: (orderId: string | undefined) => OrderMessage[];
  sendMessage: (orderId: string, senderId: string, text: string) => void;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: [],

      getMessagesByOrder: (orderId) => {
        if (!orderId) return [];
        return get()
          .messages
          .filter((m) => m.orderId === orderId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      sendMessage: (orderId, senderId, text) => {
        const clean = text.trim();
        if (!clean) return;
        const now = new Date().toISOString();
        const next: OrderMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          orderId,
          senderId,
          text: clean,
          createdAt: now,
        };
        set((s) => ({ messages: [...s.messages, next] }));
      },
    }),
    {
      name: 'isdahub-messages',
      storage: zustandPersistStorage,
      partialize: (s) => ({ messages: s.messages }),
      version: 1,
    }
  )
);
