"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createGame } from "@/game/createGame";
import { EVENTS } from "@/game/constants";
import { bus } from "@/game/eventBus";
import { audio } from "@/game/audio";
import { getDifficulty, getHighScore, getMuted, setDifficulty as persistDifficulty, setMuted as persistMuted } from "@/game/storage";
import type { Difficulty, GameOverPayload, HudSnapshot, SceneState } from "@/game/types";
import { DIFFICULTIES } from "@/game/config";
import GameHud from "./GameHud";
import MobileControls from "./MobileControls";

const DEFAULT_HUD: HudSnapshot = {
  score: 0,
  highScore: 0,
  hp: 3,
  maxHp: 3,
  shield: false,
  powerTimeLeft: 0,
  rapidTimeLeft: 0,
  bossHpRatio: null,
  difficulty: "normal",
  wave: 1,
  weaponName: "PULSE",
  weaponLevel: 1,
  weaponMax: 6,
  weaponProgress: 0,
  weaponColor: "#fff27a",
};

export default function GameWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null);
  const sceneStateRef = useRef<SceneState>("loading");

  const [sceneState, setSceneState] = useState<SceneState>("loading");
  const [hud, setHud] = useState<HudSnapshot>(DEFAULT_HUD);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [highScore, setHighScore] = useState(0);

  // --- Boot the Phaser game + wire the event bus -------------------------
  useEffect(() => {
    setMuted(getMuted());
    setDifficulty(getDifficulty());
    setHighScore(getHighScore());
    audio.setMuted(getMuted());

    if (!containerRef.current || gameRef.current) return;
    const game = createGame(containerRef.current);
    gameRef.current = game;

    const onScene = (state: SceneState) => {
      sceneStateRef.current = state;
      setSceneState(state);
      if (state === "playing" || state === "title") setGameOver(null);
    };
    const onHud = (snapshot: HudSnapshot) => {
      setHud(snapshot);
      setHighScore(snapshot.highScore);
    };
    const onGameOver = (payload: GameOverPayload) => {
      setGameOver(payload);
      setHighScore(payload.highScore);
    };

    bus.on(EVENTS.SCENE_STATE, onScene);
    bus.on(EVENTS.HUD_UPDATE, onHud);
    bus.on(EVENTS.GAME_OVER, onGameOver);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const s = sceneStateRef.current;
        if (s === "playing" || s === "boss" || s === "paused") {
          e.preventDefault();
          bus.emit(EVENTS.TOGGLE_PAUSE);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      bus.off(EVENTS.SCENE_STATE, onScene);
      bus.off(EVENTS.HUD_UPDATE, onHud);
      bus.off(EVENTS.GAME_OVER, onGameOver);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // --- UI actions --------------------------------------------------------
  const handleStart = useCallback((diff: Difficulty) => {
    audio.init();
    persistDifficulty(diff);
    setDifficulty(diff);
    setGameOver(null);
    bus.emit("start-game", diff);
  }, []);

  const handlePause = useCallback(() => bus.emit(EVENTS.TOGGLE_PAUSE), []);
  const handleRestart = useCallback(() => {
    audio.init();
    setGameOver(null);
    bus.emit(EVENTS.REQUEST_RESTART);
  }, []);
  const handleTitle = useCallback(() => bus.emit(EVENTS.REQUEST_TITLE), []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      audio.setMuted(next);
      persistMuted(next);
      return next;
    });
  }, []);

  const showHud = sceneState === "playing" || sceneState === "boss" || sceneState === "paused";
  const showMobile = sceneState === "playing" || sceneState === "boss";

  return (
    <div className="crt-vignette relative aspect-[16/9] w-full max-w-[min(96vw,calc(96vh*16/9))] overflow-hidden rounded-xl border border-white/10 bg-space-deep shadow-[0_0_60px_rgba(0,0,0,0.7)]">
      {/* Phaser canvas mount */}
      <div ref={containerRef} className="absolute inset-0" />

      {showHud && (
        <GameHud
          hud={hud}
          sceneState={sceneState}
          muted={muted}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
        />
      )}

      {showMobile && <MobileControls />}

      {sceneState === "loading" && <LoadingOverlay />}

      {sceneState === "title" && (
        <TitleOverlay
          highScore={highScore}
          difficulty={difficulty}
          muted={muted}
          onSelectDifficulty={setDifficulty}
          onStart={handleStart}
          onToggleMute={handleToggleMute}
        />
      )}

      {sceneState === "paused" && (
        <PauseOverlay onResume={handlePause} onRestart={handleRestart} onTitle={handleTitle} />
      )}

      {sceneState === "gameover" && gameOver && (
        <GameOverOverlay payload={gameOver} onRestart={handleRestart} onTitle={handleTitle} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ UI bits */

type ButtonVariant = "primary" | "ghost";

function NeonButton({
  children,
  onClick,
  variant = "ghost",
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  className?: string;
}) {
  const base =
    "pointer-events-auto rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-hud-cyan";
  const styles =
    variant === "primary"
      ? "bg-hud-cyan text-space-deep shadow-glow hover:bg-white hover:shadow-[0_0_28px_rgba(94,242,255,0.8)]"
      : "border border-white/20 bg-white/5 text-white/85 hover:border-hud-cyan/60 hover:text-hud-cyan hover:bg-white/10";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="animate-float-in mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 text-center shadow-[0_0_40px_rgba(0,0,0,0.6)] sm:p-8">
        {children}
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <p className="animate-pulse-glow text-lg tracking-[0.3em] text-hud-cyan">INITIALIZING…</p>
    </div>
  );
}

function TitleOverlay({
  highScore,
  difficulty,
  muted,
  onSelectDifficulty,
  onStart,
  onToggleMute,
}: {
  highScore: number;
  difficulty: Difficulty;
  muted: boolean;
  onSelectDifficulty: (d: Difficulty) => void;
  onStart: (d: Difficulty) => void;
  onToggleMute: () => void;
}) {
  const diffs = useMemo(() => Object.keys(DIFFICULTIES) as Difficulty[], []);
  return (
    <Panel>
      <h1 className="animate-pulse-glow bg-gradient-to-b from-white to-hud-cyan bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
        SKY STRIKE
      </h1>
      <p className="mt-1 text-[11px] uppercase tracking-[0.45em] text-white/50">
        Side-Scrolling Shooter
      </p>

      <div className="mt-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/40">Difficulty</p>
        <div className="flex justify-center gap-2">
          {diffs.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDifficulty(d)}
              className={`pointer-events-auto rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                d === difficulty
                  ? "border-hud-cyan bg-hud-cyan/15 text-hud-cyan shadow-glow"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/40"
              }`}
            >
              {DIFFICULTIES[d].label}
            </button>
          ))}
        </div>
      </div>

      <NeonButton variant="primary" onClick={() => onStart(difficulty)} className="mt-6 w-full">
        ▶ Start Game
      </NeonButton>

      <div className="mt-6 grid grid-cols-2 gap-3 text-left text-[11px] text-white/55">
        <div>
          <p className="mb-1 text-white/80">Controls</p>
          <p>Move · WASD / Arrows</p>
          <p>Fire · Space</p>
          <p>Slow · Shift</p>
          <p>Pause · Esc</p>
        </div>
        <div>
          <p className="mb-1 text-white/80">Tips</p>
          <p>Score evolves your laser</p>
          <p>Grab power-ups</p>
          <p>Survive the boss</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Hi-Score{" "}
          <span className="ml-1 text-base font-bold tabular-nums text-hud-amber">
            {highScore.toLocaleString()}
          </span>
        </p>
        <button
          type="button"
          onClick={onToggleMute}
          className="pointer-events-auto rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-hud-cyan/60 hover:text-hud-cyan"
        >
          {muted ? "🔇 Sound Off" : "🔊 Sound On"}
        </button>
      </div>
    </Panel>
  );
}

function PauseOverlay({
  onResume,
  onRestart,
  onTitle,
}: {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}) {
  return (
    <Panel>
      <h2 className="text-3xl font-black uppercase tracking-[0.3em] text-hud-cyan">Paused</h2>
      <div className="mt-8 flex flex-col gap-3">
        <NeonButton variant="primary" onClick={onResume}>
          Resume
        </NeonButton>
        <NeonButton onClick={onRestart}>Restart</NeonButton>
        <NeonButton onClick={onTitle}>Back to Title</NeonButton>
      </div>
    </Panel>
  );
}

function GameOverOverlay({
  payload,
  onRestart,
  onTitle,
}: {
  payload: GameOverPayload;
  onRestart: () => void;
  onTitle: () => void;
}) {
  return (
    <Panel>
      <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-hud-magenta">
        Game Over
      </h2>
      {payload.isNewHighScore && (
        <p className="animate-pulse-glow mt-2 text-sm font-bold uppercase tracking-[0.3em] text-hud-amber">
          ★ New High Score ★
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Score</p>
          <p className="text-2xl font-black tabular-nums text-hud-cyan">
            {payload.score.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Hi-Score</p>
          <p className="text-2xl font-black tabular-nums text-hud-amber">
            {payload.highScore.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <NeonButton variant="primary" onClick={onRestart}>
          ↻ Restart
        </NeonButton>
        <NeonButton onClick={onTitle}>Back to Title</NeonButton>
      </div>
    </Panel>
  );
}
