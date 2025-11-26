import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kodepos.online'),
  title: {
    default: 'Kode Pos Indonesia - Cari Kode Pos Seluruh Indonesia',
    template: '%s | Kode Pos Indonesia',
  },
  description: "Cari kode pos kelurahan, kecamatan, kabupaten, dan provinsi di Indonesia. Data resmi dari BPS Indonesia.",
  keywords: "kode pos indonesia, postal code, kode pos, cari kode pos, bps indonesia",
  authors: [{ name: "Kode Pos Indonesia" }],
  creator: "Kode Pos Indonesia",
  publisher: "Kode Pos Indonesia",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kodepos.online',
    siteName: 'Kode Pos Indonesia',
    title: 'Kode Pos Indonesia - Cari Kode Pos Seluruh Indonesia',
    description: 'Cari kode pos kelurahan, kecamatan, kabupaten, dan provinsi di Indonesia. Data resmi dari BPS Indonesia.',
    images: [{
      url: '/logo.png',
      width: 512,
      height: 512,
      alt: 'Kode Pos Indonesia Logo',
    }],
  },
  twitter: {
    card: 'summary',
    title: 'Kode Pos Indonesia - Cari Kode Pos Seluruh Indonesia',
    description: 'Cari kode pos kelurahan, kecamatan, kabupaten, dan provinsi di Indonesia.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8J1LR125BG"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8J1LR125BG');
            `,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <a href="/" className="flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-80">
                <Image src="/logo.png" alt="Kode Pos Indonesia" width={32} height={32} className="h-8 w-8" />
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">Kode Pos Indonesia</span>
              </a>
              <ThemeToggle />
            </div>
          </header>
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
