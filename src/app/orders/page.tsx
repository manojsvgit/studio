
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useOrderStore } from '@/stores/order-store';
import type { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PackageSearch, ShoppingBag, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { getOrders } = useOrderStore();
  const [hydratedOrders, setHydratedOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const syncOrders = () => {
      setHydratedOrders(useOrderStore.getState().getOrders());
    };
    syncOrders();
    const unsubscribe = useOrderStore.subscribe(syncOrders);
    return () => unsubscribe();
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
        <PackageSearch className="w-16 h-16 text-muted-foreground mb-4 animate-pulse" />
        <p className="text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (hydratedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
        <PackageSearch className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-foreground">No Orders Yet</h1>
        <p className="text-lg text-muted-foreground mb-8">
          It looks like you haven&apos;t placed any orders.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" /> Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Your Orders</h1>
      <div className="space-y-6">
        {hydratedOrders.map((order) => (
          <Card key={order.id} className="shadow-lg bg-card text-card-foreground overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-2 p-4 sm:p-6 border-b border-border">
              <div>
                <CardTitle className="text-xl text-card-foreground">Order #{order.id.replace('WM-', '')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Placed on: {format(new Date(order.purchaseDate), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
                 {order.transactionId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Transaction ID: {order.transactionId}
                  </p>
                )}
              </div>
              <div className={`mt-2 sm:mt-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
                ${order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {order.status}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 border-b border-border last:border-b-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover w-20 h-20 flex-shrink-0"
                      data-ai-hint={item.dataAiHint || 'product image'}
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-md text-card-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                       <p className="text-sm text-muted-foreground">
                        Price per item: ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-md font-medium text-card-foreground self-start sm:self-center mt-2 sm:mt-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 p-4 sm:p-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left sm:text-right w-full">
                 {order.cryptoUsed && order.amountInCrypto && order.cryptoSymbol && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Paid with: {order.amountInCrypto.toFixed(order.cryptoSymbol === 'BTC' || order.cryptoSymbol === 'ETH' ? 8 : 6)} {order.cryptoSymbol} ({order.cryptoUsed})
                    </p>
                  )}
                <div className="flex justify-end items-baseline gap-2">
                    <p className="text-lg font-semibold text-card-foreground">Order Total:</p>
                    <p className="text-2xl font-bold text-accent">${order.totalAmountUSD.toFixed(2)}</p>
                </div>
              </div>
              {/* Future: Track order button
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                Track Order <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
