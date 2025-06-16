
'use client';

import { mockProducts } from '@/data/mock-products';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const productsToDisplay: Product[] = mockProducts.slice(0, 4);

  return (
    <div className="flex flex-col items-start justify-start space-y-12">
      {/* Hero Section */}
      <section className="w-full bg-card p-8 md:p-12 rounded-xl shadow-2xl">
        <div className="flex items-center mb-4">
          <Sparkles className="h-10 w-10 text-accent mr-3 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-foreground">
            Welcome to WalmartChain
          </h1>
        </div>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Discover a new era of e-commerce, powered by blockchain. Secure, transparent, and innovative shopping at your fingertips.
        </p>
        <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground animate-bounce animation-delay-1000">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" /> Shop Now
          </Link>
        </Button>
      </section>

      {/* Featured Products Section */}
      <section className="w-full">
        <h2 className="text-3xl font-semibold mb-8 text-foreground">Featured Products</h2>
        {productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No products available at the moment.</p>
        )}
        {productsToDisplay.length > 0 && (
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
