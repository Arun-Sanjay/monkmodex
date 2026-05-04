import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/shared/AmbientBackground";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Monk ModeX — The evidence-based version of monk mode",
    template: "%s — Monk ModeX",
  },
  description:
    "Built on 40 years of addiction research. Personalized to you in 90 seconds. No subscription, no streaks, no shame.",
  applicationName: "Monk ModeX",
  authors: [{ name: "Monk ModeX" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://monkmodex.com"
  ),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Monk ModeX — The evidence-based version of monk mode",
    description:
      "Built on 40 years of addiction research. Personalized to you in 90 seconds.",
    type: "website",
    siteName: "Monk ModeX",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monk ModeX — The evidence-based version of monk mode",
    description:
      "Built on 40 years of addiction research. Personalized to you in 90 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen text-[var(--text-primary)]">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
