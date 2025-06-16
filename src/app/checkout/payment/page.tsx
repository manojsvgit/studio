
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { WalletCurrency } from '@/types/wallet';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Added Input for displaying amount
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, AlertTriangle, Info } from 'lucide-react';

const MOCK_NETWORKS = [
  { id: 'eth', name: 'Ethereum (ERC20)' },
  { id: 'bsc', name: 'BNB Smart Chain (BEP20)' },
  { id: 'polygon', name: 'Polygon (Matic)' },
  { id: 'tron', name: 'Tron (TRC20)' },
];

const MOCK_CRYPTO_TRANSACTION_FEE_USD = 1.50; // Example fee in USD

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { getCartTotal, items: cartItems, clearCart } = useCartStore();
  // Ensure walletStore actions are correctly typed or used if needed for deduction later
  const { currencies: walletCurrencies, selectedCurrencyId: defaultWalletCurrencyId } = useWalletStore();

  const [isClient, setIsClient] = useState(false);
  const [cartTotalUSD, setCartTotalUSD] = useState(0);
  
  const [selectedCrypto, setSelectedCrypto] = useState<WalletCurrency | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>(MOCK_NETWORKS[0]?.id || '');
  
  const availableCryptoCurrencies = walletCurrencies.filter(c => c.balance > 0 && c.symbol !== 'INR');

  useEffect(() => {
    setIsClient(true);
    const total = getCartTotal();
    setCartTotalUSD(total);

    if (total === 0 && cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Redirecting to products page.',
        variant: 'destructive',
      });
      router.push('/products');
    }
    
    // Pre-select a crypto if available
    if (availableCryptoCurrencies.length > 0 && !selectedCrypto) {
      const defaultSelectedCrypto = availableCryptoCurrencies.find(c => c.id === defaultWalletCurrencyId) || availableCryptoCurrencies[0];
      setSelectedCrypto(defaultSelectedCrypto);
    }

  }, [getCartTotal, cartItems, router, toast, availableCryptoCurrencies, defaultWalletCurrencyId, selectedCrypto]);

  const handleCryptoPay = () => {
    if (!selectedCrypto) {
      toast({ title: 'Error', description: 'Please select a cryptocurrency.', variant: 'destructive' });
      return;
    }
    if (!selectedNetwork) {
      toast({ title: 'Error', description: 'Please select a network.', variant: 'destructive' });
      return;
    }

    const amountInSelectedCrypto = cartTotalUSD / (selectedCrypto.priceInINR / 83); // Assuming 1 USD = 83 INR for conversion
    const transactionFeeInSelectedCrypto = MOCK_CRYPTO_TRANSACTION_FEE_USD / (selectedCrypto.priceInINR / 83);
    const totalPayableCrypto = amountInSelectedCrypto + transactionFeeInSelectedCrypto;
    
    if (selectedCrypto.balance < totalPayableCrypto) {
      toast({
        title: 'Insufficient Balance',
        description: `You do not have enough ${selectedCrypto.symbol} to complete this transaction. Required: ${totalPayableCrypto.toFixed(6)} ${selectedCrypto.symbol}`,
        variant: 'destructive',
      });
      return;
    }

    // Placeholder for actual payment processing logic
    toast({
      title: 'Payment Processing (Simulated)',
      description: `Paying ${totalPayableCrypto.toFixed(6)} ${selectedCrypto.symbol} for your order.`,
    });
    
    // Simulate successful payment for now
    // clearCart(); // We will implement actual deduction and cart clearing later
    // router.push('/orders/success'); 
    // For now, just show a success toast
     toast({
      title: 'Payment Successful (Simulated)',
      description: `Your order has been placed. Thank you for shopping with WalmartChain!`,
    });
  };

  const handleLocalPay = () => {
    toast({
      title: 'Coming Soon',
      description: 'Payment with local currency (INR) is not yet implemented.',
    });
  };

  if (!isClient || (cartTotalUSD === 0 && cartItems.length > 0) ) { // cartItems.length > 0 condition to avoid flicker on initial load if cart is truly empty
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </div>
    );
  }
  
  const amountInSelectedCrypto = selectedCrypto ? cartTotalUSD / (selectedCrypto.priceInINR / 83) : 0; // Assuming 1 USD = 83 INR
  const transactionFeeInSelectedCrypto = selectedCrypto ? MOCK_CRYPTO_TRANSACTION_FEE_USD / (selectedCrypto.priceInINR / 83) : 0;
  const totalPayableCrypto = amountInSelectedCrypto + transactionFeeInSelectedCrypto;


  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-lg">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-foreground hover:text-primary">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Button>
      <Card className="shadow-xl bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Payment</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose your payment method to complete the purchase of ${cartTotalUSD.toFixed(2)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-background">
              <TabsTrigger value="crypto">Crypto Currency</TabsTrigger>
              <TabsTrigger value="local">Local Currency (INR)</TabsTrigger>
            </TabsList>

            <TabsContent value="crypto">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="crypto-currency" className="text-sm font-medium">Currency</Label>
                  <Select
                    value={selectedCrypto?.id}
                    onValueChange={(value) => {
                      const newSelectedCrypto = availableCryptoCurrencies.find(c => c.id === value);
                      setSelectedCrypto(newSelectedCrypto || null);
                    }}
                  >
                    <SelectTrigger id="crypto-currency" className="w-full mt-1 bg-input border-border">
                      {selectedCrypto ? (
                        <div className="flex items-center gap-2">
                          <CryptoCurrencyIcon symbol={selectedCrypto.symbol} className={`h-5 w-5 ${selectedCrypto.color || 'text-foreground'}`} />
                          <span>{selectedCrypto.name} ({selectedCrypto.symbol})</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select a cryptocurrency" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {availableCryptoCurrencies.length > 0 ? availableCryptoCurrencies.map(currency => (
                        <SelectItem key={currency.id} value={currency.id} className="hover:bg-secondary focus:bg-secondary">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <CryptoCurrencyIcon symbol={currency.symbol} className={`h-5 w-5 ${currency.color || 'text-foreground'}`} />
                              <div>
                                <div>{currency.name} ({currency.symbol})</div>
                                <div className="text-xs text-muted-foreground">
                                  Balance: {currency.balance.toFixed(currency.symbol === 'BTC' || currency.symbol === 'ETH' ? 8 : 4)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-right text-muted-foreground">
                              ≈ ₹{(currency.balance * currency.priceInINR).toFixed(2)}
                            </div>
                          </div>
                        </SelectItem>
                      )) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">No crypto with balance available.</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="network" className="text-sm font-medium">Network</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger id="network" className="w-full mt-1 bg-input border-border">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {MOCK_NETWORKS.map(network => (
                        <SelectItem key={network.id} value={network.id} className="hover:bg-secondary focus:bg-secondary">
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount-crypto" className="text-sm font-medium">Amount to Pay (USD)</Label>
                  <Input id="amount-crypto" value={`$${cartTotalUSD.toFixed(2)}`} readOnly className="mt-1 bg-input border-border text-lg font-semibold" />
                </div>

                {selectedCrypto && (
                  <Card className="bg-secondary/30 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Total ({selectedCrypto.symbol}):</span>
                      <span className="font-medium text-card-foreground">{amountInSelectedCrypto.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Transaction Fee ({selectedCrypto.symbol}):</span>
                      <span className="font-medium text-card-foreground">{transactionFeeInSelectedCrypto.toFixed(6)}</span>
                    </div>
                    <Separator className="my-1 bg-border"/>
                    <div className="flex justify-between text-md font-semibold">
                      <span className="text-accent">Total Payable ({selectedCrypto.symbol}):</span>
                      <span className="text-accent">{totalPayableCrypto.toFixed(6)}</span>
                    </div>
                     {selectedCrypto.balance < totalPayableCrypto && (
                        <div className="flex items-center text-xs text-destructive mt-1 p-2 bg-destructive/10 rounded-md">
                            <AlertTriangle className="h-4 w-4 mr-2"/> Insufficient {selectedCrypto.symbol} balance.
                        </div>
                    )}
                  </Card>
                )}
                 <div className="text-xs text-muted-foreground p-2 border border-dashed border-border rounded-md flex items-start">
                    <Info size={16} className="mr-2 mt-0.5 text-accent shrink-0"/>
                    <div>
                        Ensure you select the correct network. Sending funds to the wrong network may result in permanent loss.
                        Transaction fees are estimates and may vary.
                    </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount-inr" className="text-sm font-medium">Amount to Pay (INR)</Label>
                  <Input id="amount-inr" value={`₹${(cartTotalUSD * 83).toFixed(2)}`} readOnly className="mt-1 bg-input border-border text-lg font-semibold" />
                   <p className="text-xs text-muted-foreground mt-1">(Assuming 1 USD = ₹83)</p>
                </div>
                <Card className="bg-secondary/30 p-4">
                   <p className="text-muted-foreground text-center">
                    Payment via local currency (UPI, Cards, etc.) will be available soon.
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="mt-6 p-6 border-t border-border">
          {/* The button will depend on the active tab. For simplicity, we can have a single button that checks active tab or two separate buttons shown conditionally */}
          <Tabs defaultValue="crypto" className="w-full">
             <TabsContent value="crypto" className="mt-0">
                <Button onClick={handleCryptoPay} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg" disabled={!selectedCrypto || (selectedCrypto && selectedCrypto.balance < totalPayableCrypto) || availableCryptoCurrencies.length === 0}>
                    Pay with {selectedCrypto?.symbol || 'Crypto'}
                </Button>
             </TabsContent>
             <TabsContent value="local" className="mt-0">
                <Button onClick={handleLocalPay} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                    Pay with INR
                </Button>
             </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </div>
  );
}

