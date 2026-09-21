export type SonicCue =
  | "inspect"
  | "shift"
  | "reveal"
  | "identify"
  | "consent"
  | "send"
  | "complete"
  | "archive";

let audioContext: AudioContext | null = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  audioContext ??= new Ctx();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(ctx: AudioContext, frequency: number, at: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.02);
}

export function playCue(cue: SonicCue) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.01;

  switch (cue) {
    case "inspect":
      tone(ctx, 132, now, 0.14, 0.025, "sine");
      tone(ctx, 264, now + 0.07, 0.16, 0.016, "triangle");
      break;
    case "shift":
      tone(ctx, 174, now, 0.1, 0.018, "triangle");
      tone(ctx, 220, now + 0.045, 0.12, 0.014, "sine");
      break;
    case "reveal":
      tone(ctx, 110, now, 0.28, 0.024, "sine");
      tone(ctx, 165, now + 0.08, 0.3, 0.018, "triangle");
      tone(ctx, 247, now + 0.16, 0.34, 0.014, "sine");
      break;
    case "identify":
      tone(ctx, 196, now, 0.13, 0.016, "sine");
      break;
    case "consent":
      tone(ctx, 147, now, 0.12, 0.016, "triangle");
      tone(ctx, 220, now + 0.08, 0.14, 0.012, "sine");
      break;
    case "send":
      tone(ctx, 185, now, 0.14, 0.018, "sine");
      tone(ctx, 277, now + 0.09, 0.18, 0.016, "triangle");
      tone(ctx, 370, now + 0.18, 0.22, 0.012, "sine");
      break;
    case "complete":
      tone(ctx, 123, now, 0.24, 0.022, "sine");
      tone(ctx, 185, now + 0.08, 0.28, 0.018, "triangle");
      tone(ctx, 277, now + 0.16, 0.34, 0.014, "sine");
      break;
    case "archive":
      tone(ctx, 164, now, 0.18, 0.014, "sine");
      tone(ctx, 130, now + 0.08, 0.22, 0.01, "triangle");
      break;
  }
}
