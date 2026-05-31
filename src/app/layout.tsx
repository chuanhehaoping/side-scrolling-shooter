import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sky Strike — Side-Scrolling Shooter",
  description:
    "Sky Strike is a fast, retro-sci-fi side-scrolling shoot-'em-up built with Next.js and Phaser 3. Dodge, blast, grab power-ups, and take down the boss.",
  authors: [{ name: "Sky Strike" }],
  keywords: ["game", "shooter", "shmup", "phaser", "nextjs", "arcade"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#04060f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
