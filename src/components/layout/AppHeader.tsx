
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
import { Bell, UserCircle, Wallet, Search, Settings, ChevronDown, LogOut, ShoppingCartIcon } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import { useCartStore } from '@/stores/cart-store';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';

const AppHeader = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    getFilteredCurrencies, 
  } = useWalletStore();
  
  const { getCartItemCount } = useCartStore();
  const [hydratedCartItemCount, setHydratedCartItemCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [hydratedWalletDisplay, setHydratedWalletDisplay] = useState<{ iconSymbol: string, text: string, color?: string } | null>(null);

  useEffect(() => {
    setIsClient(true); 

    const syncCartCount = () => {
      setHydratedCartItemCount(useCartStore.getState().getCartItemCount());
    };
    syncCartCount();
    const unsubscribeCart = useCartStore.subscribe(syncCartCount);

    const syncWalletDisplay = () => {
      const { currencies, selectedCurrencyId } = useWalletStore.getState();
      const currentActiveCurrency = currencies.find(c => c.id === selectedCurrencyId) || 
                                   currencies.find(c => c.symbol === 'INR') || 
                                   (currencies.length > 0 ? currencies[0] : null);
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
  const { setSelectedCurrencyId } = useWalletStore.getState();


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
                    {isClient ? <Wallet className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4" /> }
                    <span className="truncate text-sm">Wallet</span>
                  </>
                )}
              </div>
              {isClient ? <ChevronDown className="ml-2 h-4 w-4 opacity-80 flex-shrink-0" /> : <div className="ml-2 h-4 w-4 opacity-80 flex-shrink-0" /> }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 md:w-72 p-2 bg-card border-border shadow-xl" align="center">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Currencies..."
                  className="pl-8 h-9 text-sm bg-input border-border focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <ScrollArea className="h-[200px] md:h-[250px]">
              {filteredCurrencies.length === 0 ? (
                 <p className="p-4 text-sm text-center text-muted-foreground">No currencies found.</p>
              ) : (
                filteredCurrencies.map((currency) => (
                  <DropdownMenuItem 
                    key={currency.id} 
                    className="flex justify-between items-center p-2 hover:bg-secondary cursor-pointer focus:bg-secondary"
                    onSelect={() => setSelectedCurrencyId(currency.id)}
                  >
                    <div className="flex items-center gap-2">
                      <CryptoCurrencyIcon symbol={currency.symbol} className={`h-5 w-5 ${currency.color || 'text-foreground'}`} />
                      <span className="font-medium text-card-foreground">{currency.symbol}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ₹{(currency.balance * currency.priceInINR).toFixed(2)}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="p-2 hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/wallet/settings" className="flex items-center w-full">
                {isClient ? <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4"/> }
                <span className="text-sm text-card-foreground">Wallet Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2"> 
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          {isClient ? <Bell className="h-5 w-5" /> : <div className="h-5 w-5" /> }
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Shopping Cart" className="text-foreground hover:bg-accent hover:text-accent-foreground relative">
          <Link href="/cart">
            {isClient ? <ShoppingCartIcon className="h-5 w-5" /> : <div className="h-5 w-5" /> }
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
              {isClient ? <UserCircle className="h-6 w-6" /> : <div className="h-6 w-6" /> }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-border shadow-xl" align="end">
            <DropdownMenuLabel className="font-normal text-card-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/settings" className="flex items-center w-full">
                {isClient ? <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4" />}
                <span className="text-sm text-card-foreground">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border"/>
            <DropdownMenuItem asChild className="hover:bg-secondary cursor-pointer focus:bg-secondary">
              <Link href="/logout" className="flex items-center w-full">
                {isClient ? <LogOut className="mr-2 h-4 w-4 text-muted-foreground" /> : <div className="mr-2 h-4 w-4" />}
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
