
'use client';

import Link from 'next/link';
import { useState, useEffect, type ChangeEvent, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, UserCircle, Wallet as WalletIcon, Search, Settings, ChevronDown, LogOut, ShoppingCartIcon, ShieldCheckIcon, Send, AlertTriangle, X, Euro, JapaneseYen, IndianRupee, DollarSign, House } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import { useCartStore } from '@/stores/cart-store';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';
import { useToast } from '@/hooks/use-toast';
import type { WalletCurrency } from '@/types/wallet';

const fiatDisplayOptions = [
  { value: 'USD', label: 'USD', Icon: DollarSign, color: 'text-green-500' },
  { value: 'EUR', label: 'EUR', Icon: Euro, color: 'text-blue-500' },
  { value: 'JPY', label: 'JPY', Icon: JapaneseYen, color: 'text-yellow-500' },
  { value: 'INR', label: 'INR', Icon: IndianRupee, color: 'text-yellow-600' },
  { value: 'ARS', label: 'ARS', textSymbol: 'ARS$', color: 'text-sky-400' },
  { value: 'CAD', label: 'CAD', Icon: DollarSign, color: 'text-orange-500' },
  { value: 'CLP', label: 'CLP', textSymbol: 'CLP$', color: 'text-blue-400' },
  { value: 'CNY', label: 'CNY', Icon: JapaneseYen, color: 'text-red-500' }, // Using Yen as proxy
  { value: 'GHS', label: 'GHS', textSymbol: 'GH₵', color: 'text-green-400' },
  { value: 'IDR', label: 'IDR', textSymbol: 'Rp', color: 'text-red-400' },
  { value: 'KES', label: 'KES', textSymbol: 'KSh', color: 'text-black' }, // Placeholder color
  { value: 'KRW', label: 'KRW', textSymbol: '₩', color: 'text-blue-600' },
  { value: 'MXN', label: 'MXN', textSymbol: 'MXN$', color: 'text-green-700' },
  { value: 'NGN', label: 'NGN', textSymbol: '₦', color: 'text-green-800' },
  { value: 'PEN', label: 'PEN', textSymbol: 'S/.', color: 'text-red-600' },
  { value: 'PHP', label: 'PHP', textSymbol: '₱', color: 'text-sky-500' },
  { value: 'PLN', label: 'PLN', textSymbol: 'zł', color: 'text-red-700' },
  { value: 'RUB', label: 'RUB', textSymbol: '₽', color: 'text-red-800' }, // No direct Ruble icon
  { value: 'TRY', label: 'TRY', textSymbol: '₺', color: 'text-red-900' }, // No direct Lira icon
  { value: 'VND', label: 'VND', textSymbol: '₫', color: 'text-red-400' },
];


const AppHeader = () => {
  const {
    searchTerm,
    setSearchTerm,
    getFilteredCurrencies,
    selectedCurrencyId,
    setSelectedCurrencyId,
    currencies: walletCurrencies,
    getTotalPortfolioValueINR,
    deductCurrencyBalance,
    addCurrencyBalance,
  } = useWalletStore();

  const { getCartItemCount } = useCartStore();
  const { toast } = useToast();

  const [hydratedCartItemCount, setHydratedCartItemCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [hydratedWalletDisplay, setHydratedWalletDisplay] = useState<{ iconSymbol: string, text: string, color?: string } | null>(null);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  const [selectedTipCurrency, setSelectedTipCurrency] = useState<WalletCurrency | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [tipError, setTipError] = useState<string | null>(null);

  const [selectedCryptoToBuyId, setSelectedCryptoToBuyId] = useState<string | null>(null);
  const [buyAmountInFiat, setBuyAmountInFiat] = useState('');
  const [buyFiatCurrency, setBuyFiatCurrency] = useState('INR');
  const [buyError, setBuyError] = useState<string | null>(null);

  // Wallet Settings Tab State
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [displayCryptoInFiat, setDisplayCryptoInFiat] = useState(true);
  const [selectedFiatDisplayCurrency, setSelectedFiatDisplayCurrency] = useState('INR');


  const totalWalletBalanceINR = getTotalPortfolioValueINR();

  const availableCryptoCurrenciesForTip = useMemo(() => {
    return walletCurrencies.filter(c => c.balance > 0 && c.symbol !== 'INR');
  }, [walletCurrencies]);

  const cryptoCurrenciesForPurchase = useMemo(() => {
    return walletCurrencies.filter(c => c.symbol !== 'INR');
  }, [walletCurrencies]);


  useEffect(() => {
    setIsClient(true);

    const syncCartCount = () => {
      setHydratedCartItemCount(useCartStore.getState().getCartItemCount());
    };
    syncCartCount();
    const unsubscribeCart = useCartStore.subscribe(syncCartCount);

    const syncWalletDisplay = () => {
      const storeState = useWalletStore.getState();
      const currentActiveCurrency = storeState.currencies.find(c => c.id === storeState.selectedCurrencyId) ||
                                   storeState.currencies.find(c => c.symbol === 'INR') ||
                                   (storeState.currencies.length > 0 ? storeState.currencies[0] : null);
      if (currentActiveCurrency) {
        setHydratedWalletDisplay({
          iconSymbol: currentActiveCurrency.symbol,
          text: `₹${(currentActiveCurrency.balance * currentActiveCurrency.priceInINR).toFixed(2)}`,
          color: currentActiveCurrency.color,
        });
      } else {
         setHydratedWalletDisplay({ iconSymbol: 'default', text: 'Wallet', color: 'text-primary-foreground' });
      }
    };
    syncWalletDisplay();
    const unsubscribeWallet = useWalletStore.subscribe(syncWalletDisplay);

    return () => {
      unsubscribeCart();
      unsubscribeWallet();
    };
  }, []);

  useEffect(() => {
    if (isClient && cryptoCurrenciesForPurchase.length > 0 && !selectedCryptoToBuyId) {
      const firstCryptoId = cryptoCurrenciesForPurchase[0].id;
      if (selectedCryptoToBuyId !== firstCryptoId) {
           setSelectedCryptoToBuyId(firstCryptoId);
      }
    }
  }, [isClient, cryptoCurrenciesForPurchase, selectedCryptoToBuyId]);


  const filteredCurrencies = getFilteredCurrencies();

  const handleWithdraw = () => toast({ title: "Withdraw Action", description: "Withdraw functionality is not yet implemented." });
  const handleDeposit = () => toast({ title: "Deposit Action", description: "Deposit functionality is not yet implemented." });
  const handleEnable2FA = () => toast({ title: "Enable 2FA Action", description: "2FA setup is not yet implemented." });

  const handleTipAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (/^\d*\.?\d*$/.test(value)) {
      setTipAmount(value);
      setTipError(null);
    }
  };

  const handleSendTip = () => {
    setTipError(null);
    if (!selectedTipCurrency) {
      setTipError("Please select a currency to tip with.");
      return;
    }
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      setTipError("Please enter a valid positive amount.");
      return;
    }
    if (!recipientPhoneNumber.trim()) {
      setTipError("Please enter the recipient's phone number.");
      return;
    }
    if (amount > selectedTipCurrency.balance) {
      setTipError(`Insufficient ${selectedTipCurrency.symbol} balance. You have ${selectedTipCurrency.balance.toFixed(selectedTipCurrency.symbol === 'BTC' || selectedTipCurrency.symbol === 'ETH' ? 8 : 4)}.`);
      return;
    }

    deductCurrencyBalance(selectedTipCurrency.id, amount);
    toast({
      title: "Tip Sent!",
      description: `Tip of ${amount.toFixed(selectedTipCurrency.symbol === 'BTC' || selectedTipCurrency.symbol === 'ETH' ? 8 : 4)} ${selectedTipCurrency.symbol} sent to ${recipientPhoneNumber} successfully.`,
    });

    setSelectedTipCurrency(null);
    setTipAmount('');
    setRecipientPhoneNumber('');
    setWalletDropdownOpen(false); // Close dropdown after tipping
  };

  const isTipButtonDisabled = !selectedTipCurrency || !tipAmount || !recipientPhoneNumber || parseFloat(tipAmount) <= 0 || (selectedTipCurrency && parseFloat(tipAmount) > selectedTipCurrency.balance);

  const handleBuyAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setBuyAmountInFiat(value);
      setBuyError(null);
    }
  };

  const handleBuyCrypto = () => {
    setBuyError(null);
    const cryptoToBuy = walletCurrencies.find(c => c.id === selectedCryptoToBuyId);
    if (!cryptoToBuy) {
      setBuyError("Please select a cryptocurrency to buy.");
      return;
    }
    const amountFiat = parseFloat(buyAmountInFiat);
    if (isNaN(amountFiat) || amountFiat <= 0) {
      setBuyError("Please enter a valid positive amount to spend.");
      return;
    }

    const cryptoAmountBought = amountFiat / cryptoToBuy.priceInINR;
    addCurrencyBalance(cryptoToBuy.id, cryptoAmountBought);

    toast({
      title: "Purchase Successful!",
      description: `Successfully bought ${cryptoAmountBought.toFixed(cryptoToBuy.symbol === 'BTC' || cryptoToBuy.symbol === 'ETH' ? 8 : 6)} ${cryptoToBuy.symbol}.`,
    });

    setBuyAmountInFiat('');
    setWalletDropdownOpen(false); // Close dropdown after buying
  };

  const isBuyButtonDisabled = !selectedCryptoToBuyId || !buyAmountInFiat || parseFloat(buyAmountInFiat) <= 0;


  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
         <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
            {isClient ? <House className="h-6 w-6" /> : <div className="h-6 w-6 bg-muted rounded" />}
            <span className="hidden sm:inline-block">WalmartChain</span>
        </Link>
      </div>

      <div className="flex flex-1 justify-center">
        <DropdownMenu open={walletDropdownOpen} onOpenChange={setWalletDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px] flex items-center justify-between px-3"
            >
              <div className="flex items-center overflow-hidden">
                {isClient && hydratedWalletDisplay ? (
                  <>
                    <CryptoCurrencyIcon symbol={hydratedWalletDisplay.iconSymbol} className={`mr-2 h-5 w-5 flex-shrink-0 ${hydratedWalletDisplay.color || 'text-primary-foreground'}`} />
                    <span className="truncate text-sm">
                      {hydratedWalletDisplay.text}
                    </span>
                  </>
                ) : (
                  <>
                    {isClient ? <WalletIcon className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4 bg-muted rounded" />}
                    <span className="truncate text-sm">Wallet</span>
                  </>
                )}
              </div>
              {isClient ? <ChevronDown className="ml-2 h-4 w-4 opacity-80 flex-shrink-0" /> : <div className="ml-2 h-4 w-4 opacity-80 flex-shrink-0 bg-muted rounded" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 md:w-96 p-0 bg-card border-border shadow-xl" align="center">
             <div className="flex justify-between items-center p-3 border-b border-border relative">
                <div className="flex items-center gap-2">
                    {isClient ? <WalletIcon className="h-5 w-5 text-card-foreground" /> : <div className="h-5 w-5 bg-muted rounded"/>}
                    <h3 className="text-lg font-semibold text-card-foreground">Wallet</h3>
                </div>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-sm opacity-70 hover:opacity-100 hover:bg-secondary"
                    onClick={() => setWalletDropdownOpen(false)}
                    aria-label="Close wallet"
                  >
                    {isClient ? <X className="h-4 w-4 text-muted-foreground" /> : <div className="h-4 w-4 bg-muted rounded"/>}
                 </Button>
            </div>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-background/70 rounded-none p-1 h-11 border-b border-border">
                <TabsTrigger value="overview" className="text-xs data-[state=active]:border-b-primary data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Overview</TabsTrigger>
                <TabsTrigger value="buy-crypto" className="text-xs data-[state=active]:border-b-primary data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Buy Crypto</TabsTrigger>
                <TabsTrigger value="tip" className="text-xs data-[state=active]:border-b-primary data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Tip</TabsTrigger>
                <TabsTrigger value="settings-tab" className="text-xs data-[state=active]:border-b-primary data-[state=active]:border-b-2 data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-3 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <div className="space-y-4">
                  <Card className="bg-secondary/30 border-border">
                    <CardHeader className="p-3">
                      <CardDescription className="text-muted-foreground text-xs">Total Portfolio Value</CardDescription>
                      <CardTitle className="text-2xl text-accent">
                        ₹{totalWalletBalanceINR.toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search Currencies..."
                      className="pl-8 h-9 text-sm bg-input border-border focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Card className="bg-secondary/30 border-border">
                     <CardHeader className="p-3 pb-1">
                        <div className="flex justify-between items-center font-semibold text-muted-foreground px-1 mb-1">
                            <div className="text-xs">Currency</div>
                            <div className="text-xs text-right">Balance</div>
                        </div>
                        <Separator className="bg-border"/>
                      </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[150px] md:h-[180px] px-2 py-1">
                        {filteredCurrencies.length === 0 ? (
                          <p className="p-3 text-xs text-center text-muted-foreground">No currencies found.</p>
                        ) : (
                          filteredCurrencies.map((currency) => (
                            <DropdownMenuItem
                              key={currency.id}
                              className="flex justify-between items-center p-2 hover:bg-card/50 focus:bg-card/50 cursor-pointer rounded-md"
                              onSelect={() => {
                                setSelectedCurrencyId(currency.id);
                                setWalletDropdownOpen(false); // Close dropdown on selection
                              }}
                              disabled={currency.id === selectedCurrencyId}
                            >
                              <div className="flex items-center gap-2">
                                <CryptoCurrencyIcon symbol={currency.symbol} className={`h-5 w-5 ${currency.color || 'text-card-foreground'}`} />
                                <div>
                                  <span className="font-medium text-xs text-card-foreground">{currency.symbol}</span>
                                  <div className="text-xs text-muted-foreground">{currency.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-card-foreground">
                                  {currency.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: (currency.symbol === 'BTC' || currency.symbol === 'ETH' ? 8 : 4)})}
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  ≈ ₹{(currency.balance * currency.priceInINR).toFixed(2)}
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" onClick={handleWithdraw} className="w-full border-primary text-primary hover:bg-primary/10 text-xs h-9">Withdraw</Button>
                    <Button variant="default" size="sm" onClick={handleDeposit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9">Deposit</Button>
                  </div>

                  <Separator className="bg-border"/>

                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 p-3">
                      <div className="flex flex-col items-center text-center">
                          <ShieldCheckIcon className="h-8 w-8 text-accent mb-2" />
                          <h3 className="text-sm font-semibold text-card-foreground">Improve account security</h3>
                          <p className="text-xs text-muted-foreground mb-3">Enable Two-Factor Authentication.</p>
                          <Button variant="outline" size="sm" className="w-full text-xs h-9" onClick={handleEnable2FA}>Enable 2FA</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="buy-crypto" className="p-4 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <Card className="bg-secondary/30 border-border shadow-none">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg text-card-foreground">Buy Crypto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        <div>
                            <Label htmlFor="buy-crypto-select" className="text-xs font-medium text-muted-foreground">Buy</Label>
                            <Select
                                value={selectedCryptoToBuyId || ''}
                                onValueChange={(value) => {
                                    setSelectedCryptoToBuyId(value);
                                    setBuyError(null);
                                }}
                            >
                                <SelectTrigger id="buy-crypto-select" className="w-full mt-1 bg-input border-border h-11">
                                    {selectedCryptoToBuyId && walletCurrencies.find(c => c.id === selectedCryptoToBuyId) ? (
                                        <div className="flex items-center gap-2">
                                            <CryptoCurrencyIcon symbol={walletCurrencies.find(c => c.id === selectedCryptoToBuyId)!.symbol} className={`h-5 w-5 ${walletCurrencies.find(c => c.id === selectedCryptoToBuyId)!.color || 'text-foreground'}`} />
                                            <span>{walletCurrencies.find(c => c.id === selectedCryptoToBuyId)!.name} ({walletCurrencies.find(c => c.id === selectedCryptoToBuyId)!.symbol})</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Select crypto to buy" />
                                    )}
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    {cryptoCurrenciesForPurchase.map(currency => (
                                        <SelectItem key={currency.id} value={currency.id} className="hover:bg-secondary focus:bg-secondary">
                                            <div className="flex items-center gap-2">
                                                <CryptoCurrencyIcon symbol={currency.symbol} className={`h-5 w-5 ${currency.color || 'text-foreground'}`} />
                                                <div>{currency.name} ({currency.symbol})</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="buy-amount-fiat" className="text-xs font-medium text-muted-foreground">Amount <span className="text-destructive">*</span></Label>
                            <div className="relative mt-1 flex items-center">
                                <Input
                                    id="buy-amount-fiat"
                                    type="text"
                                    value={buyAmountInFiat}
                                    onChange={handleBuyAmountChange}
                                    placeholder="0"
                                    className="bg-input border-border h-11 flex-grow rounded-r-none"
                                />
                                <Select value={buyFiatCurrency} onValueChange={setBuyFiatCurrency}>
                                    <SelectTrigger className="w-[90px] bg-input border-border border-l-0 h-11 rounded-l-none">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        <SelectItem value="INR">
                                            <div className="flex items-center gap-1">
                                                <CryptoCurrencyIcon symbol="INR" className="h-4 w-4 text-green-500"/> INR
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {buyError && (
                            <div className="flex items-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                                <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
                                {buyError}
                            </div>
                        )}
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mt-2"
                            onClick={handleBuyCrypto}
                            disabled={isBuyButtonDisabled}
                        >
                            Buy
                        </Button>
                        <Separator className="my-4 bg-border"/>
                        <div className="flex flex-col items-center text-center p-2">
                            <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" />
                            <h3 className="text-sm font-medium text-card-foreground">Improve your account security</h3>
                            <p className="text-xs text-muted-foreground mb-2.5">Enable Two-Factor Authentication.</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleEnable2FA}>Enable 2FA</Button>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tip" className="p-4 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <Card className="bg-secondary/30 border-border shadow-none">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg text-card-foreground">Send a Tip</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Quickly send crypto to a phone number.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4">
                    <div>
                      <Label htmlFor="tip-currency" className="text-xs font-medium text-muted-foreground">Tip From Wallet</Label>
                      <Select
                        value={selectedTipCurrency?.id || ''}
                        onValueChange={(value) => {
                          const newSelectedCrypto = availableCryptoCurrenciesForTip.find(c => c.id === value);
                          setSelectedTipCurrency(newSelectedCrypto || null);
                          setTipError(null);
                        }}
                      >
                        <SelectTrigger id="tip-currency" className="w-full mt-1 bg-input border-border h-11">
                          {selectedTipCurrency ? (
                            <div className="flex items-center gap-2">
                              <CryptoCurrencyIcon symbol={selectedTipCurrency.symbol} className={`h-5 w-5 ${selectedTipCurrency.color || 'text-foreground'}`} />
                              <span>{selectedTipCurrency.name} ({selectedTipCurrency.symbol})</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select a currency" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {availableCryptoCurrenciesForTip.length > 0 ? availableCryptoCurrenciesForTip.map(currency => (
                            <SelectItem key={currency.id} value={currency.id} className="hover:bg-secondary focus:bg-secondary">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <CryptoCurrencyIcon symbol={currency.symbol} className={`h-5 w-5 ${currency.color || 'text-foreground'}`} />
                                  <div>
                                    <div className="text-sm">{currency.name} ({currency.symbol})</div>
                                    <div className="text-xs text-muted-foreground">
                                      Bal: {currency.balance.toFixed(currency.symbol === 'BTC' || currency.symbol === 'ETH' ? 8 : 4)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-right text-muted-foreground">
                                  ≈ ₹{(currency.balance * currency.priceInINR).toFixed(2)}
                                </div>
                              </div>
                            </SelectItem>
                          )) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">No crypto with balance available for tipping.</div>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedTipCurrency && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Available: {selectedTipCurrency.balance.toFixed(selectedTipCurrency.symbol === 'BTC' || selectedTipCurrency.symbol === 'ETH' ? 8 : 4)} {selectedTipCurrency.symbol}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tip-amount" className="text-xs font-medium text-muted-foreground">Amount <span className="text-destructive">*</span></Label>
                      <div className="relative mt-1">
                        <Input
                          id="tip-amount"
                          type="text"
                          value={tipAmount}
                          onChange={handleTipAmountChange}
                          placeholder="0.00"
                          className="bg-input border-border h-11 pr-20"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-muted-foreground text-sm">
                            {selectedTipCurrency?.symbol || 'QTY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="recipient-phone" className="text-xs font-medium text-muted-foreground">Phone Number <span className="text-destructive">*</span></Label>
                      <Input
                        id="recipient-phone"
                        type="tel"
                        value={recipientPhoneNumber}
                        onChange={(e) => {
                          setRecipientPhoneNumber(e.target.value);
                          setTipError(null);
                        }}
                        placeholder="Enter recipient's phone number"
                        className="mt-1 bg-input border-border h-11"
                      />
                    </div>

                    {tipError && (
                      <div className="flex items-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                        <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
                        {tipError}
                      </div>
                    )}

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mt-2"
                      onClick={handleSendTip}
                      disabled={isTipButtonDisabled}
                    >
                      <Send className="mr-2 h-4 w-4" /> Tip
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings-tab" className="p-4 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <Card className="bg-secondary/30 border-border shadow-none">
                  <CardContent className="space-y-6 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="hide-zero-balances" className="font-medium text-card-foreground">Hide Zero Balances</Label>
                        <p className="text-xs text-muted-foreground">Your zero balances won&apos;t appear in your wallet.</p>
                      </div>
                      <Switch
                        id="hide-zero-balances"
                        checked={hideZeroBalances}
                        onCheckedChange={setHideZeroBalances}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="display-crypto-in-fiat" className="font-medium text-card-foreground">Display Crypto in Fiat</Label>
                        <p className="text-xs text-muted-foreground">All bets & transactions will be settled in the crypto equivalent.</p>
                      </div>
                      <Switch
                        id="display-crypto-in-fiat"
                        checked={displayCryptoInFiat}
                        onCheckedChange={setDisplayCryptoInFiat}
                      />
                    </div>
                    
                    <Separator className="bg-border"/>

                    <div>
                      <Label className="text-sm font-medium text-card-foreground mb-2 block">Fiat Display Currency</Label>
                      <RadioGroup
                        value={selectedFiatDisplayCurrency}
                        onValueChange={setSelectedFiatDisplayCurrency}
                        className="grid grid-cols-4 gap-x-2 gap-y-4"
                      >
                        {fiatDisplayOptions.map(({ value, label, Icon, textSymbol, color }) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`fiat-${value}`} />
                            <Label htmlFor={`fiat-${value}`} className="flex items-center gap-1.5 text-xs cursor-pointer text-card-foreground">
                              {label}
                              {Icon ? <Icon className={`h-3 w-3 ${color}`} /> : <span className={`text-xs font-mono ${color}`}>{textSymbol}</span>}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <Separator className="my-4 bg-border"/>
                    <div className="flex flex-col items-center text-center p-2">
                        <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" />
                        <h3 className="text-sm font-medium text-card-foreground">Improve your account security</h3>
                        <p className="text-xs text-muted-foreground mb-2.5">Enable Two-Factor Authentication.</p>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleEnable2FA}>Enable 2FA</Button>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          {isClient ? <Bell className="h-5 w-5" /> : <div className="h-5 w-5 bg-muted rounded" />}
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Shopping Cart" className="text-foreground hover:bg-accent hover:text-accent-foreground relative">
          <Link href="/cart">
            {isClient ? <ShoppingCartIcon className="h-5 w-5" /> : <div className="h-5 w-5 bg-muted rounded" />}
            {isClient && hydratedCartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                {hydratedCartItemCount}
              </span>
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User Profile" className="text-foreground hover:bg-accent hover:text-accent-foreground">
              {isClient ? <UserCircle className="h-6 w-6" /> : <div className="h-6 w-6 bg-muted rounded-full" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border shadow-xl" align="end">
            <DropdownMenuLabel className="font-normal text-card-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/settings" className="flex items-center w-full">
                {isClient ? <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4 bg-muted rounded"/>}
                <span className="text-sm text-card-foreground">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border"/>
            <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/logout" className="flex items-center w-full">
                {isClient ? <LogOut className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4 bg-muted rounded" />}
                <span className="text-sm text-card-foreground">Logout</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
