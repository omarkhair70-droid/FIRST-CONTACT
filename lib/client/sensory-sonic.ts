"use client";

import type { SensoryScene } from "@/components/lab/SensoryLabWorld";

type Engine = {
  setScene: (scene: SensoryScene) => void;
  accent: (scene: SensoryScene) => void;
  destroy: () => void;
};

function ramp(param: AudioParam, value: number, at: number, duration = 0.7) {
  param.cancelScheduledValues(at);
  param.setValueAtTime(Math.max(0.0001, param.value), at);
  param.exponentialRampToValueAtTime(Math.max(0.0001, value), at + duration);
}

function ping(ctx: AudioContext, frequency: number, at: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.03);
}

export function createSensorySoundscape(): Engine | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  const low = ctx.createOscillator();
  const mid = ctx.createOscillator();
  const high = ctx.createOscillator();
  const lowGain = ctx.createGain();
  const midGain = ctx.createGain();
  const highGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  master.gain.value = 0.34;
  filter.type = "lowpass";
  filter.frequency.value = 950;
  filter.Q.value = 0.7;

  low.type = "sine";
  mid.type = "triangle";
  high.type = "sine";
  low.frequency.value = 55;
  mid.frequency.value = 110;
  high.frequency.value = 220;
  lowGain.gain.value = 0.012;
  midGain.gain.value = 0.0001;
  highGain.gain.value = 0.0001;

  low.connect(lowGain);
  mid.connect(midGain);
  high.connect(highGain);
  lowGain.connect(filter);
  midGain.connect(filter);
  highGain.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);
  low.start();
  mid.start();
  high.start();

  const setScene = (scene: SensoryScene) => {
    const now = ctx.currentTime;
    if (ctx.state === "suspended") void ctx.resume();

    const settings: Record<SensoryScene, { low: number; mid: number; high: number; filter: number; master: number; f1: number; f2: number; f3: number }> = {
      object: { low: .010, mid: .0001, high: .0001, filter: 700, master: .24, f1: 52, f2: 104, f3: 208 },
      gap: { low: .013, mid: .002, high: .0001, filter: 760, master: .27, f1: 55, f2: 108, f3: 216 },
      angle: { low: .015, mid: .005, high: .0008, filter: 880, master: .29, f1: 58, f2: 116, f3: 233 },
      signal: { low: .010, mid: .0065, high: .0018, filter: 1150, master: .3, f1: 61, f2: 122, f3: 244 },
      third: { low: .009, mid: .008, high: .003, filter: 1450, master: .32, f1: 65, f2: 130, f3: 195 },
      reveal: { low: .008, mid: .009, high: .0035, filter: 1550, master: .33, f1: 65, f2: 130, f3: 195 },
      name: { low: .008, mid: .010, high: .005, filter: 1750, master: .34, f1: 65, f2: 130, f3: 195 },
      choice: { low: .008, mid: .009, high: .004, filter: 1600, master: .33, f1: 65, f2: 130, f3: 195 },
      ninetyone: { low: .008, mid: .010, high: .0024, filter: 1480, master: .35, f1: 61, f2: 122, f3: 183 },
      ninetysix: { low: .008, mid: .010, high: .0032, filter: 1660, master: .36, f1: 61, f2: 122, f3: 183 },
      unchanged: { low: .007, mid: .001, high: .0001, filter: 720, master: .24, f1: 52, f2: 104, f3: 208 },
    };
    const s = settings[scene];
    low.frequency.exponentialRampToValueAtTime(s.f1, now + .8);
    mid.frequency.exponentialRampToValueAtTime(s.f2, now + .8);
    high.frequency.exponentialRampToValueAtTime(s.f3, now + .8);
    ramp(lowGain.gain, s.low, now, .8);
    ramp(midGain.gain, s.mid, now, .8);
    ramp(highGain.gain, s.high, now, .8);
    filter.frequency.exponentialRampToValueAtTime(s.filter, now + .9);
    ramp(master.gain, s.master, now, .9);
  };

  const accent = (scene: SensoryScene) => {
    const now = ctx.currentTime + .015;
    if (ctx.state === "suspended") void ctx.resume();
    if (scene === "angle") {
      ping(ctx, 174, now, .13, .018, "triangle");
      ping(ctx, 220, now + .09, .18, .013, "sine");
    } else if (scene === "signal") {
      ping(ctx, 196, now, .1, .013);
      ping(ctx, 294, now + .18, .14, .011);
    } else if (scene === "third") {
      ping(ctx, 130, now, .28, .015);
      ping(ctx, 195, now + .07, .36, .012);
      ping(ctx, 260, now + .15, .42, .009);
    } else if (scene === "name") {
      ping(ctx, 195, now, .18, .015);
      ping(ctx, 260, now + .08, .24, .012);
    } else if (scene === "ninetyone") {
      ping(ctx, 122, now, .34, .018);
      ping(ctx, 183, now + .1, .42, .014);
      // Deliberately no resolving upper note.
    } else if (scene === "ninetysix") {
      ping(ctx, 122, now, .34, .018);
      ping(ctx, 183, now + .1, .42, .014);
      ping(ctx, 244, now + .22, .28, .007);
    } else if (scene === "unchanged") {
      ping(ctx, 130, now, .22, .009);
    } else {
      ping(ctx, 156, now, .13, .01);
    }
  };

  const destroy = () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(.0001, now + .18);
    window.setTimeout(() => void ctx.close(), 220);
  };

  return { setScene, accent, destroy };
}
