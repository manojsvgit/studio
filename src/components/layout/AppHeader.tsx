
'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, UserCircle, Wallet, Search, Settings, ChevronDown } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet-store';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';

const AppHeader = () => {
  const { searchTerm, setSearchTerm, getFilteredCurrencies, getTotalPortfolioValueINR } = useWalletStore();
  const filteredCurrencies = getFilteredCurrencies();
  const totalPortfolioValue = getTotalPortfolioValueINR(); // Not used in trigger per simplified design

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2"> {/* Left items */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        {/* Optional: Page title or branding */}
      </div>

      <div className="flex flex-1 justify-center"> {/* Center item: Wallet Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Wallet className="mr-2 h-4 w-4" /> Wallet <ChevronDown className="ml-2 h-4 w-4" />
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
                  <DropdownMenuItem key={currency.id} className="flex justify-between items-center p-2 hover:bg-secondary cursor-pointer focus:bg-secondary">
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
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">Wallet Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2"> {/* Right items */}
        <Button variant="ghost" size="icon" aria-label="Notifications" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <UserCircle className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
