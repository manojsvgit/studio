
'use client';

import type { Notification } from '@/types/notification';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  clearNotifications: () => void;
  getNotifications: () => Notification[]; // To get sorted notifications
}

const MOCK_INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: uuidv4(),
    title: 'Welcome to WalmartChain!',
    description: 'Explore our wide range of products and enjoy seamless crypto transactions.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    isRead: false,
    category: 'info',
    link: '/products',
  },
  {
    id: uuidv4(),
    title: 'Your Order #WM-12345 Shipped!',
    description: 'Track your package with tracking ID XYZ789. Expected delivery: 2 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isRead: false,
    category: 'order',
    link: '/orders',
  },
  {
    id: uuidv4(),
    title: 'Special Offer Just For You!',
    description: 'Get 15% off on your next grocery purchase over $50. Use code: FRESH15',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    category: 'promo',
  },
    {
    id: uuidv4(),
    title: 'Account Security Update',
    description: 'We recommend enabling Two-Factor Authentication for enhanced security.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    category: 'info',
    link: '/settings',
  },
];


export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: MOCK_INITIAL_NOTIFICATIONS,
      addNotification: (notificationDetails) =>
        set((state) => ({
          notifications: [
            {
              ...notificationDetails,
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              isRead: false,
            },
            ...state.notifications,
          ].slice(0, 20), // Keep max 20 notifications
        })),
      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
      clearNotifications: () => set({ notifications: [] }),
      getNotifications: () => {
         // Ensure notifications are always sorted by date, newest first
        return [...get().notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }),
    {
      name: 'walmartchain-notification-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1, // Optional: for migrations
    }
  )
);
