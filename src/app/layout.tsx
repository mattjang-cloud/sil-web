import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/sil/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIL | Skin Intelligence Logic",
  description:
    "AI-Powered K-Beauty Consultation Agent with 5-Vector Analysis. Personalized skincare recommendations by analyzing your skin, environment, lifestyle, occasion, and style.",
  keywords: [
    "K-Beauty",
    "AI skincare",
    "skin analysis",
    "personalized skincare",
    "Korean beauty",
    "5-Vector",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
