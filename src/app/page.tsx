
'use client';

import { useEffect, useState } from 'react';
import { getTrendingProducts, type TrendingProductsOutput } from '@/ai/flows/trending-products';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Helper function to approximate crypto prices from USD
const approximateCryptoPrices = (usdPrice: number) => {
  // Example fixed rates, replace with dynamic rates if needed
  const btcRate = 60000; // 1 BTC = $60000 USD
  const ethRate = 3000;  // 1 ETH = $3000 USD
  return {
    BTC: usdPrice / btcRate,
    ETH: usdPrice / ethRate,
    USDT: usdPrice, // Assuming 1 USDT = 1 USD
    USDC: usdPrice, // Assuming 1 USDC = 1 USD
  };
};

// Helper to generate slug
const formatSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const result: TrendingProductsOutput = await getTrendingProducts({ count: 4 });
        
        if (result && result.products) {
          const mappedProducts: Product[] = result.products.map((aiProduct, index) => ({
            id: aiProduct.productId || `trend-${index}-${Date.now()}`,
            productId: aiProduct.productId || `trend-${index}-${Date.now()}`,
            name: aiProduct.name,
            brand: 'Walmart Trending', // Default brand
            category: aiProduct.category || 'Trending',
            subcategory: 'Hot Picks', // Default subcategory
            price: aiProduct.price,
            cryptoPrices: approximateCryptoPrices(aiProduct.price),
            description: aiProduct.description,
            images: [aiProduct.imageUrl || 'https://placehold.co/600x400.png'],
            rating: 4.0 + Math.random() * 0.9, // Random rating for variety
            reviewCount: Math.floor(Math.random() * 500), // Random review count
            inStock: true,
            stockCount: Math.floor(Math.random() * 50) + 10, // Random stock
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slug: formatSlug(aiProduct.name),
            dataAiHint: aiProduct.dataAiHint || aiProduct.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
          }));
          setTrendingProducts(mappedProducts);
        } else {
          setError('Could not load trending products.');
        }
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrendingProducts();
  }, []);

  return (
    <div className="flex flex-col items-start justify-start space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Welcome to WalmartChain</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your blockchain-powered e-commerce experience.
        </p>
      </div>

      <div>
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Trending Products</h2>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[192px] w-full rounded-xl" /> {/* Approx image height */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-8 w-full mt-2" /> {/* Button placeholder */}
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive-foreground">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Trending Products</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && trendingProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!isLoading && !error && trendingProducts.length === 0 && (
           <p className="text-muted-foreground">No trending products available at the moment.</p>
        )}
      </div>
    </div>
  );
}
