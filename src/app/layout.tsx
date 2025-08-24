import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import NotificationSetup from '@/components/NotificationSetup';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAInitializer from '@/components/PWAInitializer';
import OfflineIndicator from '@/components/OfflineIndicator';
import { NotificationProvider } from '@/contexts/NotificationContext';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "AnnMitra - Reduce Food Waste, Feed Community",
  description: "Connect surplus food from canteens with students and NGOs. Reduce waste, build community, and make a positive environmental impact.",
  keywords: "food sharing, campus, sustainability, food waste, community, PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AnnMitra",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AnnMitra',
    title: 'AnnMitra - Campus Food Sharing',
    description: 'Reduce food waste by sharing surplus food in your campus community',
    images: ['/icon-512.png'],
  },
  twitter: {
    card: 'summary',
    title: 'AnnMitra - Campus Food Sharing',
    description: 'Reduce food waste by sharing surplus food in your campus community',
    images: ['/icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#047857" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* PWA Meta Tags */}
          <meta name="application-name" content="AnnMitra" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="AnnMitra" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#059669" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* Icons */}
          <link rel="icon" href="/icon.svg" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-192.png" />
          
          {/* Splash Screens for iOS */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          {/* Preload critical resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className={`${inter.variable} antialiased`}>
          <OfflineIndicator />
          <NotificationProvider>
            {/* Animated background elements */}
            <div className="bg-decoration">
              <div className="bg-circle"></div>
              <div className="bg-circle"></div>
              <div className="bg-circle"></div>
            </div>
            
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-24">
                {children}
              </main>
              <footer className="glass mx-4 mb-4 rounded-2xl border border-gray-700">
                <div className="container mx-auto px-6 py-6 text-center text-gray-300">
                  <p>&copy; 2025 AnnMitra. Reducing food waste, one meal at a time.</p>
                </div>
              </footer>
            </div>
            <NotificationSetup />
            <PWAInstallPrompt />
            <PWAInitializer />
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
