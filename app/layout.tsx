import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fontsapi.zeoseven.com" crossOrigin="anonymous" />
        {supabaseUrl ? (
          <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
        ) : null}
      </head>
      <body className="antialiased">
        <Script id="restore-reading-settings" strategy="beforeInteractive">
          {`try{var d=document.documentElement;d.dataset.font=localStorage.getItem('font')||'chillhuo';d.dataset.fontSize=localStorage.getItem('fontSize')||'md';var bg=localStorage.getItem('readingBg')||'auto';d.dataset.readingBg=bg;if(bg==='image'){var img=localStorage.getItem('readingBgImage')||'';if(img){d.style.setProperty('--reading-bg-image','url("'+img+'")');}var op=parseInt(localStorage.getItem('readingBgOpacity')||'60',10);d.style.setProperty('--reading-bg-opacity',String(op/100));}var fg=localStorage.getItem('readingFg');if(fg){d.style.setProperty('--reading-fg',fg);}}catch(e){}`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Footer />
          <Toaster />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
