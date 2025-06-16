
'use client';

import Image from 'next/image';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCartIcon, Trash2Icon } from 'lucide-react'; // Added Trash2Icon
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Destructure actions and items for checking if product is in cart
  const { addToCart, removeFromCart, items } = useCartStore();
  const { toast } = useToast();

  const isInCart = items.some(item => item.id === product.id);

  const handleToggleCart = () => {
    if (isInCart) {
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
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader className="p-0 relative">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={300}
          className="object-cover w-full h-48"
          data-ai-hint={product.dataAiHint || 'product image'}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 text-card-foreground">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden">
          {product.description.substring(0, 70)}{product.description.length > 70 ? '...' : ''}
        </CardDescription>
        <p className="text-xl font-bold text-accent mb-2">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <Button
          className="w-full"
          variant={isInCart ? "destructive" : "default"}
          onClick={handleToggleCart}
        >
          {isInCart ? (
            <>
              <Trash2Icon className="mr-2 h-4 w-4" /> Remove from Cart
            </>
          ) : (
            <>
              <ShoppingCartIcon className="mr-2 h-4 w-4" /> Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
