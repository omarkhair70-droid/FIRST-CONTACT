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

function ping(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  at: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  filter.Q.value = 0.45;

  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(at);
  osc.stop(at + duration + 0.04);
}

function ceramicTick(
  ctx: AudioContext,
  destination: AudioNode,
  at: number,
  volume = 0.018,
  frequency = 2300,
) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * 0.09));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i += 1) {
    const decay = Math.exp(-i / (frameCount * 0.15));
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const source = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = frequency;
  band.Q.value = 4.2;

  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.085);

  source.connect(band);
  band.connect(gain);
  gain.connect(destination);
  source.start(at);
}

function makeAir(ctx: AudioContext) {
  const seconds = 3;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.982 + white * 0.018;
    data[i] = last * 0.78;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.value = 620;
  filter.Q.value = 0.42;
  gain.gain.value = 0.006;

  source.connect(filter);
  filter.connect(gain);

  return { source, filter, gain };
}

export function createSensorySoundscape(): Engine | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) return null;

  const ctx = new AudioCtx();

  // The previous mix leaned heavily on 52–65 Hz material. That disappears on many
  // phone speakers, so the body now lives one octave higher while keeping the same mood.
  const master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  const low = ctx.createOscillator();
  const mid = ctx.createOscillator();
  const high = ctx.createOscillator();
  const lowGain = ctx.createGain();
  const midGain = ctx.createGain();
  const highGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const air = makeAir(ctx);

  master.gain.value = 0.48;

  compressor.threshold.value = -18;
  compressor.knee.value = 14;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.24;

  filter.type = "lowpass";
  filter.frequency.value = 1500;
  filter.Q.value = 0.55;

  low.type = "sine";
  mid.type = "triangle";
  high.type = "sine";

  low.frequency.value = 86;
  mid.frequency.value = 172;
  high.frequency.value = 258;

  lowGain.gain.value = 0.023;
  midGain.gain.value = 0.003;
  highGain.gain.value = 0.001;

  low.connect(lowGain);
  mid.connect(midGain);
  high.connect(highGain);

  lowGain.connect(filter);
  midGain.connect(filter);
  highGain.connect(filter);
  air.gain.connect(filter);

  filter.connect(master);
  master.connect(compressor);
  compressor.connect(ctx.destination);

  low.start();
  mid.start();
  high.start();
  air.source.start();

  const setScene = (scene: SensoryScene) => {
    const now = ctx.currentTime;
    if (ctx.state === "suspended") void ctx.resume();

    const settings: Record<
      SensoryScene,
      {
        low: number;
        mid: number;
        high: number;
        air: number;
        airHz: number;
        filter: number;
        master: number;
        f1: number;
        f2: number;
        f3: number;
      }
    > = {
      object:    { low: .020, mid: .0030, high: .0008, air: .0055, airHz: 520, filter: 1180, master: .42, f1: 86,  f2: 172, f3: 258 },
      gap:       { low: .023, mid: .0060, high: .0012, air: .0065, airHz: 560, filter: 1280, master: .45, f1: 92,  f2: 184, f3: 276 },
      angle:     { low: .026, mid: .0100, high: .0025, air: .0072, airHz: 620, filter: 1480, master: .49, f1: 96,  f2: 192, f3: 288 },
      signal:    { low: .021, mid: .0120, high: .0048, air: .0068, airHz: 720, filter: 1780, master: .52, f1: 102, f2: 204, f3: 306 },
      third:     { low: .020, mid: .0140, high: .0062, air: .0085, airHz: 780, filter: 2080, master: .54, f1: 108, f2: 216, f3: 324 },
      reveal:    { low: .019, mid: .0155, high: .0068, air: .0088, airHz: 820, filter: 2200, master: .55, f1: 108, f2: 216, f3: 324 },
      name:      { low: .019, mid: .0170, high: .0082, air: .0094, airHz: 880, filter: 2380, master: .57, f1: 110, f2: 220, f3: 330 },
      choice:    { low: .019, mid: .0150, high: .0068, air: .0088, airHz: 820, filter: 2200, master: .55, f1: 108, f2: 216, f3: 324 },
      ninetyone: { low: .020, mid: .0175, high: .0040, air: .0076, airHz: 700, filter: 1980, master: .56, f1: 102, f2: 204, f3: 306 },
      ninetysix: { low: .020, mid: .0175, high: .0058, air: .0081, airHz: 740, filter: 2140, master: .57, f1: 102, f2: 204, f3: 306 },
      unchanged: { low: .016, mid: .0032, high: .0008, air: .0048, airHz: 500, filter: 1120, master: .40, f1: 86,  f2: 172, f3: 258 },
    };

    const s = settings[scene];

    low.frequency.exponentialRampToValueAtTime(s.f1, now + 0.9);
    mid.frequency.exponentialRampToValueAtTime(s.f2, now + 0.9);
    high.frequency.exponentialRampToValueAtTime(s.f3, now + 0.9);
    air.filter.frequency.exponentialRampToValueAtTime(s.airHz, now + 1.1);

    ramp(lowGain.gain, s.low, now, 0.9);
    ramp(midGain.gain, s.mid, now, 0.9);
    ramp(highGain.gain, s.high, now, 0.9);
    ramp(air.gain.gain, s.air, now, 1.1);
    filter.frequency.exponentialRampToValueAtTime(s.filter, now + 1.05);
    ramp(master.gain, s.master, now, 1.05);
  };

  const accent = (scene: SensoryScene) => {
    const now = ctx.currentTime + 0.015;
    if (ctx.state === "suspended") void ctx.resume();

    if (scene === "angle") {
      ceramicTick(ctx, compressor, now, .024, 1850);
      ping(ctx, compressor, 220, now + .025, .16, .028, "triangle");
      ping(ctx, compressor, 277, now + .12, .22, .020, "sine");
    } else if (scene === "signal") {
      ceramicTick(ctx, compressor, now, .020, 2850);
      ping(ctx, compressor, 247, now + .02, .12, .024);
      ping(ctx, compressor, 370, now + .2, .16, .018);
    } else if (scene === "third") {
      ceramicTick(ctx, compressor, now, .021, 2100);
      ping(ctx, compressor, 164, now + .03, .34, .025);
      ping(ctx, compressor, 246, now + .10, .42, .020);
      ping(ctx, compressor, 328, now + .18, .48, .016);
    } else if (scene === "reveal") {
      ceramicTick(ctx, compressor, now, .017, 1700);
      ping(ctx, compressor, 164, now + .06, .40, .018);
    } else if (scene === "name") {
      ceramicTick(ctx, compressor, now, .022, 2400);
      ping(ctx, compressor, 246, now + .025, .22, .026);
      ping(ctx, compressor, 328, now + .11, .30, .020);
    } else if (scene === "ninetyone") {
      ping(ctx, compressor, 204, now, .46, .027);
      ping(ctx, compressor, 306, now + .12, .56, .021);
      // Deliberately no resolving upper note: the chord must remain bodily unfinished.
    } else if (scene === "ninetysix") {
      ping(ctx, compressor, 204, now, .44, .027);
      ping(ctx, compressor, 306, now + .11, .54, .021);
      ping(ctx, compressor, 408, now + .24, .34, .011);
    } else if (scene === "unchanged") {
      ceramicTick(ctx, compressor, now, .014, 1450);
      ping(ctx, compressor, 164, now + .03, .26, .015);
    } else if (scene === "object") {
      ceramicTick(ctx, compressor, now, .020, 2050);
      ping(ctx, compressor, 172, now + .03, .24, .016);
    } else {
      ping(ctx, compressor, 196, now, .16, .017);
    }
  };

  const destroy = () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    window.setTimeout(() => void ctx.close(), 290);
  };

  return { setScene, accent, destroy };
}
