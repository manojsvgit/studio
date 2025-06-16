
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
  selectedCurrencyId: string;
  setSearchTerm: (term: string) => void;
  setSelectedCurrencyId: (currencyId: string) => void;
  getFilteredCurrencies: () => WalletCurrency[];
  getTotalPortfolioValueINR: () => number;
  deductCurrencyBalance: (currencyId: string, amountToDeduct: number) => void; 
}

const initialCurrencies: WalletCurrency[] = [
  { id: 'inr', name: 'Indian Rupee', symbol: 'INR', icon: IndianRupee, balance: 15000.00, priceInINR: 1, color: 'text-green-500' }, 
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: Bitcoin, balance: 0.01, priceInINR: 5000000, color: 'text-orange-500' }, // Increased balance
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: Sigma, balance: 0.5, priceInINR: 300000, color: 'text-gray-400' }, // Increased balance
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: Gem, balance: 10, priceInINR: 8000, color: 'text-slate-500' }, // Increased balance
  { id: 'usdt', name: 'Tether', symbol: 'USDT', icon: DollarSign, balance: 500, priceInINR: 83, color: 'text-green-600' }, // Increased balance
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: Sun, balance: 10, priceInINR: 12000, color: 'text-purple-500' }, // Increased balance
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: Dog, balance: 5000, priceInINR: 10, color: 'text-yellow-500' }, // Increased balance
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', icon: Coins, balance: 1, priceInINR: 40000, color: 'text-green-700' }, // Increased balance
  { id: 'xrp', name: 'XRP', symbol: 'XRP', icon: BadgeX, balance: 1000, priceInINR: 40 }, // Increased balance
  { id: 'trx', name: 'Tron', symbol: 'TRX', icon: Network, balance: 5000, priceInINR: 9, color: 'text-red-500' }, // Increased balance
];

export const useWalletStore = create<WalletState>((set, get) => ({
  currencies: initialCurrencies,
  searchTerm: '',
  selectedCurrencyId: initialCurrencies.find(c => c.symbol === 'INR')?.id || initialCurrencies[0]?.id || '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCurrencyId: (currencyId) => set({ selectedCurrencyId: currencyId }),
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
  deductCurrencyBalance: (currencyId, amountToDeduct) => {
    set((state) => ({
      currencies: state.currencies.map((currency) =>
        currency.id === currencyId
          ? { ...currency, balance: Math.max(0, currency.balance - amountToDeduct) } 
          : currency
      ),
    }));
  },
}));

