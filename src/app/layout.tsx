import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav"; // <--- Import the new component

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950`}>
        
        {/* MOBILE: Show Top Bar, Hide Sidebar */}
        <MobileNav />

        {/* DESKTOP: Show Sidebar, Hide Mobile Nav */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* MAIN CONTENT AREA */}
        {/* On Mobile: No left margin (ml-0), small padding (p-4) */}
        {/* On Desktop: Left margin for sidebar (md:ml-64), normal padding (md:p-8) */}
        <main className="flex-1 w-full ml-0 md:ml-64 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}