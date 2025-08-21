import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import Header from '@/components/Header';
import NotificationSetup from '@/components/NotificationSetup';
import { NotificationProvider } from '@/contexts/NotificationContext';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnnMitra - Reduce Food Waste, Feed Community",
  description: "Connect surplus food from canteens with students and NGOs. Reduce waste, build community, and make a positive environmental impact.",
  keywords: "food sharing, campus, sustainability, food waste, community",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
        </head>
        <body className={`${inter.variable} bg-background text-foreground antialiased`}>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-card border-t border-border py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                  <p>&copy; 2025 AnnMitra. Reducing food waste, one meal at a time.</p>
                </div>
              </footer>
            </div>
            <NotificationSetup />
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
