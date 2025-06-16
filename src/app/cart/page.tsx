
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import type { CartItem } from '@/types/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusIcon, PlusIcon, Trash2Icon, ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  // Note: We don't destructure `items` directly from useCartStore for direct rendering
  // to better manage hydration. Actions can be destructured.
  const { removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCartStore();
  const { toast } = useToast();

  // State to hold cart data that is safe for hydration
  const [hydratedItems, setHydratedItems] = useState<CartItem[]>([]);
  const [hydratedTotal, setHydratedTotal] = useState<number>(0);
  const [hydratedItemCount, setHydratedItemCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    // Function to synchronize local component state with the Zustand store state
    const syncWithStore = () => {
      const state = useCartStore.getState();
      setHydratedItems(state.items);
      setHydratedTotal(state.getCartTotal());
      setHydratedItemCount(state.getCartItemCount());
    };

    syncWithStore(); // Initial sync when component mounts on client

    const unsubscribe = useCartStore.subscribe(syncWithStore); // Subscribe to subsequent store changes

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  const handleRemoveFromCart = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast({
      title: "Item Removed",
      description: `${productName} has been removed from your cart.`,
      variant: "destructive",
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number, productName: string) => {
    updateQuantity(productId, quantity); // Store logic handles removal if quantity <= 0
     if (quantity > 0) {
      toast({
        title: "Quantity Updated",
        description: `Quantity for ${productName} updated to ${quantity}.`,
      });
    } else {
       // This toast is shown if the quantity was reduced to 0 or less from the cart page UI
       toast({
        title: "Item Removed",
        description: `${productName} has been removed from your cart.`,
        variant: "destructive",
      });
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
      variant: "destructive",
    });
  }

  if (!isClient) {
    // Render nothing or a loading skeleton on the server and during initial client render before hydration
    return null; // Or a loading spinner, or basic empty cart structure
  }

  if (hydratedItemCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <ShoppingCartIcon className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-foreground">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-card-foreground">Your Shopping Cart</CardTitle>
          <CardDescription className="text-muted-foreground">
            Review items in your cart and proceed to checkout. You have {hydratedItemCount} item(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hydratedItems.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 py-4 border-b border-border last:border-b-0">
              <Image
                src={item.images[0]}
                alt={item.name}
                width={100}
                height={100}
                className="rounded-md object-cover w-24 h-24 md:w-32 md:h-32"
                data-ai-hint={item.dataAiHint || 'product image'}
              />
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-lg font-semibold text-card-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                  className="h-8 w-8"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center text-card-foreground">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                  className="h-8 w-8"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-lg font-semibold text-accent w-24 text-center md:text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFromCart(item.id, item.name)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove item"
              >
                <Trash2Icon className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Separator className="my-6 bg-border" />
          <div className="flex justify-end items-center gap-4 mb-2">
            <p className="text-xl font-semibold text-card-foreground">Subtotal:</p>
            <p className="text-2xl font-bold text-accent">${hydratedTotal.toFixed(2)}</p>
          </div>
           <div className="text-right text-xs text-muted-foreground">
            Taxes and shipping calculated at checkout.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-t border-border">
           <Button
            variant="outline"
            onClick={handleClearCart}
            className="w-full md:w-auto border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="mr-2 h-4 w-4" /> Clear Cart
          </Button>
          <Button
            size="lg"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => toast({ title: "Coming Soon!", description: "Checkout functionality is not yet implemented."})}
          >
            Proceed to Checkout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
