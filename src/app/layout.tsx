import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import CyberGrid from "@/components/CyberGrid";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E.D.I.T.H. Command Center",
  description: "Engine for Diff Investigation & Tracking the Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-space-black text-white`}
      >
        <CustomCursor />
        <CyberGrid />
        <main className="relative z-10 w-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
