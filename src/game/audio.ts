/**
 * Lightweight procedural sound engine built on the Web Audio API.
 * No external audio files are used — every effect is synthesized at runtime.
 * The engine is resilient: if Web Audio is unavailable it degrades to no-ops.
 */

type SfxName =
  | "shot"
  | "enemyHit"
  | "explosion"
  | "playerHit"
  | "item"
  | "bossAppear"
  | "bossExplosion"
  | "gameOver"
  | "uiClick";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private initialized = false;

  /** Must be called from a user gesture (browsers block audio otherwise). */
  init(): void {
    if (this.initialized) {
      this.resume();
      return;
    }
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.initialized = true;
    } catch {
      this.ctx = null;
      this.master = null;
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => undefined);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) {
      this.master.gain.value = muted ? 0 : 0.5;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    gainPeak: number,
    delay = 0,
  ): void {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const t0 = this.now() + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  private noise(duration: number, gainPeak: number, delay = 0, hp = 400): void {
    if (!this.ctx || !this.master || this.muted) return;
    const ctx = this.ctx;
    const t0 = this.now() + delay;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = hp;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainPeak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  play(name: SfxName): void {
    if (!this.ctx || this.muted) return;
    this.resume();
    switch (name) {
      case "shot":
        this.tone(880, 320, 0.12, "square", 0.12);
        break;
      case "enemyHit":
        this.tone(420, 260, 0.06, "triangle", 0.1);
        break;
      case "explosion":
        this.noise(0.32, 0.35, 0, 300);
        this.tone(180, 40, 0.3, "sawtooth", 0.16);
        break;
      case "playerHit":
        this.tone(220, 60, 0.4, "sawtooth", 0.3);
        this.noise(0.3, 0.25);
        break;
      case "item":
        this.tone(660, 990, 0.1, "sine", 0.18);
        this.tone(990, 1320, 0.1, "sine", 0.15, 0.08);
        break;
      case "bossAppear":
        this.tone(110, 220, 0.8, "sawtooth", 0.25);
        this.tone(80, 160, 1.0, "square", 0.18, 0.1);
        break;
      case "bossExplosion":
        this.noise(1.1, 0.45, 0, 200);
        this.tone(160, 30, 1.0, "sawtooth", 0.3);
        this.tone(90, 20, 1.2, "square", 0.22, 0.15);
        break;
      case "gameOver":
        this.tone(440, 110, 0.9, "sawtooth", 0.25);
        this.tone(330, 80, 1.1, "square", 0.18, 0.2);
        break;
      case "uiClick":
        this.tone(520, 720, 0.06, "square", 0.1);
        break;
    }
  }
}

export const audio = new AudioEngine();
export type { SfxName };
