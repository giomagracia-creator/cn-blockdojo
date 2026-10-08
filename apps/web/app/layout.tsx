import type { Metadata } from "next";
import "./globals.css";
import { DojoNav } from "./nav";
import { Motion } from "./motion";
import { GameProvider } from "./game";

export const metadata: Metadata = {
  title: "Block Dojo | Code Ninjas Central Edmonton",
  description: "Block Dojo is the Code Ninjas Central Edmonton belt journey. Phase 1 foundation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GameProvider>
          <DojoNav />
          <Motion />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
