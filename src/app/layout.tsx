import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/Navbar";
import { SnowCanvas } from "@/components/SnowCanvas";
import { MusicPlayer } from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: "Christmas Together - Family Secret Santa",
  description: "A secure, private, and festive Secret Santa gift exchange web application for families.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎄</text></svg>",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <html lang="en">
      <body className="bg-[#0b2b20] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-[#d4af37] selection:text-[#0b2b20]">
        <SnowCanvas />
        <Navbar user={user} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-20">
          {children}
        </main>
        <footer className="z-20 border-t border-[#1d5943] bg-[#071d15]/80 py-6 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center space-x-2">
            <span>🎄</span>
            <span>Christmas Together &bull; Private Family Gift Exchange</span>
            <span>🎅</span>
          </div>
          <div className="mt-1 text-[#f3c053]/70">
            Keep the magic alive &bull; Assignments remain strictly secret
          </div>
        </footer>
        <MusicPlayer />
      </body>
    </html>
  );
}
