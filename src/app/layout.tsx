import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// Removed SidebarProvider, Sidebar, SidebarInset, AppSidebar
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter'; // Added AppFooter

export const metadata: Metadata = {
  title: 'WalmartChain',
  description: 'Blockchain-Powered Walmart E-commerce Clone',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0F1419',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
        <AppFooter /> 
        <Toaster />
      </body>
    </html>
  );
}
