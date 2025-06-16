
import type { LucideIcon } from 'lucide-react';

export interface WalletCurrency {
  id: string;
  name: string;
  symbol: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  balance: number;
  priceInINR: number; // Price of 1 unit of this currency in INR
  color?: string; // Optional color for the icon, e.g. 'text-orange-500'
}
