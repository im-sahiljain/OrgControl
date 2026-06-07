import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UnifiedProviders } from "./providers";
import { LayoutWrapper } from "./components/LayoutWrapper";
import { RouteGate } from "./components/routeGate";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Org Control",
  description: "Manage your organization with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-zinc-50 dark:bg-zinc-950`}
    >
      <body className="min-h-full flex flex-col text-zinc-950 dark:text-zinc-50">
        <UnifiedProviders>
          <LayoutWrapper>
            <RouteGate>{children}</RouteGate>
          </LayoutWrapper>
        </UnifiedProviders>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
