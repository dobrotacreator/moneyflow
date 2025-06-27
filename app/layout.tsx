import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://dobrotacreator.github.io/moneyflow"
      : "http://localhost:3000",
  ),
  title: "MoneyFlow - Billionaire Income Simulator",
  description:
    "Ever wondered how fast billionaires make money? Watch their wealth grow in real-time!",
  keywords:
    "billionaire, money, simulator, income, wealth, elon musk, jeff bezos",
  authors: [{ name: "MoneyFlow Team" }],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' fontSize='90'>💰</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "MoneyFlow - Billionaire Income Simulator",
    description:
      "Ever wondered how fast billionaires make money? Watch their wealth grow in real-time!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
