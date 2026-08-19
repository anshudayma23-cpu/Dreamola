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

export const metadata: Metadata = {
  title: "Dreamola - AI Dream Interpretation",
  description: "Turn your dreams into art and uncover hidden meanings.",
};

export const viewport: Viewport = {
  themeColor: "#fcf8ff",
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
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
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
