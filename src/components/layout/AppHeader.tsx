
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, type ChangeEvent, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { 
  Bell, UserCircle, Wallet as WalletIcon, Search, Settings, ChevronDown, LogOut, ShoppingCartIcon, 
  ShieldCheckIcon, Send, AlertTriangle, X, Euro, JapaneseYen, IndianRupee, DollarSign, House, 
  MessageSquareWarning, Info, Gift, ShoppingBasket, CircleDot, Trash2, ChevronLeft, ClipboardCopy, CreditCard
} from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import { useCartStore } from '@/stores/cart-store';
import { useNotificationStore } from '@/stores/notification-store';
import type { Notification } from '@/types/notification';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';
import { useToast } from '@/hooks/use-toast';
import type { WalletCurrency } from '@/types/wallet';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';


const fiatDisplayOptions = [
  { value: 'USD', label: 'USD', Icon: DollarSign, color: 'text-green-500' },
  { value: 'EUR', label: 'EUR', Icon: Euro, color: 'text-blue-500' },
  { value: 'JPY', label: 'JPY', Icon: JapaneseYen, color: 'text-yellow-500' },
  { value: 'INR', label: 'INR', Icon: IndianRupee, color: 'text-yellow-600' },
  { value: 'ARS', label: 'ARS', textSymbol: 'ARS$', color: 'text-sky-400' },
  { value: 'CAD', label: 'CAD', Icon: DollarSign, color: 'text-orange-500' },
  { value: 'CLP', label: 'CLP', textSymbol: 'CLP$', color: 'text-blue-400' },
  { value: 'CNY', label: 'CNY', Icon: JapaneseYen, color: 'text-red-500' },
  { value: 'GHS', label: 'GHS', textSymbol: 'GH₵', color: 'text-green-400' },
  { value: 'IDR', label: 'IDR', textSymbol: 'Rp', color: 'text-red-400' },
  { value: 'KES', label: 'KES', textSymbol: 'KSh', color: 'text-muted-foreground' },
  { value: 'KRW', label: 'KRW', textSymbol: '₩', color: 'text-blue-600' },
  { value: 'MXN', label: 'MXN', textSymbol: 'MXN$', color: 'text-green-700' },
  { value: 'NGN', label: 'NGN', textSymbol: '₦', color: 'text-green-800' },
  { value: 'PEN', label: 'PEN', textSymbol: 'S/.', color: 'text-red-600' },
  { value: 'PHP', label: 'PHP', textSymbol: '₱', color: 'text-sky-500' },
  { value: 'PLN', label: 'PLN', textSymbol: 'zł', color: 'text-red-700' },
  { value: 'RUB', label: 'RUB', textSymbol: '₽', color: 'text-red-800' }, 
  { value: 'TRY', label: 'TRY', textSymbol: '₺', color: 'text-red-900' }, 
  { value: 'VND', label: 'VND', textSymbol: '₫', color: 'text-red-400' },
];

const MOCK_CRYPTO_WITHDRAW_NETWORKS = [
  { id: 'eth', name: 'ETH (ERC20)' },
  { id: 'bsc', name: 'BSC (BEP20)' },
  { id: 'polygon', name: 'Polygon (Matic)' },
  { id: 'tron', name: 'TRX (TRC20)' },
];
const MOCK_CRYPTO_MIN_WITHDRAWAL_INR = 215.20;
const MOCK_CRYPTO_TRANSACTION_FEE_INR = 86.08;
const MOCK_INR_MIN_WITHDRAWAL_INR = 500;
const MOCK_INR_TRANSACTION_FEE_INR = 25;


const getCategoryIcon = (category?: Notification['category']) => {
  switch (category) {
    case 'order': return <ShoppingBasket className="h-4 w-4 text-blue-500" />;
    case 'promo': return <Gift className="h-4 w-4 text-purple-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error': return <MessageSquareWarning className="h-4 w-4 text-red-500" />;
    case 'success': return <ShieldCheckIcon className="h-4 w-4 text-green-500" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-sky-500" />;
  }
};


const AppHeader = () => {
  const router = useRouter();
  const {
    searchTerm,
    setSearchTerm,
    getFilteredCurrencies,
    selectedCurrencyId,
    setSelectedCurrencyId,
    currencies: walletCurrenciesFromStore, // Renamed to avoid conflict
    getTotalPortfolioValueINR,
    deductCurrencyBalance,
    addCurrencyBalance,
  } = useWalletStore();

  const { getCartItemCount } = useCartStore();
  const { 
    getNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotificationStore();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  
  const [hydratedCartItemCount, setHydratedCartItemCount] = useState<number>(0);
  const [hydratedWalletDisplay, setHydratedWalletDisplay] = useState<{ iconSymbol: string, text: string, color?: string } | null>(null);
  const [hydratedNotifications, setHydratedNotifications] = useState<Notification[]>([]);
  const [hydratedUnreadCount, setHydratedUnreadCount] = useState<number>(0);
  
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState('overview');


  // Tip State
  const [selectedTipCurrencyId, setSelectedTipCurrencyId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [tipError, setTipError] = useState<string | null>(null);

  // Buy Crypto State
  const [selectedCryptoToBuyId, setSelectedCryptoToBuyId] = useState<string | null>(null);
  const [buyAmountInFiat, setBuyAmountInFiat] = useState('');
  const [buyFiatCurrency, setBuyFiatCurrency] = useState('INR'); 
  const [buyError, setBuyError] = useState<string | null>(null);

  // Wallet Settings State
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [displayCryptoInFiat, setDisplayCryptoInFiat] = useState(true);
  const [selectedFiatDisplayCurrency, setSelectedFiatDisplayCurrency] = useState('INR');

  // Withdraw Crypto State
  const [selectedWithdrawCryptoId, setSelectedWithdrawCryptoId] = useState<string | null>(null);
  const [withdrawCryptoNetwork, setWithdrawCryptoNetwork] = useState<string>('');
  const [withdrawCryptoAmount, setWithdrawCryptoAmount] = useState('');
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState('');
  const [withdrawCryptoError, setWithdrawCryptoError] = useState<string | null>(null);

  // Withdraw INR State
  const [withdrawINRAmount, setWithdrawINRAmount] = useState('');
  const [withdrawINRAccountDetails, setWithdrawINRAccountDetails] = useState('');
  const [withdrawINRError, setWithdrawINRError] = useState<string | null>(null);


  const totalWalletBalanceINR = getTotalPortfolioValueINR();

  const walletCurrencies = useMemo(() => walletCurrenciesFromStore, [walletCurrenciesFromStore]);

  const availableCryptoCurrenciesForTipOrWithdraw = useMemo(() => {
    return walletCurrencies.filter(c => c.balance > 0 && c.symbol !== 'INR');
  }, [walletCurrencies]);

  const cryptoCurrenciesForPurchase = useMemo(() => {
    return walletCurrencies.filter(c => c.symbol !== 'INR');
  }, [walletCurrencies]);

  const inrCurrency = useMemo(() => {
    return walletCurrencies.find(c => c.symbol === 'INR');
  }, [walletCurrencies]);


  useEffect(() => {
    setIsClient(true);

    const syncCartCount = () => setHydratedCartItemCount(useCartStore.getState().getCartItemCount());
    syncCartCount();
    const unsubCart = useCartStore.subscribe(syncCartCount);

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
    const unsubWallet = useWalletStore.subscribe(syncWalletDisplay);
    
    const syncNotifications = () => {
        setHydratedNotifications(useNotificationStore.getState().getNotifications());
        setHydratedUnreadCount(useNotificationStore.getState().getUnreadCount());
    };
    syncNotifications();
    const unsubNotifications = useNotificationStore.subscribe(syncNotifications);

    return () => {
      unsubCart();
      unsubWallet();
      unsubNotifications();
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


  const selectedTipCurrency = useMemo(() => {
    return availableCryptoCurrenciesForTipOrWithdraw.find(c => c.id === selectedTipCurrencyId) || null;
  }, [availableCryptoCurrenciesForTipOrWithdraw, selectedTipCurrencyId]);

  const selectedWithdrawCrypto = useMemo(() => {
    return availableCryptoCurrenciesForTipOrWithdraw.find(c => c.id === selectedWithdrawCryptoId) || null;
  }, [availableCryptoCurrenciesForTipOrWithdraw, selectedWithdrawCryptoId]);


  const filteredCurrencies = getFilteredCurrencies();

  const handleEnable2FA = () => toast({ title: "Enable 2FA Action", description: "2FA setup is not yet implemented." });

  const handleTipAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (/^\d*\.?\d*$/.test(value) || value === '') {
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

    setSelectedTipCurrencyId(null);
    setTipAmount('');
    setRecipientPhoneNumber('');
  };

  const isTipButtonDisabled = !selectedTipCurrency || !tipAmount || parseFloat(tipAmount) <= 0 || !recipientPhoneNumber || (selectedTipCurrency && parseFloat(tipAmount) > selectedTipCurrency.balance);

  const handleBuyAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
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
  };

  const isBuyButtonDisabled = !selectedCryptoToBuyId || !buyAmountInFiat || parseFloat(buyAmountInFiat) <= 0;

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setNotificationDropdownOpen(false);
  };

  const handleWithdrawCryptoAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setWithdrawCryptoAmount(value);
      setWithdrawCryptoError(null);
    }
  };
  
  const handleSetMaxWithdrawCrypto = () => {
    if (selectedWithdrawCrypto) {
      const feeInCrypto = MOCK_CRYPTO_TRANSACTION_FEE_INR / selectedWithdrawCrypto.priceInINR;
      const maxAmount = Math.max(0, selectedWithdrawCrypto.balance - feeInCrypto);
      setWithdrawCryptoAmount(maxAmount.toFixed(selectedWithdrawCrypto.symbol === 'BTC' || selectedWithdrawCrypto.symbol === 'ETH' ? 8 : 6));
      setWithdrawCryptoError(null);
    }
  };
  
  const handleWithdrawCrypto = () => {
    setWithdrawCryptoError(null);
    if (!selectedWithdrawCrypto) {
      setWithdrawCryptoError("Please select a cryptocurrency."); return;
    }
    if (!withdrawCryptoNetwork) {
      setWithdrawCryptoError("Please select a network."); return;
    }
    const amount = parseFloat(withdrawCryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawCryptoError("Please enter a valid positive amount."); return;
    }
    if (!withdrawCryptoAddress.trim()) {
      setWithdrawCryptoError("Please enter a withdrawal address."); return;
    }
    const minWithdrawalInCrypto = MOCK_CRYPTO_MIN_WITHDRAWAL_INR / selectedWithdrawCrypto.priceInINR;
    if (amount < minWithdrawalInCrypto) {
      setWithdrawCryptoError(`Minimum withdrawal is ${minWithdrawalInCrypto.toFixed(6)} ${selectedWithdrawCrypto.symbol} (₹${MOCK_CRYPTO_MIN_WITHDRAWAL_INR}).`); return;
    }
    const feeInCrypto = MOCK_CRYPTO_TRANSACTION_FEE_INR / selectedWithdrawCrypto.priceInINR;
    if (amount + feeInCrypto > selectedWithdrawCrypto.balance) {
      setWithdrawCryptoError(`Insufficient balance for amount + fee. Available: ${selectedWithdrawCrypto.balance.toFixed(6)} ${selectedWithdrawCrypto.symbol}. Required: ${(amount + feeInCrypto).toFixed(6)} ${selectedWithdrawCrypto.symbol}.`); return;
    }

    deductCurrencyBalance(selectedWithdrawCrypto.id, amount + feeInCrypto);
    toast({
      title: "Withdrawal Initiated",
      description: `${amount.toFixed(6)} ${selectedWithdrawCrypto.symbol} withdrawal to ${withdrawCryptoAddress} via ${withdrawCryptoNetwork} network is being processed.`,
    });
    setWithdrawCryptoAmount('');
    setWithdrawCryptoAddress('');
    setSelectedWithdrawCryptoId(null);
    setWithdrawCryptoNetwork('');
  };

  const isWithdrawCryptoDisabled = 
    !selectedWithdrawCryptoId || 
    !withdrawCryptoNetwork || 
    !withdrawCryptoAmount || 
    parseFloat(withdrawCryptoAmount) <= 0 ||
    !withdrawCryptoAddress ||
    (selectedWithdrawCrypto && (parseFloat(withdrawCryptoAmount) + (MOCK_CRYPTO_TRANSACTION_FEE_INR / selectedWithdrawCrypto.priceInINR)) > selectedWithdrawCrypto.balance) ||
    (selectedWithdrawCrypto && parseFloat(withdrawCryptoAmount) < (MOCK_CRYPTO_MIN_WITHDRAWAL_INR / selectedWithdrawCrypto.priceInINR));


  const handleWithdrawINRAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setWithdrawINRAmount(value);
      setWithdrawINRError(null);
    }
  };

  const handleSetMaxWithdrawINR = () => {
    if (inrCurrency) {
      const maxAmount = Math.max(0, inrCurrency.balance - MOCK_INR_TRANSACTION_FEE_INR);
      setWithdrawINRAmount(maxAmount.toFixed(2));
      setWithdrawINRError(null);
    }
  };
  
  const handleWithdrawINR = () => {
    setWithdrawINRError(null);
    if (!inrCurrency) {
        setWithdrawINRError("INR currency data not found."); return;
    }
    const amount = parseFloat(withdrawINRAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawINRError("Please enter a valid positive amount."); return;
    }
    if (!withdrawINRAccountDetails.trim()) {
      setWithdrawINRError("Please enter bank account details."); return;
    }
    if (amount < MOCK_INR_MIN_WITHDRAWAL_INR) {
      setWithdrawINRError(`Minimum withdrawal is ₹${MOCK_INR_MIN_WITHDRAWAL_INR}.`); return;
    }
    if (amount + MOCK_INR_TRANSACTION_FEE_INR > inrCurrency.balance) {
      setWithdrawINRError(`Insufficient INR balance for amount + fee. Available: ₹${inrCurrency.balance.toFixed(2)}. Required: ₹${(amount + MOCK_INR_TRANSACTION_FEE_INR).toFixed(2)}.`); return;
    }
  
    deductCurrencyBalance(inrCurrency.id, amount + MOCK_INR_TRANSACTION_FEE_INR);
    toast({
      title: "INR Withdrawal Initiated",
      description: `₹${amount.toFixed(2)} withdrawal to your bank account is being processed.`,
    });
    setWithdrawINRAmount('');
    setWithdrawINRAccountDetails('');
  };
  
  const isWithdrawINRDisabled = 
    !inrCurrency ||
    !withdrawINRAmount || 
    parseFloat(withdrawINRAmount) <= 0 ||
    !withdrawINRAccountDetails ||
    (inrCurrency && (parseFloat(withdrawINRAmount) + MOCK_INR_TRANSACTION_FEE_INR) > inrCurrency.balance) ||
    parseFloat(withdrawINRAmount) < MOCK_INR_MIN_WITHDRAWAL_INR;


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
            <Tabs value={activeWalletTab} onValueChange={setActiveWalletTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 border-b border-border rounded-none h-auto p-0">
                <TabsTrigger value="overview" className="text-xs py-2.5 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:bg-transparent data-[state=active]:shadow-none">Overview</TabsTrigger>
                <TabsTrigger value="buy-crypto" className="text-xs py-2.5 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:bg-transparent data-[state=active]:shadow-none">Buy</TabsTrigger>
                <TabsTrigger value="tip" className="text-xs py-2.5 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:bg-transparent data-[state=active]:shadow-none">Tip</TabsTrigger>
                <TabsTrigger value="settings-tab" className="text-xs py-2.5 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:bg-transparent data-[state=active]:shadow-none">Settings</TabsTrigger>
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
                     {isClient ? <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /> : <div className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 bg-muted rounded"/>}
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
                                setWalletDropdownOpen(false); 
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
                    <Button variant="outline" size="sm" onClick={() => setActiveWalletTab('withdraw')} className="w-full border-primary text-primary hover:bg-primary/10 text-xs h-9">Withdraw</Button>
                    <Button variant="default" size="sm" onClick={() => setActiveWalletTab('deposit')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9">Deposit</Button>
                  </div>

                  <Separator className="bg-border"/>

                  <Card className="bg-secondary/30 border-border">
                    <CardContent className="pt-4 p-3">
                      <div className="flex flex-col items-center text-center">
                          {isClient ? <ShieldCheckIcon className="h-8 w-8 text-accent mb-2" /> : <div className="h-8 w-8 bg-muted rounded mb-2" />}
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
                                    {isClient && selectedCryptoToBuyId && walletCurrencies.find(c => c.id === selectedCryptoToBuyId) ? (
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
                                                {isClient ? <CryptoCurrencyIcon symbol="INR" className="h-4 w-4 text-green-500"/> : <div className="h-4 w-4 bg-muted rounded"/> } INR
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {buyError && (
                            <div className="flex items-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                               {isClient ? <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> : <div className="h-4 w-4 mr-2 shrink-0 bg-muted rounded"/>}
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
                            {isClient ? <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" /> : <div className="h-7 w-7 bg-muted rounded mb-1.5" />}
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
                        value={selectedTipCurrencyId || ''}
                        onValueChange={(value) => {
                          setSelectedTipCurrencyId(value);
                          setTipError(null);
                        }}
                      >
                        <SelectTrigger id="tip-currency" className="w-full mt-1 bg-input border-border h-11">
                          {isClient && selectedTipCurrency ? (
                            <div className="flex items-center gap-2">
                              <CryptoCurrencyIcon symbol={selectedTipCurrency.symbol} className={`h-5 w-5 ${selectedTipCurrency.color || 'text-foreground'}`} />
                              <span>{selectedTipCurrency.name} ({selectedTipCurrency.symbol})</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select a currency" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {availableCryptoCurrenciesForTipOrWithdraw.length > 0 ? availableCryptoCurrenciesForTipOrWithdraw.map(currency => (
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
                      {isClient && selectedTipCurrency && (
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
                            {isClient && selectedTipCurrency?.symbol || 'QTY'}
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
                        {isClient ? <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> : <div className="h-4 w-4 mr-2 shrink-0 bg-muted rounded"/>}
                        {tipError}
                      </div>
                    )}

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mt-2"
                      onClick={handleSendTip}
                      disabled={isTipButtonDisabled}
                    >
                      {isClient ? <Send className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4 bg-muted rounded"/>} Tip
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdraw" className="p-0 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-secondary" onClick={() => setActiveWalletTab('overview')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h4 className="text-md font-semibold text-card-foreground">Withdraw</h4>
                </div>
                <Tabs defaultValue="crypto-withdraw" className="w-full p-4 pt-0">
                    <TabsList className="grid w-full grid-cols-2 mb-4 mt-4 bg-background">
                        <TabsTrigger value="crypto-withdraw">Crypto</TabsTrigger>
                        <TabsTrigger value="local-currency-withdraw">Local Currency</TabsTrigger>
                    </TabsList>
                    <TabsContent value="crypto-withdraw">
                        <Card className="bg-secondary/30 border-border shadow-none">
                            <CardContent className="space-y-4 p-4">
                                <div>
                                    <Label htmlFor="withdraw-crypto-currency" className="text-xs font-medium text-muted-foreground">Currency</Label>
                                    <Select value={selectedWithdrawCryptoId || ''} onValueChange={id => {setSelectedWithdrawCryptoId(id); setWithdrawCryptoError(null);}}>
                                        <SelectTrigger id="withdraw-crypto-currency" className="w-full mt-1 bg-input border-border h-11">
                                             {isClient && selectedWithdrawCrypto ? (
                                                <div className="flex items-center gap-2 justify-between w-full">
                                                   <div className="flex items-center gap-2">
                                                        <CryptoCurrencyIcon symbol={selectedWithdrawCrypto.symbol} className={`h-5 w-5 ${selectedWithdrawCrypto.color || 'text-foreground'}`} />
                                                        <span>{selectedWithdrawCrypto.name} ({selectedWithdrawCrypto.symbol})</span>
                                                    </div>
                                                    <div className="text-right text-xs">
                                                        <div>{selectedWithdrawCrypto.balance.toFixed(selectedWithdrawCrypto.symbol === 'BTC' || selectedWithdrawCrypto.symbol === 'ETH' ? 8 : 4)}</div>
                                                        <div className="text-muted-foreground">≈ ₹{(selectedWithdrawCrypto.balance * selectedWithdrawCrypto.priceInINR).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            ) : <SelectValue placeholder="Select currency" />}
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            {availableCryptoCurrenciesForTipOrWithdraw.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="hover:bg-secondary focus:bg-secondary">
                                                    <div className="flex items-center gap-2 justify-between w-full">
                                                        <div className="flex items-center gap-2">
                                                          <CryptoCurrencyIcon symbol={c.symbol} className={`h-5 w-5 ${c.color || 'text-foreground'}`} />
                                                          <div>{c.name} ({c.symbol})</div>
                                                        </div>
                                                        <div className="text-right text-xs">
                                                          <div>{c.balance.toFixed(c.symbol === 'BTC' || c.symbol === 'ETH' ? 8 : 4)}</div>
                                                          <div className="text-muted-foreground">≈ ₹{(c.balance * c.priceInINR).toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="withdraw-crypto-network" className="text-xs font-medium text-muted-foreground">Network</Label>
                                    <Select value={withdrawCryptoNetwork} onValueChange={setWithdrawCryptoNetwork}>
                                        <SelectTrigger id="withdraw-crypto-network" className="w-full mt-1 bg-input border-border h-11">
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border">
                                            {MOCK_CRYPTO_WITHDRAW_NETWORKS.map(network => (
                                                <SelectItem key={network.id} value={network.name} className="hover:bg-secondary focus:bg-secondary">{network.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="withdraw-crypto-amount" className="text-xs font-medium text-muted-foreground">Amount <span className="text-destructive">*</span></Label>
                                    <div className="relative mt-1 flex items-center">
                                        <Input id="withdraw-crypto-amount" type="text" value={withdrawCryptoAmount} onChange={handleWithdrawCryptoAmountChange} placeholder={`0.00000000 ${selectedWithdrawCrypto?.symbol || ''}`} className="bg-input border-border h-11 flex-grow rounded-r-none pr-[100px]" />
                                        <div className="absolute right-0 top-0 h-11 flex items-center pr-1">
                                            <Button type="button" variant="ghost" size="sm" className="text-xs h-8 px-2 text-primary hover:bg-primary/10" onClick={() => {/* TODO: Fiat toggle */}}>₹</Button>
                                            <Button type="button" variant="ghost" size="sm" className="text-xs h-8 px-2 text-primary hover:bg-primary/10" onClick={handleSetMaxWithdrawCrypto}>Max</Button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="withdraw-crypto-address" className="text-xs font-medium text-muted-foreground">Address <span className="text-destructive">*</span></Label>
                                     <div className="relative mt-1 flex items-center">
                                        <Input id="withdraw-crypto-address" type="text" value={withdrawCryptoAddress} onChange={e => setWithdrawCryptoAddress(e.target.value)} placeholder="Enter withdrawal address" className="bg-input border-border h-11 flex-grow pr-10" />
                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary">
                                          <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                                    <div className="flex justify-between">
                                        <span>Minimum Withdrawal:</span>
                                        <span>₹{MOCK_CRYPTO_MIN_WITHDRAWAL_INR.toFixed(2)} {selectedWithdrawCrypto ? `(${(MOCK_CRYPTO_MIN_WITHDRAWAL_INR / selectedWithdrawCrypto.priceInINR).toFixed(6)} ${selectedWithdrawCrypto.symbol})` : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Transaction Fee:</span>
                                        <span className="text-accent">₹{MOCK_CRYPTO_TRANSACTION_FEE_INR.toFixed(2)} {selectedWithdrawCrypto ? `(${(MOCK_CRYPTO_TRANSACTION_FEE_INR / selectedWithdrawCrypto.priceInINR).toFixed(6)} ${selectedWithdrawCrypto.symbol})` : ''}</span>
                                    </div>
                                </div>
                                {withdrawCryptoError && (
                                    <div className="flex items-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                                        <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {withdrawCryptoError}
                                    </div>
                                )}
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mt-2" onClick={handleWithdrawCrypto} disabled={isWithdrawCryptoDisabled}>Withdraw</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="local-currency-withdraw">
                         <Card className="bg-secondary/30 border-border shadow-none">
                            <CardContent className="space-y-4 p-4">
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Currency</Label>
                                    <div className="flex items-center justify-between w-full mt-1 bg-input border-border h-11 px-3 py-2 rounded-md text-sm">
                                        <div className="flex items-center gap-2">
                                            <CryptoCurrencyIcon symbol="INR" className="h-5 w-5 text-green-500" />
                                            <span>Indian Rupee (INR)</span>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div>{inrCurrency?.balance.toFixed(2) || '0.00'}</div>
                                            <div className="text-muted-foreground">Available Balance</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="withdraw-inr-amount" className="text-xs font-medium text-muted-foreground">Amount <span className="text-destructive">*</span></Label>
                                    <div className="relative mt-1 flex items-center">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                                        <Input id="withdraw-inr-amount" type="text" value={withdrawINRAmount} onChange={handleWithdrawINRAmountChange} placeholder="0.00" className="bg-input border-border h-11 flex-grow pl-7 pr-[50px]" />
                                        <div className="absolute right-0 top-0 h-11 flex items-center pr-1">
                                            <Button type="button" variant="ghost" size="sm" className="text-xs h-8 px-2 text-primary hover:bg-primary/10" onClick={handleSetMaxWithdrawINR}>Max</Button>
                                        </div>
                                    </div>
                                </div>
                                 <div>
                                    <Label htmlFor="withdraw-inr-account" className="text-xs font-medium text-muted-foreground">Bank Account Details <span className="text-destructive">*</span></Label>
                                    <Textarea id="withdraw-inr-account" value={withdrawINRAccountDetails} onChange={e => setWithdrawINRAccountDetails(e.target.value)} placeholder="Enter A/C No, IFSC, Name..." className="mt-1 bg-input border-border min-h-[80px]" />
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                                    <div className="flex justify-between"><span>Minimum Withdrawal:</span><span>₹{MOCK_INR_MIN_WITHDRAWAL_INR.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Transaction Fee:</span><span className="text-accent">₹{MOCK_INR_TRANSACTION_FEE_INR.toFixed(2)}</span></div>
                                </div>
                                {withdrawINRError && (
                                    <div className="flex items-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                                        <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {withdrawINRError}
                                    </div>
                                )}
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 mt-2" onClick={handleWithdrawINR} disabled={isWithdrawINRDisabled}>Withdraw INR</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                 <div className="p-4 pt-2">
                    <Separator className="my-4 bg-border"/>
                    <div className="flex flex-col items-center text-center p-2">
                        {isClient ? <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" /> : <div className="h-7 w-7 bg-muted rounded mb-1.5" />}
                        <h3 className="text-sm font-medium text-card-foreground">Improve your account security</h3>
                        <p className="text-xs text-muted-foreground mb-2.5">Enable Two-Factor Authentication.</p>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleEnable2FA}>Enable 2FA</Button>
                    </div>
                </div>
              </TabsContent>
              
              <TabsContent value="deposit" className="p-0 max-h-[calc(70vh-10rem)] overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-secondary" onClick={() => setActiveWalletTab('overview')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h4 className="text-md font-semibold text-card-foreground">Deposit</h4>
                </div>
                <div className="p-4">
                  <Card className="bg-secondary/30 border-border shadow-none">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-primary opacity-70" />
                      <p className="text-sm">Deposit functionality is currently unavailable.</p>
                      <p className="text-xs mt-1">Please check back later or contact support for assistance.</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 pt-2">
                    <Separator className="my-4 bg-border"/>
                    <div className="flex flex-col items-center text-center p-2">
                        {isClient ? <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" /> : <div className="h-7 w-7 bg-muted rounded mb-1.5" />}
                        <h3 className="text-sm font-medium text-card-foreground">Improve your account security</h3>
                        <p className="text-xs text-muted-foreground mb-2.5">Enable Two-Factor Authentication.</p>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleEnable2FA}>Enable 2FA</Button>
                    </div>
                </div>
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
                        className="grid grid-cols-3 sm:grid-cols-4 gap-x-2 gap-y-4"
                      >
                        {fiatDisplayOptions.map(({ value, label, Icon, textSymbol, color }) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`fiat-${value}`} />
                            <Label htmlFor={`fiat-${value}`} className="flex items-center gap-1.5 text-xs cursor-pointer text-card-foreground">
                              {label}
                              {isClient && Icon ? <Icon className={cn("h-3 w-3", color)} /> : isClient && textSymbol ? <span className={cn("text-xs font-mono", color)}>{textSymbol}</span> : <div className="h-3 w-3 bg-muted rounded"/>}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <Separator className="my-4 bg-border"/>
                    <div className="flex flex-col items-center text-center p-2">
                        {isClient ? <ShieldCheckIcon className="h-7 w-7 text-accent mb-1.5" /> : <div className="h-7 w-7 bg-muted rounded mb-1.5"/>}
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

      <div className="flex items-center gap-1 md:gap-2">
        <DropdownMenu open={notificationDropdownOpen} onOpenChange={setNotificationDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="text-foreground hover:bg-accent hover:text-accent-foreground relative">
              {isClient ? <Bell className="h-5 w-5" /> : <div className="h-5 w-5 bg-muted rounded" />}
              {isClient && hydratedUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {hydratedUnreadCount > 9 ? '9+' : hydratedUnreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 md:w-96 p-0 bg-card border-border shadow-xl" align="end">
            <DropdownMenuLabel className="flex justify-between items-center p-3 text-card-foreground border-b border-border">
              <span className="text-lg font-semibold">Notifications</span>
              {isClient && hydratedUnreadCount > 0 && (
                 <Button variant="link" size="sm" className="text-xs p-0 h-auto text-primary hover:underline" onClick={() => { markAllAsRead(); setNotificationDropdownOpen(false); }}>Mark all as read</Button>
              )}
            </DropdownMenuLabel>
            {isClient && hydratedNotifications.length > 0 ? (
              <>
                <ScrollArea className="h-[300px] md:h-[350px]">
                  {hydratedNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-3 hover:bg-secondary focus:bg-secondary cursor-pointer border-b border-border last:border-b-0",
                        !notification.isRead && "bg-secondary/50"
                      )}
                      onSelect={() => handleNotificationClick(notification)}
                    >
                      {!notification.isRead && (
                        <CircleDot className="h-3 w-3 text-primary mt-1.5 flex-shrink-0" />
                      )}
                       <div className={cn("flex-shrink-0 mt-1", notification.isRead && "ml-[18px]")}>
                        {getCategoryIcon(notification.category)}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className={cn("text-sm font-medium text-card-foreground truncate", !notification.isRead && "font-semibold")}>{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
                {hydratedNotifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-border"/>
                    <DropdownMenuItem
                      onSelect={() => { clearNotifications(); setNotificationDropdownOpen(false); }}
                      className="flex items-center justify-center gap-2 p-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Clear All Notifications
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {isClient ? <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" /> : <div className="h-10 w-10 mx-auto mb-2 opacity-50 bg-muted rounded-full"/>}
                You have no new notifications.
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
             <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/orders" className="flex items-center w-full">
                {isClient ? <ShoppingBasket className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4 bg-muted rounded"/>}
                <span className="text-sm text-card-foreground">My Orders</span>
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
    
