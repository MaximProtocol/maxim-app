import type { Metadata } from "next";
import { Inter, Raleway } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maxim Protocol",
  description:
    "One API. Any protocol. Every transaction on-chain. Maxim Protocol is the unified payment layer for AI agents — abstracting x402 and MPP behind a single developer interface, settled on Solana.",
  icons: {
    icon: "/images/logo-bg-black.png",
  },
  openGraph: {
    title: "Maxim Protocol – The payment rail for autonomous AI agents.",
    description:
      "One API. Any protocol. Every transaction on-chain. Maxim Protocol is the unified payment layer for AI agents — abstracting x402 and MPP behind a single developer interface, settled on Solana.",
    type: "website",
    url: "https://maximprotocol.com",
    siteName: "Maxim Protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maxim Protocol – The payment rail for autonomous AI agents.",
    description:
      "One API. Any protocol. Every transaction on-chain. Maxim Protocol is the unified payment layer for AI agents — abstracting x402 and MPP behind a single developer interface, settled on Solana.",
  },
  keywords: [
    "AI agent payments",
    "x402",
    "MPP",
    "machine payments protocol",
    "Solana",
    "USDC",
    "agent wallet",
    "agentic economy",
    "payment infrastructure",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${raleway.variable} antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
