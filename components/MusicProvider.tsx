"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type MusicTheme =
  | "hub"
  | "fairyland"
  | "kiosk"
  | "pit"
  | "cave"
  | "airport"
  | "throne"
  | "knight-boss"
  | "toad-boss"
  | "bear-boss";

export type SoundEffect =
  | "ui"
  | "interact"
  | "transition"
  | "boss-start"
  | "boss-roar"
  | "slime"
  | "fire"
  | "reflect"
  | "impact"
  | "player-hit"
  | "enemy-hit"
  | "shield"
  | "plate"
  | "punch"
  | "throw"
  | "jump"
  | "purchase"
  | "denied"
  | "chest"
  | "reward"
  | "victory"
  | "defeat"
  | "portal";

type ThemeSpec = {
  bpm: number;
  waveform: OscillatorType;
  brightness: number;
  melody: number[][];
  bass: Array<number | null>;
  percussion?: boolean;
};

const THEMES: Record<MusicTheme, ThemeSpec> = {
  hub: {
    bpm: 86,
    waveform: "triangle",
    brightness: 1500,
    melody: [[60, 67], [63], [67], [70], [67], [63], [58, 65], [62]],
    bass: [36, null, null, null, 34, null, null, null],
  },
  fairyland: {
    bpm: 76,
    waveform: "sine",
    brightness: 2600,
    melody: [[74, 81], [78], [81], [86], [83], [81], [78, 83], [74]],
    bass: [50, null, null, null, 47, null, 50, null],
  },
  kiosk: {
    bpm: 108,
    waveform: "square",
    brightness: 1100,
    melody: [[67, 74], [], [70], [72], [74], [], [70, 77], [67]],
    bass: [43, null, 46, null, 41, null, 46, null],
  },
  pit: {
    bpm: 58,
    waveform: "sine",
    brightness: 700,
    melody: [[48, 55], [], [], [51], [], [46, 53], [], []],
    bass: [24, null, null, null, 22, null, null, null],
  },
  cave: {
    bpm: 66,
    waveform: "triangle",
    brightness: 900,
    melody: [[50, 57], [], [53], [], [48, 55], [], [46, 53], []],
    bass: [26, null, null, null, 24, null, null, null],
  },
  airport: {
    bpm: 72,
    waveform: "sine",
    brightness: 2100,
    melody: [[62, 69], [66], [], [73], [64, 71], [69], [], [76]],
    bass: [38, null, null, null, 40, null, null, null],
  },
  throne: {
    bpm: 80,
    waveform: "sawtooth",
    brightness: 950,
    melody: [[50, 57], [53], [57], [60], [48, 55], [52], [55], [59]],
    bass: [26, null, null, null, 24, null, null, null],
  },
  "knight-boss": {
    bpm: 136,
    waveform: "sawtooth",
    brightness: 1350,
    melody: [[62, 69], [65], [69], [70], [62, 69], [72], [70], [65]],
    bass: [38, null, 38, null, 36, null, 41, null],
    percussion: true,
  },
  "toad-boss": {
    bpm: 106,
    waveform: "triangle",
    brightness: 1050,
    melody: [[53, 60], [], [56], [59], [51, 58], [54], [], [49]],
    bass: [29, null, 32, null, 27, 30, null, 32],
    percussion: true,
  },
  "bear-boss": {
    bpm: 120,
    waveform: "square",
    brightness: 850,
    melody: [[50, 57], [], [53], [50], [48, 55], [], [46], [48]],
    bass: [26, 26, null, 24, 22, 22, null, 24],
    percussion: true,
  },
};

const DEFAULT_VOLUME = 0.35;
const VOLUME_STORAGE_KEY = "technogame:music-volume";

function midiToFrequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

class ProceduralMusicEngine {
  private readonly context: AudioContext;
  private readonly master: GainNode;
  private readonly musicBus: GainNode;
  private readonly effectsBus: GainNode;
  private trackGain: GainNode | null = null;
  private scheduler: number | null = null;
  private nextStepAt = 0;
  private step = 0;
  private theme: MusicTheme | null = null;
  private readonly lastEffectAt = new Map<SoundEffect, number>();

  constructor(volume: number) {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.musicBus = this.context.createGain();
    this.effectsBus = this.context.createGain();
    this.master.gain.value = volume;
    this.musicBus.gain.value = 0.3;
    this.effectsBus.gain.value = 0.24;
    this.musicBus.connect(this.master);
    this.effectsBus.connect(this.master);
    this.master.connect(this.context.destination);
  }

  async resume() {
    if (this.context.state !== "running") await this.context.resume();
  }

  setVolume(volume: number) {
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(volume, now, 0.04);
  }

  setTheme(theme: MusicTheme) {
    if (this.theme === theme) return;
    this.theme = theme;

    if (this.scheduler !== null) window.clearInterval(this.scheduler);
    this.scheduler = null;

    const now = this.context.currentTime;
    if (this.trackGain) {
      this.trackGain.gain.cancelScheduledValues(now);
      this.trackGain.gain.setTargetAtTime(0, now, 0.12);
    }

    const nextTrack = this.context.createGain();
    nextTrack.gain.setValueAtTime(0, now);
    nextTrack.gain.linearRampToValueAtTime(0.82, now + 0.35);
    nextTrack.connect(this.musicBus);
    this.trackGain = nextTrack;
    this.step = 0;
    this.nextStepAt = now + 0.06;

    this.scheduleAhead();
    this.scheduler = window.setInterval(() => this.scheduleAhead(), 80);
  }

  private scheduleAhead() {
    if (!this.theme || !this.trackGain) return;
    const spec = THEMES[this.theme];
    const stepDuration = 60 / spec.bpm / 2;

    while (this.nextStepAt < this.context.currentTime + 0.28) {
      const patternStep = this.step % spec.melody.length;
      const notes = spec.melody[patternStep];
      const noteGain = notes.length > 1 ? 0.045 : 0.062;
      notes.forEach((note, index) => {
        this.playNote(note, this.nextStepAt, stepDuration * 0.82, spec.waveform, noteGain, spec.brightness, index * 3);
      });

      const bassNote = spec.bass[this.step % spec.bass.length];
      if (bassNote !== null) {
        this.playNote(bassNote, this.nextStepAt, stepDuration * 1.7, "triangle", 0.09, 520);
      }

      if (spec.percussion && this.step % 2 === 0) {
        this.playKick(this.nextStepAt, this.step % 4 === 0 ? 0.13 : 0.075);
      }

      this.step += 1;
      this.nextStepAt += stepDuration;
    }
  }

  private playNote(
    note: number,
    start: number,
    duration: number,
    waveform: OscillatorType,
    level: number,
    brightness: number,
    detune = 0,
  ) {
    if (!this.trackGain) return;
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(midiToFrequency(note), start);
    oscillator.detune.setValueAtTime(detune, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(brightness, start);
    filter.Q.value = 1.2;

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(level, start + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.trackGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  private playKick(start: number, level: number) {
    if (!this.trackGain) return;
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(105, start);
    oscillator.frequency.exponentialRampToValueAtTime(42, start + 0.14);
    envelope.gain.setValueAtTime(level, start);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(envelope);
    envelope.connect(this.trackGain);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  }

  playEffect(effect: SoundEffect) {
    const nowMs = performance.now();
    const cooldown = effect === "player-hit" || effect === "enemy-hit" ? 130 : effect === "ui" ? 45 : 80;
    if (nowMs - (this.lastEffectAt.get(effect) ?? -Infinity) < cooldown) return;
    this.lastEffectAt.set(effect, nowMs);

    const now = this.context.currentTime + 0.006;
    const tone = (frequency: number, endFrequency: number, duration: number, level: number, waveform: OscillatorType = "sine", delay = 0) => {
      const start = now + delay;
      const oscillator = this.context.createOscillator();
      const filter = this.context.createBiquadFilter();
      const envelope = this.context.createGain();
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
      filter.type = "lowpass";
      filter.frequency.value = 3200;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(level, start + Math.min(0.018, duration * 0.2));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.effectsBus);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    };
    const noise = (duration: number, level: number, cutoff: number, delay = 0) => {
      const start = now + delay;
      const frames = Math.max(1, Math.floor(this.context.sampleRate * duration));
      const buffer = this.context.createBuffer(1, frames, this.context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) samples[i] = Math.random() * 2 - 1;
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const envelope = this.context.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = cutoff;
      envelope.gain.setValueAtTime(level, start);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.effectsBus);
      source.start(start);
    };

    switch (effect) {
      case "ui": tone(520, 680, 0.055, 0.16, "triangle"); break;
      case "interact": tone(420, 720, 0.09, 0.2, "triangle"); break;
      case "transition": tone(260, 620, 0.22, 0.14, "sine"); tone(390, 880, 0.2, 0.08, "sine", 0.04); break;
      case "boss-start": tone(92, 46, 0.5, 0.35, "sawtooth"); noise(0.32, 0.12, 700); break;
      case "boss-roar": tone(78, 38, 0.55, 0.4, "sawtooth"); noise(0.45, 0.2, 950); break;
      case "slime": tone(150, 82, 0.22, 0.28, "sine"); tone(230, 120, 0.16, 0.14, "triangle", 0.04); break;
      case "fire": noise(0.34, 0.2, 2200); tone(160, 65, 0.28, 0.13, "sawtooth"); break;
      case "reflect": tone(360, 980, 0.18, 0.3, "triangle"); tone(620, 1320, 0.12, 0.14, "sine", 0.07); break;
      case "impact": noise(0.11, 0.36, 850); tone(105, 48, 0.16, 0.35, "sine"); break;
      case "player-hit": noise(0.09, 0.26, 1200); tone(145, 72, 0.14, 0.25, "square"); break;
      case "enemy-hit": tone(310, 130, 0.1, 0.24, "sawtooth"); break;
      case "shield": tone(880, 410, 0.16, 0.2, "square"); noise(0.08, 0.12, 3600); break;
      case "plate": tone(170, 110, 0.14, 0.25, "square"); tone(330, 260, 0.09, 0.14, "triangle", 0.08); break;
      case "punch": noise(0.1, 0.32, 750); tone(125, 58, 0.13, 0.3, "sine"); break;
      case "throw": noise(0.16, 0.12, 5200); tone(520, 260, 0.18, 0.16, "triangle"); break;
      case "jump": tone(240, 520, 0.13, 0.18, "sine"); break;
      case "purchase": tone(660, 990, 0.1, 0.18, "square"); tone(880, 1320, 0.12, 0.14, "triangle", 0.08); break;
      case "denied": tone(190, 145, 0.16, 0.22, "square"); tone(170, 120, 0.18, 0.18, "square", 0.13); break;
      case "chest": noise(0.22, 0.18, 1100); tone(110, 70, 0.3, 0.2, "triangle"); break;
      case "reward": tone(520, 1040, 0.28, 0.22, "sine"); tone(660, 1320, 0.3, 0.16, "sine", 0.06); break;
      case "victory": [523, 659, 784].forEach((frequency, i) => tone(frequency, frequency * 1.01, 0.35, 0.16, "triangle", i * 0.11)); break;
      case "defeat": tone(220, 72, 0.65, 0.3, "sawtooth"); break;
      case "portal": tone(280, 920, 0.38, 0.16, "sine"); tone(410, 1220, 0.34, 0.1, "sine", 0.05); break;
    }
  }

  destroy() {
    if (this.scheduler !== null) window.clearInterval(this.scheduler);
    void this.context.close();
  }
}

type MusicContextValue = {
  volume: number;
  setVolume: (volume: number) => void;
  setThemeOverride: (theme: MusicTheme | null) => void;
  playSound: (effect: SoundEffect) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function themeForPath(pathname: string): MusicTheme {
  if (pathname === "/throne-room/fight") return "knight-boss";
  if (pathname === "/throne-room") return "throne";
  if (pathname === "/nicotine") return "fairyland";
  if (pathname === "/crate") return "kiosk";
  if (pathname === "/careful") return "pit";
  if (pathname === "/cave") return "cave";
  if (pathname === "/airport") return "airport";
  return "hub";
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [themeOverride, setThemeOverride] = useState<MusicTheme | null>(null);
  const engineRef = useRef<ProceduralMusicEngine | null>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const themeRef = useRef<MusicTheme>(themeForPath(pathname));
  const pathnameRef = useRef(pathname);
  const activeTheme = themeOverride ?? themeForPath(pathname);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedValue === null) return;
    const stored = Number(storedValue);
    if (!Number.isFinite(stored) || stored < 0 || stored > 1) return;
    volumeRef.current = stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing a persisted browser preference after hydration.
    setVolumeState(stored);
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
    engineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    themeRef.current = activeTheme;
    engineRef.current?.setTheme(activeTheme);
  }, [activeTheme]);

  const ensureEngine = useCallback(() => {
    if (engineRef.current) return engineRef.current;
    const engine = new ProceduralMusicEngine(volumeRef.current);
    engineRef.current = engine;
    engine.setTheme(themeRef.current);
    void engine.resume();
    return engine;
  }, []);

  useEffect(() => {
    function unlockMusic() {
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
      ensureEngine();
    }

    window.addEventListener("pointerdown", unlockMusic);
    window.addEventListener("keydown", unlockMusic);
    return () => {
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [ensureEngine]);

  const playSound = useCallback((effect: SoundEffect) => {
    ensureEngine().playEffect(effect);
  }, [ensureEngine]);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    engineRef.current?.playEffect("transition");
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("button, a[href], [role='button']") : null;
      if (!element || element.matches(":disabled") || element.getAttribute("aria-disabled") === "true") return;
      const requested = element.dataset.sfx;
      if (requested === "none") return;
      playSound((requested as SoundEffect | undefined) ?? "ui");
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [playSound]);

  const setVolume = useCallback((nextVolume: number) => {
    const clamped = Math.min(1, Math.max(0, nextVolume));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
  }, []);

  const contextValue = useMemo(
    () => ({ volume, setVolume, setThemeOverride, playSound }),
    [volume, setVolume, playSound],
  );

  return <MusicContext.Provider value={contextValue}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}

export function useMusicTheme(theme: MusicTheme | null) {
  const { setThemeOverride } = useMusic();

  useEffect(() => {
    setThemeOverride(theme);
    return () => setThemeOverride(null);
  }, [setThemeOverride, theme]);
}

export function useSoundEffects() {
  const { playSound } = useMusic();
  return playSound;
}
