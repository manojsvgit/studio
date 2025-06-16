
'use client';

import { mockProducts } from '@/data/mock-products';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';

export default function Home() {
  // Directly use mockProducts for display
  const productsToDisplay: Product[] = mockProducts.slice(0, 4); // Display first 4 mock products for brevity

  return (
    <div className="flex flex-col items-start justify-start space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Welcome to WalmartChain</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your blockchain-powered e-commerce experience.
        </p>
      </div>

      <div>
        <h2 className="text-3xl font-semibold mb-6 text-foreground">Featured Products</h2>
        {productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
           <p className="text-muted-foreground">No products available at the moment.</p>
        )}
      </div>
    </div>
  );
}
