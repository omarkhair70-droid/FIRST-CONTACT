"use client";

import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type SensoryScene =
  | "object"
  | "gap"
  | "angle"
  | "signal"
  | "third"
  | "reveal"
  | "name"
  | "choice"
  | "ninetyone"
  | "ninetysix"
  | "unchanged";

type Props = {
  scene: SensoryScene;
  onAdvance?: () => void;
};

const chalk = "#eee7db";
const porcelain = "#f8f2e9";
const graphite = "#3b3735";
const dustyRose = "#c98f89";
const clay = "#b96f56";
const coral = "#d67b62";
const amber = "#d9a45d";
const burgundy = "#672f39";

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function useSceneWarmth(scene: SensoryScene) {
  if (["third", "reveal", "name", "choice"].includes(scene)) return 0.62;
  if (["ninetyone", "ninetysix"].includes(scene)) return 1;
  if (scene === "unchanged") return 0.22;
  if (scene === "signal") return 0.34;
  if (scene === "angle") return 0.24;
  return 0.08;
}

function MaterialBlock({ position, scale, rotation = [0, 0, 0], color = chalk }: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox position={position} scale={scale} rotation={rotation} radius={0.08} smoothness={4}>
      <meshStandardMaterial color={color} roughness={0.94} metalness={0.01} />
    </RoundedBox>
  );
}

function Node({ x, active = false, warm = false }: { x: number; active?: boolean; warm?: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!core.current || !halo.current) return;
    const p = 1 + Math.sin(clock.elapsedTime * (active ? 2.1 : 1.2) + x) * (active ? 0.09 : 0.035);
    core.current.scale.setScalar(p);
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.9 + x) * 0.12);
  });
  return (
    <group position={[x, 0.26, 0]}>
      <mesh ref={halo}>
        <sphereGeometry args={[0.28, 40, 40]} />
        <meshBasicMaterial color={warm ? coral : dustyRose} transparent opacity={active ? 0.13 : 0.045} depthWrite={false} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.095, 40, 40]} />
        <meshStandardMaterial color={warm ? burgundy : graphite} emissive={warm ? coral : "#000000"} emissiveIntensity={active ? 0.18 : 0.02} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ObjectArtifact() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = damp(ref.current.rotation.y, -0.3 + Math.sin(clock.elapsedTime * 0.28) * 0.16, 2.2, delta);
    ref.current.rotation.x = damp(ref.current.rotation.x, 0.1 + Math.cos(clock.elapsedTime * 0.24) * 0.05, 2.2, delta);
  });
  return (
    <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.16}>
      <group ref={ref} position={[0, 0.32, 0]}>
        <RoundedBox args={[2.05, 1.28, 0.12]} radius={0.14} smoothness={5}>
          <meshStandardMaterial color={porcelain} roughness={0.76} />
        </RoundedBox>
        <mesh position={[-0.55, 0.22, 0.07]}>
          <boxGeometry args={[0.7, 0.035, 0.012]} />
          <meshBasicMaterial color={graphite} />
        </mesh>
        <mesh position={[-0.73, 0.08, 0.07]}>
          <boxGeometry args={[0.34, 0.02, 0.012]} />
          <meshBasicMaterial color="#817873" />
        </mesh>
        <mesh position={[0.69, -0.38, 0.071]} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.07, 0.1, 36]} />
          <meshBasicMaterial color={clay} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

function GapWorld({ warm = false }: { warm?: boolean }) {
  return (
    <group>
      <MaterialBlock position={[-1.45, -0.18, 0]} scale={[1.65, 1.18, 0.82]} rotation={[0, 0.08, 0]} color="#e1d9cc" />
      <MaterialBlock position={[1.45, -0.18, 0]} scale={[1.65, 1.18, 0.82]} rotation={[0, -0.08, 0]} color={chalk} />
      <Node x={-1.18} active warm={warm} />
      <Node x={1.18} active={false} warm={warm} />
    </group>
  );
}

function AngleWorld({ active }: { active: boolean }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!a.current || !b.current) return;
    const t = active ? 1 : 0;
    a.current.rotation.z = damp(a.current.rotation.z, THREE.MathUtils.lerp(-0.72, -0.18, t), 3.2, delta);
    b.current.rotation.z = damp(b.current.rotation.z, THREE.MathUtils.lerp(0.82, 0.18, t), 3.2, delta);
    a.current.position.x = damp(a.current.position.x, THREE.MathUtils.lerp(-0.7, -0.29, t), 3.2, delta);
    b.current.position.x = damp(b.current.position.x, THREE.MathUtils.lerp(0.78, 0.29, t), 3.2, delta);
    const breathe = Math.sin(clock.elapsedTime * 0.65) * 0.025;
    a.current.position.y = breathe;
    b.current.position.y = -breathe;
  });
  return (
    <group position={[0, 0.24, 0]}>
      <group ref={a}>
        <MaterialBlock position={[0, 0, 0]} scale={[0.85, 0.2, 0.38]} color={active ? "#e5c8bf" : "#bdb4aa"} />
        <MaterialBlock position={[-0.34, 0.25, 0]} scale={[0.18, 0.7, 0.38]} color={active ? dustyRose : "#aaa198"} />
      </group>
      <group ref={b}>
        <MaterialBlock position={[0, 0, 0]} scale={[0.85, 0.2, 0.38]} color={active ? "#f1ddd5" : "#d6cfc5"} />
        <MaterialBlock position={[0.34, -0.25, 0]} scale={[0.18, 0.7, 0.38]} color={active ? porcelain : chalk} />
      </group>
      <mesh position={[0, -0.58, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.345, 64]} />
        <meshBasicMaterial color={active ? coral : graphite} transparent opacity={active ? 0.65 : 0.13} />
      </mesh>
    </group>
  );
}

function SignalWorld({ active }: { active: boolean }) {
  const packets = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  useFrame(({ clock }) => {
    packets.forEach((ref, i) => {
      if (!ref.current) return;
      const raw = (clock.elapsedTime * 0.28 + i * 0.31) % 1;
      const capped = active ? raw : Math.min(raw, 0.62);
      ref.current.position.x = THREE.MathUtils.lerp(-1.0, 1.0, capped);
      ref.current.position.y = 0.26 + Math.sin(raw * Math.PI) * 0.18;
      (ref.current.material as THREE.MeshBasicMaterial).opacity = raw < 0.08 ? raw / 0.08 : raw > 0.92 ? (1 - raw) / 0.08 : 0.85;
    });
  });
  return (
    <group>
      <Node x={-1.28} active warm={active} />
      <Node x={1.28} active={active} warm={active} />
      <mesh position={[0, 0.26, -0.02]}>
        <boxGeometry args={[2.2, 0.012, 0.012]} />
        <meshBasicMaterial color={active ? coral : "#9f958e"} transparent opacity={active ? 0.24 : 0.12} />
      </mesh>
      {packets.map((ref, i) => (
        <mesh key={i} ref={ref}>
          <sphereGeometry args={[0.035 + i * 0.008, 20, 20]} />
          <meshBasicMaterial color={i === 1 ? amber : coral} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Petal({ position, rotation, scale, color = porcelain }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}) {
  const shape = useMemo(() => {
    const petal = new THREE.Shape();
    petal.moveTo(0, -0.42);
    petal.bezierCurveTo(-0.34, -0.13, -0.34, 0.25, 0, 0.48);
    petal.bezierCurveTo(0.34, 0.25, 0.34, -0.13, 0, -0.42);
    return petal;
  }, []);
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <shapeGeometry args={[shape, 30]} />
      <meshPhysicalMaterial color={color} roughness={0.68} transmission={0.11} thickness={0.3} transparent opacity={0.92} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ThirdThing({ active, named = false }: { active: boolean; named?: boolean }) {
  const bloom = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!bloom.current) return;
    const target = active ? (named ? 1.18 : 1) : 0.12;
    const s = damp(bloom.current.scale.x, target, 2.6, delta);
    bloom.current.scale.setScalar(s);
    bloom.current.rotation.y += delta * 0.08;
    bloom.current.position.y = 0.24 + Math.sin(clock.elapsedTime * 0.72) * 0.045;
  });
  return (
    <group>
      <Node x={-1.32} active warm={active} />
      <Node x={1.32} active={named} warm={active} />
      <group ref={bloom} scale={0.12} rotation={[0.18, 0, 0.08]}>
        <Petal position={[0, 0.34, 0]} rotation={[0.08, 0, 0]} scale={[1.0, 1.25, 1]} color="#f6e9e2" />
        <Petal position={[0.32, 0.08, 0.02]} rotation={[0.18, 0.22, -1.02]} scale={[0.82, 1.05, 1]} color="#e8beb5" />
        <Petal position={[-0.32, 0.08, -0.01]} rotation={[-0.12, -0.24, 1.04]} scale={[0.84, 1.08, 1]} color="#f1d2cb" />
        <Petal position={[0.18, -0.27, 0.04]} rotation={[0.42, 0.18, -2.35]} scale={[0.7, 0.9, 1]} color="#d89b90" />
        <Petal position={[-0.2, -0.25, -0.03]} rotation={[-0.38, -0.14, 2.35]} scale={[0.7, 0.92, 1]} color="#efd5cf" />
        {named && <Petal position={[0, -0.38, 0.06]} rotation={[0.5, 0, Math.PI]} scale={[0.64, 0.84, 1]} color="#fbf2ef" />}
        <mesh>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial color={amber} emissive={coral} emissiveIntensity={active ? 0.42 : 0.02} roughness={0.42} />
        </mesh>
        <pointLight position={[0, 0, 0.3]} intensity={active ? 1.1 : 0.05} color="#ef9d81" distance={2.3} decay={2} />
      </group>
    </group>
  );
}

function CompletionRing({ progress }: { progress: number }) {
  const segmentCount = 72;
  const lit = Math.round(segmentCount * progress);
  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const a = (i / segmentCount) * Math.PI * 2;
        const x = Math.cos(a) * 0.88;
        const y = Math.sin(a) * 0.88;
        const isLit = i < lit;
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.085, 0.018, 0.018]} />
            <meshBasicMaterial color={isLit ? (i > lit - 7 ? amber : coral) : "#c8bfb5"} transparent opacity={isLit ? 0.9 : 0.16} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.03]}>
        <ringGeometry args={[0.48, 0.49, 64]} />
        <meshBasicMaterial color={burgundy} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Dust({ warmth }: { warmth: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 120;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const t = i * 1.6180339887;
      values[i * 3] = Math.sin(t * 2.2) * (2.5 + (i % 6) * 0.2);
      values[i * 3 + 1] = -0.8 + ((i * 43) % 100) / 100 * 4.1;
      values[i * 3 + 2] = -2.2 + Math.cos(t * 1.6) * (2.1 + (i % 5) * 0.14);
    }
    return values;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * (0.01 + warmth * 0.015);
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.16) * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.02 + warmth * 0.01} color={warmth > 0.5 ? dustyRose : "#8b8178"} transparent opacity={0.18 + warmth * 0.12} sizeAttenuation />
    </points>
  );
}

export function SensoryLabWorld({ scene, onAdvance }: Props) {
  const root = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);
  const viewportWidth = useThree((state) => state.viewport.width);
  const narrow = viewportWidth < 3.5;
  const warmth = useSceneWarmth(scene);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!root.current) return;
    const close = ["third", "reveal", "name", "ninetyone", "ninetysix"].includes(scene);
    cameraTarget.set(0, close ? 0.92 : 1.08, narrow ? (close ? 6.25 : 6.8) : (close ? 4.65 : 5.45));
    lookTarget.set(0, 0.24, 0);
    camera.position.x = damp(camera.position.x, cameraTarget.x, 2.7, delta);
    camera.position.y = damp(camera.position.y, cameraTarget.y, 2.7, delta);
    camera.position.z = damp(camera.position.z, cameraTarget.z, 2.7, delta);
    camera.lookAt(lookTarget);
    root.current.rotation.y = damp(root.current.rotation.y, state.pointer.x * (narrow ? 0.025 : 0.065), 3.5, delta);
    root.current.rotation.x = damp(root.current.rotation.x, -state.pointer.y * (narrow ? 0.015 : 0.03), 3.5, delta);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onAdvance?.();
  };

  return (
    <group ref={root} scale={narrow ? 0.63 : 1} position={[0, narrow ? 0.22 : -0.06, 0]} onClick={handleClick}>
      <Dust warmth={warmth} />
      {scene === "object" && <ObjectArtifact />}
      {scene === "gap" && <GapWorld />}
      {scene === "angle" && <AngleWorld active />}
      {scene === "signal" && <SignalWorld active />}
      {scene === "third" && <ThirdThing active />}
      {scene === "reveal" && <ThirdThing active />}
      {scene === "name" && <ThirdThing active named />}
      {scene === "choice" && <ThirdThing active named />}
      {scene === "ninetyone" && <CompletionRing progress={0.91} />}
      {scene === "ninetysix" && <CompletionRing progress={0.96} />}
      {scene === "unchanged" && <ThirdThing active={false} />}

      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={warmth > 0.5 ? "#efe1d8" : "#e8e2d8"} roughness={1} />
      </mesh>
      <ContactShadows position={[0, -0.99, 0]} opacity={0.22 + warmth * 0.08} scale={8} blur={3.8} far={4} />
    </group>
  );
}
