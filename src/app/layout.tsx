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
  description:
    "Automate candidate resume screening and run semantic search on candidate pools using Google Gemini.",
  openGraph: {
    title: "Org Control — AI-Powered Resume Screening",
    description:
      "Automate candidate resume screening and run semantic search on candidate pools using Google Gemini.",
    url: "https://orgcontrol.imsahiljain.in/",
    siteName: "Org Control",
    images: [
      {
        url: "https://res.cloudinary.com/dagkrnoap/image/upload/v1781687895/Screenshot_from_2026-06-17_14-46-34_mtecab.png",
        width: 1897,
        height: 974,
        alt: "Org Control Workspace Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Org Control — AI-Powered Resume Screening",
    description:
      "Automate candidate resume screening and run semantic search on candidate pools using Google Gemini.",
    images: [
      "https://res.cloudinary.com/dagkrnoap/image/upload/v1781687895/Screenshot_from_2026-06-17_14-46-34_mtecab.png",
    ],
  },
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
