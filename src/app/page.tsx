"use client";

import dynamic from "next/dynamic";

// Phaser depends on browser-only APIs, so the entire game shell is loaded
// client-side with SSR disabled. This keeps the Vercel build SSR-safe.
const GameShell = dynamic(() => import("@/components/GameWrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="animate-pulse-glow text-lg tracking-[0.3em] text-hud-cyan">
        LOADING…
      </p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="flex h-[100dvh] w-full items-center justify-center overflow-hidden p-2 sm:p-4">
      <GameShell />
    </main>
  );
}
