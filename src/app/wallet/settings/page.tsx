
'use client';

import { useWalletStore } from '@/stores/wallet-store';
import CryptoCurrencyIcon from '@/components/icons/CryptoCurrencyIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wallet as WalletIconLucide, ShieldCheckIcon } from 'lucide-react'; // Renamed to avoid conflict
import { useToast } from '@/hooks/use-toast';

export default function WalletSettingsPage() {
  const { currencies, getTotalPortfolioValueINR } = useWalletStore();
  const { toast } = useToast();
  
  const totalBalance = getTotalPortfolioValueINR();

  const handleWithdraw = () => toast({ title: "Withdraw Action", description: "Withdraw functionality is not yet implemented." });
  const handleDeposit = () => toast({ title: "Deposit Action", description: "Deposit functionality is not yet implemented." });
  const handleEnable2FA = () => toast({ title: "Enable 2FA Action", description: "2FA setup is not yet implemented." });

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-2xl">
      <Card className="shadow-xl bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <WalletIconLucide className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-card-foreground">Wallet</CardTitle>
          </div>
          {/* Optional: Close button can be added here if needed */}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-background">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="buy-crypto">Buy Crypto</TabsTrigger>
              <TabsTrigger value="tip">Tip</TabsTrigger>
              <TabsTrigger value="settings-tab">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Balance Section */}
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardDescription className="text-muted-foreground">Total Balance</CardDescription>
                    <CardTitle className="text-3xl text-accent">
                      ₹{totalBalance.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Currencies List Section */}
                <Card className="bg-secondary/30">
                  <CardHeader className="pb-2">
                     <div className="flex justify-between items-center font-semibold text-muted-foreground px-2 mb-2">
                        <div className="text-sm">Currency</div>
                        <div className="text-sm text-right">Value</div>
                    </div>
                    <Separator />
                  </CardHeader>
                  <CardContent className="space-y-1 pt-2 max-h-60 overflow-y-auto">
                    {currencies.filter(c => c.balance > 0 || c.symbol === 'INR').length > 0 ? (
                      currencies.filter(c => c.balance > 0 || c.symbol === 'INR').map((currency) => (
                        <div key={currency.id} className="flex justify-between items-center gap-3 p-2 hover:bg-card rounded-md">
                          <div className="flex items-center gap-3">
                              <CryptoCurrencyIcon symbol={currency.symbol} className={`h-7 w-7 ${currency.color || 'text-foreground'}`} />
                              <div>
                                  <div className="font-semibold text-card-foreground">{currency.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{currency.name}</div>
                              </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-card-foreground">{currency.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: (currency.symbol === 'BTC' || currency.symbol === 'ETH' ? 8 : 2)})}</div>
                            <div className="text-xs text-muted-foreground">₹{(currency.balance * currency.priceInINR).toFixed(2)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Your wallet is currently empty.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Actions: Withdraw/Deposit */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" onClick={handleWithdraw} className="w-full border-primary text-primary hover:bg-primary/10">Withdraw</Button>
                  <Button variant="default" size="lg" onClick={handleDeposit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Deposit</Button>
                </div>

                <Separator />

                {/* 2FA Section */}
                <Card className="bg-secondary/30">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                        <ShieldCheckIcon className="h-10 w-10 text-accent mb-3" />
                        <h3 className="text-lg font-semibold text-card-foreground">Improve your account security</h3>
                        <p className="text-sm text-muted-foreground mb-4">Enable Two-Factor Authentication for an extra layer of protection.</p>
                        <Button variant="outline" className="w-full" onClick={handleEnable2FA}>Enable 2FA</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="buy-crypto">
              <Card className="bg-secondary/30">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground p-4 text-center">Buy Crypto functionality coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tip">
              <Card className="bg-secondary/30">
                <CardContent className="pt-6">
                 <p className="text-muted-foreground p-4 text-center">Tip functionality coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings-tab">
              <Card className="bg-secondary/30">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground p-4 text-center">Specific wallet account settings (e.g., linked accounts, preferences) will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

