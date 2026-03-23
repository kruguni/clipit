import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipIT - AI Video Clipping by Know IT All",
  description: "Turn long videos into viral short clips with AI-powered detection, auto-captions, and virality scoring.",
  keywords: ["video clipping", "AI", "shorts", "TikTok", "YouTube Shorts", "podcast clips", "viral content"],
  authors: [{ name: "Know IT All Services" }],
  openGraph: {
    title: "ClipIT - AI Video Clipping",
    description: "Turn long videos into viral short clips in minutes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
