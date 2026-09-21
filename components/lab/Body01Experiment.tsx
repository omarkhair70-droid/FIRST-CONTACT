"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  createBodyVisionRuntime,
  type BodyVisionRuntime,
} from "../../lib/client/body-vision";
import styles from "./Body01Experiment.module.css";

type MotionSignal = {
  energy: number;
  x: number;
  y: number;
  memory: number;
  corruption: number;
  calm: number;
  openness: number;
  ascent: number;
  shoulderTilt: number;
  proximity: number;
  visionConfidence: number;
};

type AudioRig = {
  context: AudioContext;
  oscillators: OscillatorNode[];
  master: GainNode;
  panner: StereoPannerNode;
  filter: BiquadFilterNode;
};

type VisionState = "idle" | "loading" | "ready" | "fallback";

const neutralSignal: MotionSignal = {
  energy: 0,
  x: 0,
  y: 0,
  memory: 0,
  corruption: 0,
  calm: 1,
  openness: 0,
  ascent: 0,
  shoulderTilt: 0,
  proximity: 0,
  visionConfidence: 0,
};

const vertexShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uMemory;
  uniform float uCorruption;
  uniform float uCalm;
  uniform float uOpenness;
  uniform float uAscent;
  uniform float uShoulderTilt;
  uniform float uProximity;
  uniform vec2 uPoint;

  varying vec3 vNormalView;
  varying vec3 vBasePosition;
  varying float vDisplace;
  varying float vHeat;
  varying float vGestureLight;
  varying float vSemanticFracture;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash31(i + vec3(0.0, 0.0, 0.0)), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  void main() {
    vec3 p = position;

    float breath =
      sin(uTime * (0.55 + uCalm * 0.12) + p.y * 2.1) * 0.5 + 0.5;

    float directedWave =
      sin((p.y + uPoint.y * 0.72) * 4.0 + uTime * 1.05) *
      cos((p.x - uPoint.x * 0.72) * 3.1 - uTime * 0.81);

    float localPull = exp(-3.0 * distance(p.xy, uPoint * 0.82));
    float remembered = noise3(p * 2.6 + vec3(uTime * 0.06, 0.0, 0.0)) - 0.5;

    float bladeField =
      pow(abs(sin(p.y * 7.5 + p.x * 5.0 + uTime * 0.55)), 10.0) *
      sign(sin(p.x * 4.0 - p.z * 5.0 + uTime * 0.43));

    float corruptionShape =
      (remembered * 0.16 + bladeField * 0.20) *
      smoothstep(0.28, 1.0, uCorruption);

    float semanticFracture =
      abs(uShoulderTilt) *
      sin(p.y * 8.0 + p.z * 5.0 + uTime * 0.32) *
      0.055;

    float displacement =
      breath * (0.018 + uCalm * 0.012) +
      directedWave * (0.025 + uEnergy * 0.22) +
      localPull * uEnergy * 0.17 +
      remembered * uMemory * 0.09 +
      corruptionShape +
      semanticFracture;

    p += normal * displacement;

    float opennessBloom = 1.0 + uOpenness * 0.14;
    float ascentStretch = 1.0 + uAscent * 0.23;
    p.x *= opennessBloom;
    p.y *= ascentStretch;

    p.x += p.y * uShoulderTilt * 0.085;
    p.z += normal.z * uProximity * 0.055;

    float lean = uCorruption * 0.08;
    p.x += sin(p.y * 2.4 + uTime * 0.45) * lean;
    p.y -= abs(p.x) * uCorruption * 0.035;
    p.y += max(0.0, p.y) * uAscent * 0.055;

    vBasePosition = position;
    vDisplace = displacement;
    vHeat = clamp(
      uEnergy * 0.72 +
      uMemory * 0.34 +
      uCorruption * 0.55 +
      uProximity * 0.12,
      0.0,
      1.0
    );
    vGestureLight = clamp(uAscent * 0.68 + uOpenness * 0.32, 0.0, 1.0);
    vSemanticFracture = abs(uShoulderTilt);
    vNormalView = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uMemory;
  uniform float uCorruption;
  uniform float uCalm;
  uniform float uOpenness;
  uniform float uAscent;
  uniform float uShoulderTilt;
  uniform float uProximity;

  varying vec3 vNormalView;
  varying vec3 vBasePosition;
  varying float vDisplace;
  varying float vHeat;
  varying float vGestureLight;
  varying float vSemanticFracture;

  float band(float value, float width) {
    float f = abs(fract(value) - 0.5);
    return 1.0 - smoothstep(0.0, width, f);
  }

  void main() {
    vec3 pearl = vec3(0.93, 0.90, 0.82);
    vec3 halo = vec3(0.94, 0.78, 0.49);
    vec3 coral = vec3(0.90, 0.36, 0.23);
    vec3 wine = vec3(0.27, 0.06, 0.09);
    vec3 ash = vec3(0.045, 0.035, 0.032);

    float edge = pow(1.0 - abs(vNormalView.z), 2.0);
    float innerPulse = 0.5 + 0.5 * sin(
      uTime * (1.0 + uEnergy * 1.7) + vBasePosition.y * 4.0 + vDisplace * 16.0
    );

    float veinA = band(
      vBasePosition.y * 2.4 +
      sin(vBasePosition.x * 4.5 + vBasePosition.z * 2.7) * 0.34 +
      uTime * 0.018,
      0.07
    );

    float veinB = band(
      vBasePosition.x * 3.2 -
      cos(vBasePosition.y * 3.7 - vBasePosition.z * 3.1) * 0.25,
      0.055
    );

    float veins = max(veinA, veinB);
    float crack =
      veins *
      smoothstep(0.30, 0.88, uCorruption + vSemanticFracture * 0.28);
    float scar = veins * uMemory * (1.0 - uCorruption * 0.45);

    vec3 color = mix(
      pearl,
      halo,
      uMemory * 0.38 + innerPulse * uEnergy * 0.18 + vGestureLight * 0.34
    );
    color = mix(color, coral, vHeat * (0.22 + innerPulse * 0.34));
    color = mix(color, wine, uCorruption * (0.42 + edge * 0.36));
    color = mix(color, ash, uCorruption * uCorruption * (0.28 + edge * 0.45));

    vec3 veinLight = mix(halo, coral, uCorruption);
    color += veinLight * scar * (0.18 + uMemory * 0.42);
    color = mix(color, ash, crack * (0.38 + uCorruption * 0.45));
    color += coral * crack * innerPulse * uCorruption * 0.48;

    float ascentCore =
      exp(-3.8 * length(vBasePosition.xz)) *
      uAscent *
      (0.45 + innerPulse * 0.55);
    color += halo * ascentCore * 0.62;

    float openSheen =
      uOpenness *
      pow(max(0.0, vNormalView.z), 1.7) *
      0.18;
    color += pearl * openSheen;

    float presenceRim = edge * uProximity * 0.20;
    color += coral * presenceRim;

    float calmSheen = uCalm * (1.0 - uCorruption) * 0.12;
    float glow =
      0.86 +
      edge * 0.19 +
      vHeat * 0.14 +
      calmSheen +
      vGestureLight * 0.08;

    gl_FragColor = vec4(color * glow, 1.0);
  }
`;

function LivingMatter({
  signalRef,
}: {
  signalRef: React.MutableRefObject<MotionSignal>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetPointRef = useRef(new THREE.Vector2());
  const targetScaleRef = useRef(new THREE.Vector3(1, 1, 1));

  useFrame(({ clock }, delta) => {
    const signal = signalRef.current;
    const material = materialRef.current;
    const mesh = meshRef.current;
    const blendFast = Math.min(1, delta * 6.5);
    const blendSlow = Math.min(1, delta * 2.1);

    if (material) {
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uEnergy.value = THREE.MathUtils.lerp(
        material.uniforms.uEnergy.value,
        signal.energy,
        blendFast,
      );
      material.uniforms.uMemory.value = THREE.MathUtils.lerp(
        material.uniforms.uMemory.value,
        signal.memory,
        blendSlow,
      );
      material.uniforms.uCorruption.value = THREE.MathUtils.lerp(
        material.uniforms.uCorruption.value,
        signal.corruption,
        blendSlow,
      );
      material.uniforms.uCalm.value = THREE.MathUtils.lerp(
        material.uniforms.uCalm.value,
        signal.calm,
        blendSlow,
      );
      material.uniforms.uOpenness.value = THREE.MathUtils.lerp(
        material.uniforms.uOpenness.value,
        signal.openness,
        blendFast,
      );
      material.uniforms.uAscent.value = THREE.MathUtils.lerp(
        material.uniforms.uAscent.value,
        signal.ascent,
        blendFast,
      );
      material.uniforms.uShoulderTilt.value = THREE.MathUtils.lerp(
        material.uniforms.uShoulderTilt.value,
        signal.shoulderTilt,
        blendFast,
      );
      material.uniforms.uProximity.value = THREE.MathUtils.lerp(
        material.uniforms.uProximity.value,
        signal.proximity,
        blendFast,
      );

      targetPointRef.current.set(signal.x, signal.y);
      material.uniforms.uPoint.value.lerp(targetPointRef.current, blendFast);
    }

    if (mesh) {
      const fall = signal.corruption;
      mesh.rotation.y = THREE.MathUtils.lerp(
        mesh.rotation.y,
        signal.x * (0.46 + fall * 0.28),
        Math.min(1, delta * 3.3),
      );
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        -signal.y * 0.30 + fall * 0.16,
        Math.min(1, delta * 3.1),
      );
      mesh.rotation.z = THREE.MathUtils.lerp(
        mesh.rotation.z,
        signal.x * fall * 0.18 + signal.shoulderTilt * 0.18,
        Math.min(1, delta * 2.8),
      );

      const scale =
        1 +
        signal.energy * 0.08 +
        signal.memory * 0.035 -
        signal.corruption * 0.025 +
        signal.proximity * 0.06;

      targetScaleRef.current.set(
        scale * (1 + signal.openness * 0.06 - signal.corruption * 0.035),
        scale * (1 + signal.calm * 0.025 + signal.ascent * 0.09),
        scale,
      );
      mesh.scale.lerp(targetScaleRef.current, Math.min(1, delta * 4.0));
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.12, 5]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uMemory: { value: 0 },
          uCorruption: { value: 0 },
          uCalm: { value: 1 },
          uOpenness: { value: 0 },
          uAscent: { value: 0 },
          uShoulderTilt: { value: 0 },
          uProximity: { value: 0 },
          uPoint: { value: new THREE.Vector2(0, 0) },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

function MotionWorld({
  signalRef,
}: {
  signalRef: React.MutableRefObject<MotionSignal>;
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 3.3], fov: 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <LivingMatter signalRef={signalRef} />
    </Canvas>
  );
}

export default function Body01Experiment() {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "live" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [visionState, setVisionState] = useState<VisionState>("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastAnalyzeRef = useRef(0);
  const lastVisionAnalyzeRef = useRef(0);
  const previousLumaRef = useRef<Uint8Array | null>(null);
  const signalRef = useRef<MotionSignal>({ ...neutralSignal });
  const audioRef = useRef<AudioRig | null>(null);
  const visionRef = useRef<BodyVisionRuntime | null>(null);

  const stopMedia = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    visionRef.current?.close();
    visionRef.current = null;

    if (audioRef.current) {
      audioRef.current.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // Oscillator may already be stopped.
        }
      });
      void audioRef.current.context.close();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => stopMedia, [stopMedia]);

  const createAudio = useCallback(() => {
    if (audioRef.current) return;

    const context = new AudioContext();
    const master = context.createGain();
    const panner = context.createStereoPanner();
    const filter = context.createBiquadFilter();
    const low = context.createOscillator();
    const overtone = context.createOscillator();
    const lowGain = context.createGain();
    const overtoneGain = context.createGain();

    low.type = "sine";
    low.frequency.value = 92;
    overtone.type = "triangle";
    overtone.frequency.value = 184;

    lowGain.gain.value = 0.75;
    overtoneGain.gain.value = 0.15;
    master.gain.value = 0.0035;

    filter.type = "lowpass";
    filter.frequency.value = 1100;
    filter.Q.value = 0.7;

    low.connect(lowGain).connect(filter);
    overtone.connect(overtoneGain).connect(filter);
    filter.connect(master).connect(panner).connect(context.destination);

    low.start();
    overtone.start();
    void context.resume();

    audioRef.current = {
      context,
      oscillators: [low, overtone],
      master,
      panner,
      filter,
    };
  }, []);

  useEffect(() => {
    if (status !== "live") return;

    let cancelled = false;

    void createBodyVisionRuntime()
      .then((runtime) => {
        if (cancelled) {
          runtime.close();
          return;
        }

        visionRef.current = runtime;
        setVisionState("ready");
      })
      .catch(() => {
        if (!cancelled) setVisionState("fallback");
      });

    return () => {
      cancelled = true;
      visionRef.current?.close();
      visionRef.current = null;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "live") return;

    function analyzeFrame(time: number) {
      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      if (time - lastAnalyzeRef.current < 58) {
        rafRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }
      lastAnalyzeRef.current = time;

      const width = 48;
      const height = 36;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        rafRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);
      const pixels = ctx.getImageData(0, 0, width, height).data;
      const current = new Uint8Array(width * height);

      let weight = 0;
      let weightedX = 0;
      let weightedY = 0;

      const previous = previousLumaRef.current;

      for (let i = 0; i < width * height; i += 1) {
        const offset = i * 4;
        const luma =
          (pixels[offset] * 3 +
            pixels[offset + 1] * 4 +
            pixels[offset + 2]) >>
          3;
        current[i] = luma;

        if (previous) {
          const diff = Math.abs(luma - previous[i]);
          if (diff > 18) {
            const motion = diff - 18;
            const x = i % width;
            const y = Math.floor(i / width);
            weight += motion;
            weightedX += x * motion;
            weightedY += y * motion;
          }
        }
      }

      previousLumaRef.current = current;

      const targetEnergy = Math.min(1, weight / (width * height * 42));
      const targetX =
        weight > 0
          ? 1 - (weightedX / weight / (width - 1)) * 2
          : signalRef.current.x * 0.92;
      const targetY =
        weight > 0
          ? 1 - (weightedY / weight / (height - 1)) * 2
          : signalRef.current.y * 0.92;

      const signal = signalRef.current;

      signal.energy = THREE.MathUtils.lerp(
        signal.energy,
        targetEnergy,
        targetEnergy > signal.energy ? 0.30 : 0.095,
      );
      signal.x = THREE.MathUtils.lerp(signal.x, targetX, 0.16);
      signal.y = THREE.MathUtils.lerp(signal.y, targetY, 0.16);

      const calmTarget = targetEnergy < 0.055 ? 1 : 0;
      signal.calm = THREE.MathUtils.lerp(signal.calm, calmTarget, 0.045);

      const memoryGain = targetEnergy * 0.016;
      const memoryDecay = 0.0014 + signal.calm * 0.0009;
      signal.memory = THREE.MathUtils.clamp(
        signal.memory + memoryGain - memoryDecay,
        0,
        1,
      );

      if (targetEnergy > 0.24) {
        const push =
          (targetEnergy - 0.20) *
          (0.007 + signal.memory * 0.0045);
        signal.corruption = THREE.MathUtils.clamp(
          signal.corruption + push,
          0,
          1,
        );
      } else {
        const recovery =
          0.0015 +
          signal.calm * 0.0045 +
          (signal.calm > 0.86 ? 0.002 : 0);
        signal.corruption = THREE.MathUtils.clamp(
          signal.corruption - recovery,
          0,
          1,
        );
      }

      const vision = visionRef.current;
      if (vision && time - lastVisionAnalyzeRef.current >= 105) {
        lastVisionAnalyzeRef.current = time;

        try {
          const pose = vision.detect(video, time);

          if (pose) {
            const semanticBlend = 0.22;
            signal.visionConfidence = THREE.MathUtils.lerp(
              signal.visionConfidence,
              pose.confidence,
              0.28,
            );
            signal.openness = THREE.MathUtils.lerp(
              signal.openness,
              pose.openness,
              semanticBlend,
            );
            signal.ascent = THREE.MathUtils.lerp(
              signal.ascent,
              pose.ascent,
              semanticBlend,
            );
            signal.shoulderTilt = THREE.MathUtils.lerp(
              signal.shoulderTilt,
              pose.shoulderTilt,
              semanticBlend,
            );
            signal.proximity = THREE.MathUtils.lerp(
              signal.proximity,
              pose.proximity,
              semanticBlend,
            );

            signal.x = THREE.MathUtils.lerp(
              signal.x,
              pose.centerX,
              0.075 * pose.confidence,
            );
            signal.y = THREE.MathUtils.lerp(
              signal.y,
              pose.centerY,
              0.055 * pose.confidence,
            );
          } else {
            signal.visionConfidence *= 0.84;
            signal.openness *= 0.90;
            signal.ascent *= 0.90;
            signal.shoulderTilt *= 0.88;
            signal.proximity *= 0.92;
          }
        } catch {
          signal.visionConfidence *= 0.90;
        }
      } else if (!vision) {
        signal.visionConfidence *= 0.96;
        signal.openness *= 0.97;
        signal.ascent *= 0.97;
        signal.shoulderTilt *= 0.96;
        signal.proximity *= 0.98;
      }

      const audio = audioRef.current;
      if (audio) {
        const now = audio.context.currentTime;
        const corruption = signal.corruption;
        const calm = signal.calm;
        const memory = signal.memory;
        const semantic =
          signal.visionConfidence *
          (signal.ascent * 0.55 + signal.openness * 0.25);

        audio.master.gain.setTargetAtTime(
          0.003 +
            signal.energy * 0.034 +
            memory * 0.006 +
            corruption * 0.005 +
            signal.proximity * signal.visionConfidence * 0.004,
          now,
          0.08,
        );

        audio.panner.pan.setTargetAtTime(
          THREE.MathUtils.clamp(
            signal.x * (0.65 + corruption * 0.28) +
              signal.shoulderTilt * signal.visionConfidence * 0.16,
            -1,
            1,
          ),
          now,
          0.06,
        );

        const base =
          88 +
          signal.energy * 22 +
          signal.y * 6 -
          corruption * 17 +
          calm * 3 +
          signal.ascent * signal.visionConfidence * 14;

        audio.oscillators[0].frequency.setTargetAtTime(base, now, 0.11);
        audio.oscillators[1].frequency.setTargetAtTime(
          base * (2.0 + corruption * 0.028 + semantic * 0.012),
          now,
          0.09,
        );
        audio.oscillators[1].detune.setTargetAtTime(
          corruption * 38 -
            calm * 3 -
            signal.openness * signal.visionConfidence * 6,
          now,
          0.12,
        );

        audio.filter.frequency.setTargetAtTime(
          1350 -
            corruption * 820 +
            signal.energy * 460 +
            calm * 180 +
            semantic * 680,
          now,
          0.10,
        );
        audio.filter.Q.setTargetAtTime(
          0.7 + corruption * 5.0 - semantic * 0.35,
          now,
          0.14,
        );
      }

      rafRef.current = requestAnimationFrame(analyzeFrame);
    }

    rafRef.current = requestAnimationFrame(analyzeFrame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [status]);

  const enter = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("This browser cannot open a camera stream here.");
      return;
    }

    stopMedia();
    setError("");
    setStatus("requesting");
    createAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Camera surface was not mounted.");
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      previousLumaRef.current = null;
      lastVisionAnalyzeRef.current = 0;
      signalRef.current = { ...neutralSignal };
      setVisionState("loading");
      setStatus("live");
    } catch (reason) {
      stopMedia();
      setVisionState("idle");
      const message =
        reason instanceof Error ? reason.message : "Camera permission failed.";
      setError(message);
      setStatus("error");
    }
  }, [createAudio, stopMedia]);

  const visionLabel =
    visionState === "ready"
      ? "POSE ONLINE"
      : visionState === "fallback"
        ? "MOTION MODE"
        : "VISION WAKING";

  return (
    <main className={styles.shell}>
      <video
        ref={videoRef}
        className={`${styles.camera} ${status === "live" ? styles.cameraLive : ""}`}
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />
      <canvas ref={analysisCanvasRef} className={styles.analysisCanvas} />

      <div className={styles.atmosphere} aria-hidden="true" />

      <div className={styles.world}>
        <MotionWorld signalRef={signalRef} />
      </div>

      {status !== "live" ? (
        <section className={styles.gate}>
          <div className={styles.kicker}>BODY://01 · VISION://01</div>
          <h1>FALLEN LIGHT</h1>
          <p className={styles.thesis}>
            Move and it remembers. Open, rise, tilt, approach — the material
            reads the posture, not only the motion.
          </p>

          <button
            type="button"
            className={styles.enter}
            onClick={enter}
            disabled={status === "requesting"}
          >
            {status === "requesting" ? "OPENING CAMERA…" : "ALLOW CAMERA / ENTER"}
          </button>

          <p className={styles.privacy}>
            Camera frames are processed locally for motion and pose. This
            experiment does not upload or record the camera stream.
          </p>

          {status === "error" ? (
            <p className={styles.error}>{error}</p>
          ) : null}
        </section>
      ) : (
        <div className={styles.liveMark} aria-hidden="true">
          <span>FALLEN LIGHT</span>
          <span>{visionLabel}</span>
        </div>
      )}
    </main>
  );
}
