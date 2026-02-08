import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. IMPORT THE SIDEBAR
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shreedhar Ops",
  description: "Factory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex bg-zinc-50 dark:bg-zinc-950`}
      >
        {/* 2. PLACE THE SIDEBAR HERE */}
        <Sidebar />

        {/* 3. WRAP THE PAGE CONTENT */}
        {/* 'ml-64' pushes the content to the right so it doesn't hide behind the sidebar */}
        <main className="flex-1 ml-64 p-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}