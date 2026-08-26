import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import React from "react";
import { SessionProvider } from "../components/providers/SessionProvider";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dreamola.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Dreamola — Free AI Dream Interpretation & Surreal Art Generator",
    template: "%s | Dreamola"
  },
  description: "Transcribe your nightly dreams into psychological interpretations and surreal AI-generated artwork. Explore symbol dictionaries, private journals, and the public collective dream gallery.",
  keywords: [
    "Dreamola",
    "AI dream interpretation",
    "dream dictionary",
    "dream symbolism",
    "dream meaning generator",
    "surreal dream art",
    "dream journal app",
    "Jungian dream analysis",
    "Freudian dream symbols"
  ],
  authors: [{ name: "Dreamola Team", url: appUrl }],
  creator: "Dreamola",
  publisher: "Dreamola",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Dreamola — Free AI Dream Interpretation & Surreal Art Generator",
    description: "Turn your dreams into art and uncover hidden psychological symbolism with AI.",
    siteName: "Dreamola",
    images: [
      {
        url: `${appUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Dreamola AI Dream Interpretation & Visual Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dreamola — Free AI Dream Interpretation & Surreal Art",
    description: "Turn your dreams into art and uncover hidden psychological symbolism with AI.",
    images: [`${appUrl}/og-image.jpg`],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
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

export const viewport: Viewport = {
  themeColor: "#630ed4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Dreamola",
              "url": appUrl,
              "description": "AI Dream Interpretation and Surreal Dream Art Generator.",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            })
          }}
        />
      </head>
      <body 
        suppressHydrationWarning
        className="text-[#181445] font-sans antialiased overflow-x-hidden selection:bg-[#7c3aed] selection:text-[#ede0ff]"
      >
        <SessionProvider>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
