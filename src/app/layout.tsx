import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC, Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* Rounded, Apple-like sans (SF Pro Rounded alternative with Cyrillic) */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const notoSc = Noto_Sans_SC({
  variable: "--font-noto-sc",
  weight: ["400", "500", "700"],
  display: "swap",
});

/* Technical mono for data labels and the restrained copyright line */
const jetMono = JetBrains_Mono({
  variable: "--font-jetmono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-METHANE-100 · Investor & Patent Buyer Hub",
  description:
    "Deep-tech Power-to-Gas project dossier: 100 t/day synthetic natural gas from renewable power and captured CO₂. TRL 8, NPV +$16.1M base scenario, patent-protected heat integration. EN / RU / 中文.",
  keywords: ["E-METHANE-100", "SNG", "Power-to-Gas", "Sabatier", "hydrogen", "TRL 8", "carbon credits", "patent licensing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${notoSc.variable} ${jetMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
