import type { NotificationSound } from "../types/todo";

/**
 * Sound Engine — Web Audio API based notification sounds
 *
 * All sounds are synthesised entirely in the browser.
 * No external audio files are needed.
 */

// Shared AudioContext to avoid multiple instances and handle suspended state
let sharedCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null as any;
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedCtx;
};

/**
 * Resumes and unlocks the audio context. 
 * Should be called from a user gesture (click/tap).
 */
export const resumeAudioContext = async (): Promise<boolean> => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  
  // Create and play a silent buffer to unlock audio on some mobile browsers
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  
  return ctx.state === "running";
};

type SoundDef = {
  label: string;
  emoji: string;
  description: string;
  play: (ctx: AudioContext) => void;
};

/** Shared helper: create and connect oscillator + gain */
const createOscillator = (
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
  gainValue: number,
  startTime: number,
  endTime: number,
  destination: AudioNode = ctx.destination
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, endTime);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(endTime + 0.05);
  return { osc, gain };
};

const SOUNDS: Record<NotificationSound, SoundDef> = {
  /** Warm single bell tone */
  bell: {
    label: "Bell",
    emoji: "🔔",
    description: "Classic warm bell",
    play: (ctx) => {
      const t = ctx.currentTime;
      createOscillator(ctx, "sine", 880, 0.4, t, t + 1.5);
      createOscillator(ctx, "sine", 1320, 0.15, t, t + 1.2);
    },
  },

  /** Two ascending chime notes */
  chime: {
    label: "Chime",
    emoji: "🎵",
    description: "Two-note chime",
    play: (ctx) => {
      const t = ctx.currentTime;
      createOscillator(ctx, "sine", 523.25, 0.35, t, t + 0.6);        // C5
      createOscillator(ctx, "sine", 783.99, 0.35, t + 0.25, t + 0.85); // G5
    },
  },

  /** Urgent rapid double-pulse */
  alert: {
    label: "Alert",
    emoji: "⚠️",
    description: "Urgent alert pulse",
    play: (ctx) => {
      const t = ctx.currentTime;
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, t + offset);
        gain.gain.setValueAtTime(0.25, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.18);
      });
    },
  },

  /** Gentle, quiet soft ping */
  soft: {
    label: "Soft",
    emoji: "🌙",
    description: "Gentle soft ping",
    play: (ctx) => {
      const t = ctx.currentTime;
      createOscillator(ctx, "sine", 660, 0.18, t, t + 0.8);
      createOscillator(ctx, "sine", 990, 0.08, t + 0.05, t + 0.6);
    },
  },

  /** Pleasant 4-note uplifting melody (C-E-G-C) */
  melody: {
    label: "Melody",
    emoji: "🎶",
    description: "Uplifting 4-note melody",
    play: (ctx) => {
      const t = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        createOscillator(ctx, "sine", freq, 0.3, t + i * 0.15, t + i * 0.15 + 0.3);
      });
    },
  },

  /** Low rumble / buzz vibration feel */
  buzz: {
    label: "Buzz",
    emoji: "📳",
    description: "Vibration-style buzz",
    play: (ctx) => {
      const t = ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, t + offset);
        osc.frequency.linearRampToValueAtTime(50, t + offset + 0.1);
        gain.gain.setValueAtTime(0.3, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.15);
      });
    },
  },
};

/** All sound options as an ordered array for UI rendering */
export const SOUND_OPTIONS: { value: NotificationSound; label: string; emoji: string; description: string }[] =
  (Object.entries(SOUNDS) as [NotificationSound, SoundDef][]).map(([value, def]) => ({
    value,
    label: def.label,
    emoji: def.emoji,
    description: def.description,
  }));

/**
 * Play a notification sound by name.
 * @param sound - The sound to play (defaults to 'bell' if missing)
 * @param enabled - Global sound enabled flag from Redux ui state
 */
export const playNotificationSound = (
  sound: NotificationSound = "bell",
  enabled: boolean = true
): void => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    // If suspended, it might not play. We hope it was resumed by a prior user gesture.
    const def = SOUNDS[sound] ?? SOUNDS.bell;
    def.play(ctx);
  } catch (e) {
    console.warn("Audio not supported or blocked:", e);
  }
};

/**
 * Preview a sound (used in settings/form UI)
 * Also ensures context is resumed.
 */
export const previewSound = async (sound: NotificationSound): Promise<void> => {
  await resumeAudioContext();
  playNotificationSound(sound, true);
};
