
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Bell, UserCircle, Wallet as WalletIcon, Search, Settings, ChevronDown, LogOut, ShoppingCartIcon, ShieldCheckIcon } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import { useCartStore } from '@/stores/cart-store';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';
import { useToast } from '@/hooks/use-toast';

const AppHeader = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    getFilteredCurrencies,
    selectedCurrencyId,
    setSelectedCurrencyId,
    currencies,
    getTotalPortfolioValueINR,
  } = useWalletStore();
  
  const { getCartItemCount } = useCartStore();
  const { toast } = useToast();

  const [hydratedCartItemCount, setHydratedCartItemCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [hydratedWalletDisplay, setHydratedWalletDisplay] = useState<{ iconSymbol: string, text: string, color?: string } | null>(null);
  
  const totalWalletBalanceINR = getTotalPortfolioValueINR();

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

  const filteredCurrencies = getFilteredCurrencies();

  const handleWithdraw = () => toast({ title: "Withdraw Action", description: "Withdraw functionality is not yet implemented." });
  const handleDeposit = () => toast({ title: "Deposit Action", description: "Deposit functionality is not yet implemented." });
  const handleEnable2FA = () => toast({ title: "Enable 2FA Action", description: "2FA setup is not yet implemented." });

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2"> 
      </div>

      <div className="flex flex-1 justify-center"> 
        <DropdownMenu>
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
                    {isClient ? <WalletIcon className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4 bg-muted rounded" /> }
                    <span className="truncate text-sm">Wallet</span>
                  </>
                )}
              </div>
              {isClient ? <ChevronDown className="ml-2 h-4 w-4 opacity-80 flex-shrink-0" /> : <div className="ml-2 h-4 w-4 opacity-80 flex-shrink-0 bg-muted rounded" /> }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 md:w-96 p-0 bg-card border-border shadow-xl" align="center">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-background/70 rounded-t-md rounded-b-none p-1 h-11">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="buy-crypto" className="text-xs">Buy Crypto</TabsTrigger>
                <TabsTrigger value="tip" className="text-xs">Tip</TabsTrigger>
                <TabsTrigger value="settings-tab" className="text-xs">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="p-3 max-h-[70vh] overflow-y-auto">
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
                              onSelect={() => setSelectedCurrencyId(currency.id)}
                              disabled={currency.id === selectedCurrencyId} // Disable if already selected
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

              <TabsContent value="buy-crypto" className="p-3">
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground p-4 text-center text-sm">Buy Crypto functionality coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tip" className="p-3">
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                  <p className="text-muted-foreground p-4 text-center text-sm">Tip functionality coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings-tab" className="p-3">
                <Card className="bg-secondary/30 border-border">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground p-4 text-center text-sm">Specific wallet account settings will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2"> 
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          {isClient ? <Bell className="h-5 w-5" /> : <div className="h-5 w-5 bg-muted rounded" /> }
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Shopping Cart" className="text-foreground hover:bg-accent hover:text-accent-foreground relative">
          <Link href="/cart">
            {isClient ? <ShoppingCartIcon className="h-5 w-5" /> : <div className="h-5 w-5 bg-muted rounded" /> }
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
              {isClient ? <UserCircle className="h-6 w-6" /> : <div className="h-6 w-6 bg-muted rounded-full" /> }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border shadow-xl" align="end">
            <DropdownMenuLabel className="font-normal text-card-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/settings" className="flex items-center w-full">
                {isClient ? <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4 bg-muted rounded"/> }
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

