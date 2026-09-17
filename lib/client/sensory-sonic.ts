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

function ceramicTick(ctx: AudioContext, at: number, volume = 0.007, frequency = 2300) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * 0.075));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const decay = Math.exp(-i / (frameCount * 0.13));
    data[i] = (Math.random() * 2 - 1) * decay;
  }
  const source = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = frequency;
  band.Q.value = 5.5;
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
  source.connect(band);
  band.connect(gain);
  gain.connect(ctx.destination);
  source.start(at);
}

function makeAir(ctx: AudioContext) {
  const seconds = 3;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.985 + white * 0.015;
    data[i] = last * 0.7;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 430;
  filter.Q.value = 0.55;
  gain.gain.value = 0.0025;
  source.connect(filter);
  filter.connect(gain);
  return { source, filter, gain };
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
  const air = makeAir(ctx);

  master.gain.value = 0.3;
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;

  low.type = "sine";
  mid.type = "triangle";
  high.type = "sine";
  low.frequency.value = 52;
  mid.frequency.value = 104;
  high.frequency.value = 208;
  lowGain.gain.value = 0.01;
  midGain.gain.value = 0.0001;
  highGain.gain.value = 0.0001;

  low.connect(lowGain);
  mid.connect(midGain);
  high.connect(highGain);
  lowGain.connect(filter);
  midGain.connect(filter);
  highGain.connect(filter);
  air.gain.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);
  low.start();
  mid.start();
  high.start();
  air.source.start();

  const setScene = (scene: SensoryScene) => {
    const now = ctx.currentTime;
    if (ctx.state === "suspended") void ctx.resume();

    const settings: Record<SensoryScene, { low: number; mid: number; high: number; air: number; airHz: number; filter: number; master: number; f1: number; f2: number; f3: number }> = {
      object: { low: .009, mid: .0001, high: .0001, air: .0023, airHz: 380, filter: 680, master: .23, f1: 52, f2: 104, f3: 208 },
      gap: { low: .0115, mid: .0017, high: .0001, air: .003, airHz: 410, filter: 740, master: .25, f1: 55, f2: 108, f3: 216 },
      angle: { low: .0135, mid: .0042, high: .0006, air: .0035, airHz: 470, filter: 850, master: .27, f1: 58, f2: 116, f3: 233 },
      signal: { low: .009, mid: .0055, high: .0014, air: .0031, airHz: 560, filter: 1080, master: .28, f1: 61, f2: 122, f3: 244 },
      third: { low: .008, mid: .0068, high: .0025, air: .0042, airHz: 620, filter: 1360, master: .3, f1: 65, f2: 130, f3: 195 },
      reveal: { low: .0075, mid: .0075, high: .003, air: .0044, airHz: 650, filter: 1460, master: .31, f1: 65, f2: 130, f3: 195 },
      name: { low: .0075, mid: .0083, high: .0041, air: .0048, airHz: 690, filter: 1650, master: .32, f1: 65, f2: 130, f3: 195 },
      choice: { low: .0075, mid: .0075, high: .0033, air: .0044, airHz: 640, filter: 1520, master: .31, f1: 65, f2: 130, f3: 195 },
      ninetyone: { low: .0075, mid: .0085, high: .0019, air: .0037, airHz: 520, filter: 1390, master: .32, f1: 61, f2: 122, f3: 183 },
      ninetysix: { low: .0075, mid: .0085, high: .0026, air: .004, airHz: 560, filter: 1540, master: .33, f1: 61, f2: 122, f3: 183 },
      unchanged: { low: .0065, mid: .0008, high: .0001, air: .0021, airHz: 350, filter: 680, master: .22, f1: 52, f2: 104, f3: 208 },
    };

    const s = settings[scene];
    low.frequency.exponentialRampToValueAtTime(s.f1, now + .9);
    mid.frequency.exponentialRampToValueAtTime(s.f2, now + .9);
    high.frequency.exponentialRampToValueAtTime(s.f3, now + .9);
    air.filter.frequency.exponentialRampToValueAtTime(s.airHz, now + 1.1);
    ramp(lowGain.gain, s.low, now, .9);
    ramp(midGain.gain, s.mid, now, .9);
    ramp(highGain.gain, s.high, now, .9);
    ramp(air.gain.gain, s.air, now, 1.1);
    filter.frequency.exponentialRampToValueAtTime(s.filter, now + 1.05);
    ramp(master.gain, s.master, now, 1.05);
  };

  const accent = (scene: SensoryScene) => {
    const now = ctx.currentTime + .015;
    if (ctx.state === "suspended") void ctx.resume();

    if (scene === "angle") {
      ceramicTick(ctx, now, .0065, 1850);
      ping(ctx, 174, now + .025, .14, .013, "triangle");
      ping(ctx, 220, now + .11, .2, .009, "sine");
    } else if (scene === "signal") {
      ceramicTick(ctx, now, .0045, 2850);
      ping(ctx, 196, now + .02, .1, .009);
      ping(ctx, 294, now + .2, .14, .0075);
    } else if (scene === "third") {
      ceramicTick(ctx, now, .0048, 2100);
      ping(ctx, 130, now + .03, .3, .0105);
      ping(ctx, 195, now + .1, .38, .0085);
      ping(ctx, 260, now + .18, .44, .0065);
    } else if (scene === "reveal") {
      ceramicTick(ctx, now, .0038, 1700);
      ping(ctx, 130, now + .06, .38, .0065);
    } else if (scene === "name") {
      ceramicTick(ctx, now, .005, 2400);
      ping(ctx, 195, now + .025, .2, .0105);
      ping(ctx, 260, now + .11, .28, .008);
    } else if (scene === "ninetyone") {
      ping(ctx, 122, now, .42, .0125);
      ping(ctx, 183, now + .12, .52, .0095);
      // Deliberately no resolving upper note: the chord must remain bodily unfinished.
    } else if (scene === "ninetysix") {
      ping(ctx, 122, now, .4, .0125);
      ping(ctx, 183, now + .11, .5, .0095);
      ping(ctx, 244, now + .24, .32, .0045);
    } else if (scene === "unchanged") {
      ceramicTick(ctx, now, .0028, 1450);
      ping(ctx, 130, now + .03, .24, .0055);
    } else if (scene === "object") {
      ceramicTick(ctx, now, .0045, 2050);
      ping(ctx, 104, now + .03, .22, .0058);
    } else {
      ping(ctx, 156, now, .14, .0065);
    }
  };

  const destroy = () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(.0001, now + .24);
    window.setTimeout(() => void ctx.close(), 290);
  };

  return { setScene, accent, destroy };
}
