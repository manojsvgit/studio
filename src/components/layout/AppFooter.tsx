
'use client';

import Link from 'next/link';
import { HomeIcon, ShoppingBag, Package } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const AppFooter = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const menuItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/orders', label: 'Orders', icon: Package },
  ];

  if (!isClient) {
    // Render a placeholder or null on the server and initial client render
    // to prevent hydration mismatch for icons.
    // Ensure the placeholder has similar height to avoid layout shift.
    return (
      <footer className="border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
        <nav className="container mx-auto flex h-16 items-center justify-around px-4 md:px-6">
          {menuItems.map((item) => (
            <div key={item.href} className="flex flex-col items-center justify-center p-2 rounded-md">
              <div className="h-6 w-6 mb-0.5 bg-muted rounded" /> {/* Icon placeholder */}
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </nav>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
      <nav className="container mx-auto flex h-16 items-center justify-around px-4 md:px-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon; // Store icon component
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <IconComponent className={cn("h-6 w-6 mb-0.5", isActive ? "text-primary" : "")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default AppFooter;
