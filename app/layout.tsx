import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s - ChongLangLSCrow',
    default: 'ChongLangLSCrow',
  },
  description: 'Share your novels, essays, and poetry with the world. Join our community of writers and readers.',
  keywords: ['blog', 'novel', 'essay', 'poetry', 'writing', 'community'],
  authors: [{ name: 'ChongLangLSCrow Team' }],
  icons: {
    icon: '/favicon.jpg',
  },
  openGraph: {
    title: 'ChongLangLSCrow',
    description: 'Share your stories with the world.',
    type: 'website',
    url: 'https://chonglanglscrow.cn',
    images: [
      {
        url: 'https://chonglanglscrow.cn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ChongLangLSCrow',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
