import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types';
import { useListingsStore } from './listingsStore';
import { useNotificationsStore } from './notificationsStore';
import { zustandPersistStorage } from './zustandPersistStorage';

const PIPELINE: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready_pickup',
  'out_delivery',
];

function isPipeline(s: OrderStatus) {
  return PIPELINE.includes(s);
}

export type PlaceOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

interface OrdersState {
  orders: Order[];
  getOrderById: (orderId: string | undefined) => Order | undefined;
  getOrdersByBuyer: (buyerId: string) => Order[];
  getOrdersByFisherman: (fishermanId: string) => Order[];
  placeOrder: (input: PlaceOrderInput) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, actorId: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      getOrderById: (orderId) => {
        if (!orderId) return undefined;
        return get().orders.find((o) => o.id === orderId);
      },

      getOrdersByBuyer: (buyerId) =>
        get()
          .orders.filter((o) => o.buyerId === buyerId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),

      getOrdersByFisherman: (fishermanId) =>
        get()
          .orders.filter((o) => o.fishermanId === fishermanId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),

      placeOrder: (input) => {
        const listings = useListingsStore.getState();
        if (!listings.reserveKg(input.listingId, input.quantityKg)) {
          return '';
        }
        const now = new Date().toISOString();
        const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const order: Order = {
          ...input,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ orders: [order, ...s.orders] }));

        useNotificationsStore.getState().pushForUser(input.fishermanId, {
          type: 'order',
          title: 'New order',
          message: `${input.buyerName} ordered ${input.quantityKg}kg of ${input.fishType}.`,
          orderId: id,
        });

        return id;
      },

      updateOrderStatus: (orderId, status, _actorId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        const prev = order.status;
        const listings = useListingsStore.getState();
        const notif = useNotificationsStore.getState();

        const now = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status, updatedAt: now } : o)),
        }));

        const wasPipeline = isPipeline(prev);
        const isTerminal = status === 'completed' || status === 'cancelled' || status === 'declined';

        if (wasPipeline && isTerminal) {
          if (status === 'completed') {
            listings.completeSaleKg(order.listingId, order.quantityKg);
          } else {
            listings.releaseReservedKg(order.listingId, order.quantityKg);
          }
        }

        if (status === 'accepted') {
          notif.pushForUser(order.buyerId, {
            type: 'order',
            title: 'Order accepted',
            message: `${order.fishermanName} accepted your order for ${order.fishType}.`,
            orderId: order.id,
          });
        } else if (status === 'declined') {
          notif.pushForUser(order.buyerId, {
            type: 'order',
            title: 'Order declined',
            message: `${order.fishermanName} could not fulfill your order for ${order.fishType}.`,
            orderId: order.id,
          });
        } else if (status === 'cancelled') {
          notif.pushForUser(order.fishermanId, {
            type: 'order',
            title: 'Order cancelled',
            message: `${order.buyerName} cancelled their order.`,
            orderId: order.id,
          });
        }
      },
    }),
    {
      name: 'isdahub-orders',
      storage: zustandPersistStorage,
      partialize: (s) => ({ orders: s.orders }),
      version: 1,
    }
  )
);
