
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
import { Input } from '@/components/ui/input';
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
const USD_TO_INR_RATE = 83; // Example conversion rate

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const { getCartTotal, items: cartItems, clearCart } = useCartStore();
  const { currencies: walletCurrencies, selectedCurrencyId: defaultWalletCurrencyId, deductCurrencyBalance } = useWalletStore();

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
    
    if (availableCryptoCurrencies.length > 0 && !selectedCrypto) {
      const defaultSelected = availableCryptoCurrencies.find(c => c.id === defaultWalletCurrencyId && c.symbol !== 'INR') || 
                              availableCryptoCurrencies.find(c => c.symbol !== 'INR'); // Fallback to first non-INR crypto
      if (defaultSelected) {
        setSelectedCrypto(defaultSelected);
      }
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

    const amountInSelectedCrypto = cartTotalUSD / (selectedCrypto.priceInINR / USD_TO_INR_RATE);
    const transactionFeeInSelectedCrypto = MOCK_CRYPTO_TRANSACTION_FEE_USD / (selectedCrypto.priceInINR / USD_TO_INR_RATE);
    const totalPayableCrypto = amountInSelectedCrypto + transactionFeeInSelectedCrypto;
    
    if (selectedCrypto.balance < totalPayableCrypto) {
      toast({
        title: 'Insufficient Balance',
        description: `You do not have enough ${selectedCrypto.symbol} to complete this transaction. Required: ${totalPayableCrypto.toFixed(6)} ${selectedCrypto.symbol}`,
        variant: 'destructive',
      });
      return;
    }

    // Actual payment processing logic
    deductCurrencyBalance(selectedCrypto.id, totalPayableCrypto);
    clearCart();
    
    toast({
      title: 'Payment Successful!',
      description: `Paid ${totalPayableCrypto.toFixed(6)} ${selectedCrypto.symbol}. Your order has been placed. Redirecting...`,
    });
    
    // router.push('/orders/success'); // Uncomment when success page is ready
     setTimeout(() => router.push('/products'), 2000); 
  };

  const handleLocalPay = () => {
    toast({
      title: 'Coming Soon',
      description: 'Payment with local currency (INR) is not yet implemented.',
    });
  };

  if (!isClient || (cartTotalUSD === 0 && cartItems.length > 0) ) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading payment details...</p>
        </div>
    );
  }
  
  const amountInSelectedCrypto = selectedCrypto ? cartTotalUSD / (selectedCrypto.priceInINR / USD_TO_INR_RATE) : 0;
  const transactionFeeInSelectedCrypto = selectedCrypto ? MOCK_CRYPTO_TRANSACTION_FEE_USD / (selectedCrypto.priceInINR / USD_TO_INR_RATE) : 0;
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
                  <Label htmlFor="amount-usd" className="text-sm font-medium">Amount to Pay (USD)</Label>
                  <Input id="amount-usd" value={`$${cartTotalUSD.toFixed(2)}`} readOnly className="mt-1 bg-input border-border text-lg font-semibold" />
                </div>

                {selectedCrypto && (
                  <Card className="bg-secondary/30 p-4 space-y-2 border border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Total ({selectedCrypto.symbol}):</span>
                      <span className="font-medium text-card-foreground">{amountInSelectedCrypto.toFixed(selectedCrypto.symbol === 'BTC' || selectedCrypto.symbol === 'ETH' ? 8 : 6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Transaction Fee ({selectedCrypto.symbol}):</span>
                      <span className="font-medium text-card-foreground">{transactionFeeInSelectedCrypto.toFixed(selectedCrypto.symbol === 'BTC' || selectedCrypto.symbol === 'ETH' ? 8 : 6)}</span>
                    </div>
                    <Separator className="my-1 bg-border"/>
                    <div className="flex justify-between text-md font-semibold">
                      <span className="text-accent">Total Payable ({selectedCrypto.symbol}):</span>
                      <span className="text-accent">{totalPayableCrypto.toFixed(selectedCrypto.symbol === 'BTC' || selectedCrypto.symbol === 'ETH' ? 8 : 6)}</span>
                    </div>
                     {selectedCrypto.balance < totalPayableCrypto && (
                        <div className="flex items-center text-xs text-destructive mt-1 p-2 bg-destructive/10 rounded-md">
                            <AlertTriangle className="h-4 w-4 mr-2"/> Insufficient {selectedCrypto.symbol} balance. Available: {selectedCrypto.balance.toFixed(selectedCrypto.symbol === 'BTC' || selectedCrypto.symbol === 'ETH' ? 8 : 4)}
                        </div>
                    )}
                  </Card>
                )}
                 <div className="text-xs text-muted-foreground p-2 border border-dashed border-border rounded-md flex items-start">
                    <Info size={16} className="mr-2 mt-0.5 text-accent shrink-0"/>
                    <div>
                        Ensure you select the correct network. Sending funds to the wrong network may result in permanent loss.
                        Transaction fees are estimates and may vary. 1 USD ≈ {USD_TO_INR_RATE} INR for calculations.
                    </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount-inr" className="text-sm font-medium">Amount to Pay (INR)</Label>
                  <Input id="amount-inr" value={`₹${(cartTotalUSD * USD_TO_INR_RATE).toFixed(2)}`} readOnly className="mt-1 bg-input border-border text-lg font-semibold" />
                   <p className="text-xs text-muted-foreground mt-1">(Assuming 1 USD = ₹{USD_TO_INR_RATE})</p>
                </div>
                <Card className="bg-secondary/30 p-4 border border-border">
                   <p className="text-muted-foreground text-center">
                    Payment via local currency (UPI, Cards, etc.) will be available soon.
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="mt-6 p-6 border-t border-border">
          {/* The button will depend on the active tab. */}
            <Tabs defaultValue="crypto" className="w-full"> {/* Outer Tabs to control button visibility based on selected payment method */}
              <TabsContent value="crypto" className="mt-0">
                  <Button 
                    onClick={handleCryptoPay} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    size="lg" 
                    disabled={!selectedCrypto || availableCryptoCurrencies.length === 0 || (selectedCrypto && selectedCrypto.balance < totalPayableCrypto)}
                  >
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

