
'use client';

import { create } from 'zustand';
import type { WalletCurrency } from '@/types/wallet';
import {
  IndianRupee,
  Bitcoin,
  Sigma,
  Gem,
  DollarSign,
  Sun,
  Dog,
  Coins,
  BadgeX,
  Network,
} from 'lucide-react';

interface WalletState {
  currencies: WalletCurrency[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  getFilteredCurrencies: () => WalletCurrency[];
  getTotalPortfolioValueINR: () => number;
}

const initialCurrencies: WalletCurrency[] = [
  { id: 'inr', name: 'Indian Rupee', symbol: 'INR', icon: IndianRupee, balance: 0.03, priceInINR: 1, color: 'text-green-500' },
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, balance: 0, priceInINR: 5000000, color: 'text-orange-500' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: Sigma, balance: 0, priceInINR: 300000, color: 'text-gray-400' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: Gem, balance: 0, priceInINR: 8000, color: 'text-slate-500' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: DollarSign, balance: 0, priceInINR: 83, color: 'text-green-600' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: Sun, balance: 0, priceInINR: 12000, color: 'text-purple-500' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: Dog, balance: 0, priceInINR: 10, color: 'text-yellow-500' },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', icon: Coins, balance: 0, priceInINR: 40000, color: 'text-green-700' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', icon: BadgeX, balance: 0, priceInINR: 40 },
  { id: 'trx', name: 'Tron', symbol: 'TRX', icon: Network, balance: 0, priceInINR: 9, color: 'text-red-500' },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  currencies: initialCurrencies,
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  getFilteredCurrencies: () => {
    const { currencies, searchTerm } = get();
    if (!searchTerm) {
      return currencies;
    }
    return currencies.filter(
      (currency) =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  getTotalPortfolioValueINR: () => {
    const { currencies } = get();
    return currencies.reduce((total, currency) => total + currency.balance * currency.priceInINR, 0);
  },
}));
