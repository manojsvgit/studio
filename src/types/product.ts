export interface CryptoPrices {
  BTC: number;
  ETH: number;
  USDT: number;
  USDC: number;
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  cryptoPrices: CryptoPrices;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  weight?: string;
  dimensions?: string;
  nutritionFacts?: Record<string, any>;
  createdAt: string; 
  updatedAt: string;
  slug: string;
  dataAiHint?: string; 