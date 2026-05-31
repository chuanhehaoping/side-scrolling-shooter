"use client";

import type { HudSnapshot, SceneState } from "@/game/types";

interface GameHudProps {
  hud: HudSnapshot;
  sceneState: SceneState;
  muted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col leading-none">
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/45">{label}</span>
      <span className={`text-sm font-bold tabular-nums sm:text-base ${accent ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function HpPips({ hp, maxHp }: { hp: number; maxHp: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxHp }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-4 rounded-sm transition-colors ${
            i < hp ? "bg-hud-cyan shadow-glow" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

export default function GameHud({
  hud,
  sceneState,
  muted,
  onPause,
  onToggleMute,
}: GameHudProps) {
  const showBossBar = hud.bossHpRatio !== null;
  const diffLabel = hud.difficulty.toUpperCase();

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-2 sm:p-3">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm sm:gap-4">
          <StatChip label="Score" value={hud.score.toLocaleString()} accent="text-hud-cyan" />
          <StatChip label="Hi-Score" value={hud.highScore.toLocaleString()} accent="text-hud-amber" />
          <StatChip label="Wave" value={String(hud.wave)} />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-sm sm:inline">
            {diffLabel}
          </span>
          <button
            type="button"
            onClick={onToggleMute}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/40 text-base backdrop-blur-sm transition hover:border-hud-cyan/60 hover:text-hud-cyan active:scale-95"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={onPause}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/40 text-base backdrop-blur-sm transition hover:border-hud-cyan/60 hover:text-hud-cyan active:scale-95"
            aria-label="Pause"
            disabled={sceneState === "paused"}
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Boss bar */}
      {showBossBar && (
        <div className="mx-auto w-full max-w-md animate-float-in px-2">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-hud-magenta">
            <span>⚠ Boss</span>
            <span>{Math.ceil((hud.bossHpRatio ?? 0) * 100)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-hud-magenta/40 bg-black/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-hud-amber via-red-500 to-hud-magenta transition-[width] duration-150"
              style={{ width: `${(hud.bossHpRatio ?? 0) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/45">HP</span>
            <HpPips hp={hud.hp} maxHp={hud.maxHp} />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {hud.shield && <Badge color="text-hud-cyan border-hud-cyan/50">◈ SHIELD</Badge>}
            {hud.powerTimeLeft > 0 && (
              <Badge color="text-hud-magenta border-hud-magenta/50">
                ⋔ 3-WAY {hud.powerTimeLeft.toFixed(0)}s
              </Badge>
            )}
            {hud.rapidTimeLeft > 0 && (
              <Badge color="text-hud-amber border-hud-amber/50">
                ⚡ RAPID {hud.rapidTimeLeft.toFixed(0)}s
              </Badge>
            )}
          </div>
        </div>

        <p className="hidden rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-right text-[10px] leading-relaxed text-white/55 backdrop-blur-sm md:block">
          <span className="text-white/80">WASD / ←↑↓→</span> move ·{" "}
          <span className="text-white/80">SPACE</span> fire ·{" "}
          <span className="text-white/80">SHIFT</span> slow ·{" "}
          <span className="text-white/80">ESC</span> pause
        </p>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`rounded-full border bg-black/30 px-2 py-0.5 text-[10px] font-bold tracking-wider ${color}`}
    >
      {children}
    </span>
  );
}
