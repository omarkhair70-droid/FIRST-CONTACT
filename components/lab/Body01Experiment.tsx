"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./Body01Experiment.module.css";

type MotionSignal = {
  energy: number;
  x: number;
  y: number;
};

type AudioRig = {
  context: AudioContext;
  oscillators: OscillatorNode[];
  master: GainNode;
  panner: StereoPannerNode;
};

const neutralSignal: MotionSignal = { energy: 0, x: 0, y: 0 };

const vertexShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform vec2 uPoint;

  varying vec3 vNormalView;
  varying float vDisplace;
  varying float vEnergy;

  void main() {
    vec3 p = position;
    float directional =
      sin((p.y + uPoint.y * 0.65) * 4.0 + uTime * 1.15) *
      cos((p.x - uPoint.x * 0.65) * 3.2 - uTime * 0.82);

    float breathing = sin(uTime * 0.72 + p.y * 2.4) * 0.5 + 0.5;
    float localPull = exp(-3.2 * distance(p.xy, uPoint * 0.78));
    float displacement =
      directional * (0.045 + uEnergy * 0.24) +
      breathing * 0.025 +
      localPull * uEnergy * 0.15;

    p += normal * displacement;

    vDisplace = displacement;
    vEnergy = uEnergy;
    vNormalView = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform vec2 uPoint;

  varying vec3 vNormalView;
  varying float vDisplace;
  varying float vEnergy;

  void main() {
    vec3 chalk = vec3(0.90, 0.86, 0.79);
    vec3 clay = vec3(0.67, 0.29, 0.22);
    vec3 ember = vec3(0.96, 0.47, 0.26);
    vec3 wine = vec3(0.22, 0.07, 0.09);

    float edge = pow(1.0 - abs(vNormalView.z), 2.2);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.5 + vDisplace * 19.0);
    float heat = clamp(vEnergy * 0.92 + max(vDisplace, 0.0) * 2.2, 0.0, 1.0);

    vec3 base = mix(chalk, clay, heat * 0.66);
    base = mix(base, ember, heat * pulse * 0.58);
    base = mix(base, wine, edge * (0.24 + vEnergy * 0.24));

    float glow = 0.88 + edge * 0.22 + heat * 0.16;
    gl_FragColor = vec4(base * glow, 1.0);
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

    if (material) {
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uEnergy.value = THREE.MathUtils.lerp(
        material.uniforms.uEnergy.value,
        signal.energy,
        Math.min(1, delta * 7),
      );

      targetPointRef.current.set(signal.x, signal.y);
      material.uniforms.uPoint.value.lerp(
        targetPointRef.current,
        Math.min(1, delta * 5),
      );
    }

    if (mesh) {
      mesh.rotation.y = THREE.MathUtils.lerp(
        mesh.rotation.y,
        signal.x * 0.58,
        Math.min(1, delta * 3.4),
      );
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        -signal.y * 0.36,
        Math.min(1, delta * 3.4),
      );

      const scale = 1 + signal.energy * 0.11;
      targetScaleRef.current.set(scale, scale, scale);
      mesh.scale.lerp(targetScaleRef.current, Math.min(1, delta * 4.4));
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastAnalyzeRef = useRef(0);
  const previousLumaRef = useRef<Uint8Array | null>(null);
  const signalRef = useRef<MotionSignal>({ ...neutralSignal });
  const audioRef = useRef<AudioRig | null>(null);

  const stopMedia = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

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
    const low = context.createOscillator();
    const overtone = context.createOscillator();
    const lowGain = context.createGain();
    const overtoneGain = context.createGain();

    low.type = "sine";
    low.frequency.value = 86;
    overtone.type = "triangle";
    overtone.frequency.value = 172;

    lowGain.gain.value = 0.72;
    overtoneGain.gain.value = 0.18;
    master.gain.value = 0.004;

    low.connect(lowGain).connect(master);
    overtone.connect(overtoneGain).connect(master);
    master.connect(panner).connect(context.destination);

    low.start();
    overtone.start();
    void context.resume();

    audioRef.current = {
      context,
      oscillators: [low, overtone],
      master,
      panner,
    };
  }, []);

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

      signalRef.current.energy = THREE.MathUtils.lerp(
        signalRef.current.energy,
        targetEnergy,
        targetEnergy > signalRef.current.energy ? 0.28 : 0.1,
      );
      signalRef.current.x = THREE.MathUtils.lerp(
        signalRef.current.x,
        targetX,
        0.16,
      );
      signalRef.current.y = THREE.MathUtils.lerp(
        signalRef.current.y,
        targetY,
        0.16,
      );

      const audio = audioRef.current;
      if (audio) {
        const now = audio.context.currentTime;
        audio.master.gain.setTargetAtTime(
          0.004 + signalRef.current.energy * 0.038,
          now,
          0.08,
        );
        audio.panner.pan.setTargetAtTime(
          THREE.MathUtils.clamp(signalRef.current.x * 0.82, -1, 1),
          now,
          0.06,
        );

        const base =
          82 + signalRef.current.energy * 24 + signalRef.current.y * 7;
        audio.oscillators[0].frequency.setTargetAtTime(base, now, 0.09);
        audio.oscillators[1].frequency.setTargetAtTime(base * 2.01, now, 0.09);
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
      signalRef.current = { ...neutralSignal };
      setStatus("live");
    } catch (reason) {
      stopMedia();
      const message =
        reason instanceof Error ? reason.message : "Camera permission failed.";
      setError(message);
      setStatus("error");
    }
  }, [createAudio, stopMedia]);

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
          <div className={styles.kicker}>BODY://01</div>
          <h1>NO BUTTONS</h1>
          <p className={styles.thesis}>
            After entry, move. The world should understand the rest.
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
            This slice analyzes low-resolution motion locally in your browser.
            It does not upload or record the camera stream.
          </p>

          {status === "error" ? (
            <p className={styles.error}>{error}</p>
          ) : null}
        </section>
      ) : (
        <div className={styles.liveMark} aria-hidden="true">
          <span>BODY://01</span>
          <span>MOVE</span>
        </div>
      )}
    </main>
  );
}
