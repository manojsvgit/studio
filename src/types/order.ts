
import type { CartItem } from './cart';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Price per unit at the time of purchase
  image: string; // Main image for the item
  dataAiHint?: string;
}

export interface Order {
  id: string; // Unique order ID (e.g., timestamp or UUID)
  items: OrderItem[];
  totalAmountUSD: number; // Total amount in USD
  paymentMethod: string; // e.g., "Crypto"
  cryptoUsed?: string; // e.g., "Bitcoin (BTC)"
  amountInCrypto?: number;
  cryptoSymbol?: string;
  purchaseDate: string; // ISO date string
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  transactionId?: string; // Mock transaction ID
}
