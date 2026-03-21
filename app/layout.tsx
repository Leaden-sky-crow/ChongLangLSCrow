import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import config from '@/config.json'

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
    template: `%s - ${config.title}`,
    default: config.title,
  },
  description: 'Share your stories with the world.',
  keywords: ['blog', 'novel', 'essay', 'poetry', 'writing', 'community'],
  authors: [{ name: 'ChongLangLSCrow Team' }],
  icons: {
    icon: '/favicon.jpg',
  },
  openGraph: {
    title: config.title,
    description: 'Share your stories with the world.',
    type: 'website',
    url: 'https://chonglanglscrow.cn',
    images: [
      {
        url: 'https://chonglanglscrow.cn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: config.title,
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
        </ThemeProvider>
      </body>
    </html>
  );
}
