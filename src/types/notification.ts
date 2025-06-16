export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  link?: string; // Optional link for the notification to navigate to
  category?: 'info' | 'success' | 'warning' | 'error' | 'order' | 'promo'; // Optional category
}
