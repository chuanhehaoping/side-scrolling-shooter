# 🚀 Sky Strike

**▶ Play now:** https://side-scrolling-shooter.vercel.app

A fast, retro-sci-fi **side-scrolling shoot-'em-up** built with **Next.js**, **TypeScript**, **React** and **Phaser 3**. Pilot a fighter from the left of the screen, blast waves of enemies, grab power-ups, and bring down a multi-pattern boss — all rendered with procedural vector graphics and synthesized audio (zero asset files).

> Built to be a portfolio-quality, instantly-playable browser game.

---

## 🖼️ Screenshots

> _Add your own captures here._

| Title | Gameplay | Boss |
| ----- | -------- | ---- |
| `docs/title.png` | `docs/gameplay.png` | `docs/boss.png` |

---

## ✨ Features

- **4 enemy types** — straight runners, vertical weavers, gunships that aim at you, and fast darts.
- **Boss battle** — health bar, aimed bursts, fan spreads, and a telegraphed dash attack, with an enraged second phase.
- **Power-ups** — HP repair, score bonus, rapid fire, 3-way shot, and a one-hit shield (active effects shown on the HUD with timers).
- **Procedural everything** — all sprites/backgrounds are drawn with Phaser Graphics; all SFX are synthesized with the Web Audio API. No image or audio assets.
- **Multi-layer parallax** starfield, particle explosions, muzzle flashes, screen shake, damage flashes and invulnerability blink.
- **Difficulty scaling** over time and score (spawn rate, speed, fire rate, enemy variety) tuned to stay fair.
- **3 difficulty presets** — Easy / Normal / Hard.
- **High score** saved to `localStorage` (with safe fallbacks when storage is blocked).
- **Sound on/off** toggle, persisted.
- **Full game-state flow** — Loading → Title → Playing → Boss → Paused → Game Over.
- **Mobile support** — on-screen analog joystick + Fire/Slow buttons; responsive, SSR-safe UI.

---

## 🎮 Controls

### Desktop

| Action | Keys |
| ------ | ---- |
| Move | `W` `A` `S` `D` / Arrow keys |
| Fire | `Space` |
| Slow move | `Shift` |
| Pause | `Esc` |

### Mobile

- **Left joystick** — move
- **FIRE** button — shoot
- **SLOW** button — toggle precision movement
- **⏸** (top-right) — pause

---

## 🧱 Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/) (strict)
- [Phaser 3](https://phaser.io/) (Arcade physics)
- [Tailwind CSS 3](https://tailwindcss.com/)
- Web Audio API · `localStorage`
- Deployed on [Vercel](https://vercel.com/)

---

## 🗂️ Project Structure

```text
src/
  app/                 # Next.js App Router (layout, page, global styles)
  components/          # React UI layer (canvas host, HUD, mobile controls, menus)
  game/
    config.ts          # Tunable balance + per-difficulty settings
    constants.ts       # Sizes, depths, colors, event & storage keys
    types.ts           # Shared domain types
    storage.ts         # Safe localStorage helpers
    audio.ts           # Procedural Web Audio sound engine
    eventBus.ts        # React <-> Phaser event bridge
    createGame.ts      # Phaser.Game factory
    scenes/            # Boot, Title, Game, GameOver
    entities/          # Player, Enemy, Boss, Bullet, Item
    systems/           # EnemySpawner, CollisionSystem, DifficultySystem, EffectsSystem
```

**Architecture note:** React owns the shell, menus and HUD; Phaser owns the game loop and all entities. They communicate through a single typed event bus, and the game is loaded with `next/dynamic({ ssr: false })` so Phaser never runs during server rendering.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# open http://localhost:3000
```

### Useful scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript (tsc --noEmit)
```

---

## 📦 Build

```bash
npm run build
```

This produces an optimized production build in `.next/`. Verify it locally with `npm run start`.

---

## ☁️ Deploy to Vercel

The easiest path is the Vercel dashboard:

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com/new), **Import** the repo.
3. Framework preset is auto-detected as **Next.js** — no extra config needed.
4. Click **Deploy**.

Or via the CLI:

```bash
npm i -g vercel      # if not installed
vercel login         # authenticate
vercel               # preview deploy
vercel --prod        # production deploy
```

---

## 🧭 Roadmap / Future Ideas

- Multiple stages with distinct themes and unique bosses.
- Weapon variety (homing missiles, lasers, bombs) and a loadout screen.
- Online leaderboard (replace local high score with a backend).
- Gamepad support and rebindable keys.
- Combo / multiplier scoring system.
- Accessibility options (reduced motion, color-blind palettes).
- Background music tracks (procedural or streamed).

---

## 📄 License

Released under the [MIT License](LICENSE). Feel free to fork, learn from, and build on it.
