'use client';

import Link from 'next/link';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { HomeIcon, ShoppingBag, ShoppingCart, Wallet, Package } from 'lucide-react';

const AppSidebar = () => {
  const menuItems = [
    { href: '/', label: 'Home', icon: HomeIcon, tooltip: 'Dashboard' },
    { href: '/products', label: 'Products', icon: ShoppingBag, tooltip: 'Browse Products' },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, tooltip: 'Shopping Cart' },
    { href: '/wallet', label: 'Wallet', icon: Wallet, tooltip: 'Crypto Wallet' },
    { href: '/orders', label: 'Orders', icon: Package, tooltip: 'Track Orders' },
  ];

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M11.258 3.284A.75.75 0 0 0 10.5 3.75v16.5a.75.75 0 0 0 1.28.53l7.5-7.5a.75.75 0 0 0 0-1.06l-7.5-7.5a.75.75 0 0 0-.522-.236Z" />
            <path d="M3.252 3.284A.75.75 0 0 0 2.5 3.75v16.5a.75.75 0 0 0 1.28.53l7.5-7.5a.75.75 0 0 0 0-1.06l-7.5-7.5A.75.75 0 0 0 3.252 3.284Z" />
          </svg>
          <span className="text-xl font-semibold text-primary">WalmartChain</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={{ children: item.tooltip, side: 'right', align: 'center' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* SidebarFooter with Settings and Logout is removed */}
    </>
  );
};

export default AppSidebar;
