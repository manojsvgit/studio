
'use client';

import type { Order } from '@/types/order';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders], // Add new orders to the beginning of the list
        })),
      getOrders: () => {
        // Ensure orders are always sorted by date, newest first
        return [...get().orders].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      },
    }),
    {
      name: 'walmartchain-order-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
