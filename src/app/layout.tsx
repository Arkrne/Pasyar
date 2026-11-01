import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
  title: { default: "Pasyar · Welcome to the Happy Island, Catanduanes", template: "%s · Pasyar" },
  description:
    "Plan a day-by-day Catanduanes trip with real places, local guides, stays and rides you can book in one checkout. Built in Catanduanes for IGNITE 2026.",
  applicationName: "Pasyar",
  authors: [{ name: "Francis T. Saldua", url: "https://francissaldua.me" }],
  creator: "Francis T. Saldua",
  publisher: "Francis T. Saldua",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/icon-64.png", sizes: "64x64" }, { url: "/brand/icon-192.png", sizes: "192x192" }],
    apple: "/brand/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Pasyar", statusBarStyle: "default" },
  openGraph: {
    title: "Pasyar · Welcome to the Happy Island",
    description: "Real places, local operators, one checkout.",
    images: ["/photos/binurong-sunset.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable} antialiased`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
