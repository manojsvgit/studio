
'use client';

import Image from 'next/image';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCartIcon, Trash2Icon } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, items } = useCartStore();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [hydratedIsInCart, setHydratedIsInCart] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsub = useCartStore.subscribe(
      (state) => setHydratedIsInCart(state.items.some(item => item.id === product.id)),
      (state) => state.items
    );
    setHydratedIsInCart(useCartStore.getState().items.some(item => item.id === product.id));
    return () => unsub();
  }, [product.id]);


  const handleToggleCart = () => {
    if (hydratedIsInCart) {
      removeFromCart(product.id);
      toast({
        title: "Removed from cart",
        description: `${product.name} has been removed from your cart.`,
        variant: "destructive",
      });
    } else {
      addToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 bg-card hover:-translate-y-1 transform">
      <CardHeader className="p-0 relative">
        {isClient ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={300}
            className="object-cover w-full h-48"
            data-ai-hint={product.dataAiHint || 'product image'}
            
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center animate-pulse">
            {/* Optional: add a spinner or placeholder icon here */}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 text-card-foreground">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
          {product.description.substring(0, 70)}{product.description.length > 70 ? '...' : ''}
        </CardDescription>
        <p className="text-xl font-bold text-accent mb-2">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        {isClient ? (
          <Button
            className="w-full"
            variant={hydratedIsInCart ? "destructive" : "default"}
            onClick={handleToggleCart}
          >
            {hydratedIsInCart ? (
              <>
                <Trash2Icon className="mr-2 h-4 w-4" /> Remove from Cart
              </>
            ) : (
              <>
                <ShoppingCartIcon className="mr-2 h-4 w-4" /> Add to Cart
              </>
            )}
          </Button>
        ) : (
          <Button className="w-full" variant="default" disabled>
            <div className="mr-2 h-4 w-4 bg-muted rounded animate-pulse" />
             Loading...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
