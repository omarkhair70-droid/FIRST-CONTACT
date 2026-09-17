"use client";

import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { SensoryScene } from "@/components/lab/SensoryLabWorld";

type Props = {
  scene: SensoryScene;
  engaged: boolean;
  named: boolean;
};

const chalk = "#eee7db";
const porcelain = "#f8f2e9";
const graphite = "#3b3735";
const rose = "#c98f89";
const clay = "#b96f56";
const coral = "#d67b62";
const amber = "#d9a45d";
const wine = "#672f39";

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function Block({ position, scale, rotation = [0, 0, 0], color = chalk }: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox position={position} scale={scale} rotation={rotation} radius={0.08} smoothness={4}>
      <meshStandardMaterial color={color} roughness={0.92} metalness={0.01} />
    </RoundedBox>
  );
}

function Node({ x, alive = false }: { x: number; alive?: boolean }) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!core.current || !halo.current) return;
    const p = 1 + Math.sin(clock.elapsedTime * (alive ? 2.15 : 1.1) + x) * (alive ? 0.09 : 0.025);
    core.current.scale.setScalar(p);
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.82 + x) * 0.13);
  });
  return (
    <group position={[x, 0.25, 0]}>
      <mesh ref={halo}>
        <sphereGeometry args={[0.28, 36, 36]} />
        <meshBasicMaterial color={alive ? coral : rose} transparent opacity={alive ? 0.13 : 0.04} depthWrite={false} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshStandardMaterial color={alive ? wine : graphite} emissive={alive ? coral : "#000"} emissiveIntensity={alive ? 0.18 : 0.01} roughness={0.55} />
      </mesh>
    </group>
  );
}

function ObjectArtifact() {
  return (
    <Float speed={0.82} rotationIntensity={0.06} floatIntensity={0.14}>
      <group position={[0, 0.3, 0]} rotation={[0.1, -0.28, 0]}>
        <RoundedBox args={[2.02, 1.25, 0.12]} radius={0.14} smoothness={5}>
          <meshStandardMaterial color={porcelain} roughness={0.78} />
        </RoundedBox>
        <mesh position={[-0.56, 0.2, 0.069]}><boxGeometry args={[0.7, 0.035, 0.012]} /><meshBasicMaterial color={graphite} /></mesh>
        <mesh position={[-0.73, 0.06, 0.069]}><boxGeometry args={[0.34, 0.02, 0.012]} /><meshBasicMaterial color="#817873" /></mesh>
        <mesh position={[0.69, -0.38, 0.071]} rotation={[0, 0, Math.PI / 4]}><ringGeometry args={[0.07, 0.1, 36]} /><meshBasicMaterial color={clay} side={THREE.DoubleSide} /></mesh>
      </group>
    </Float>
  );
}

function GapWorld() {
  return (
    <group>
      <Block position={[-1.43, -0.18, 0]} scale={[1.62, 1.14, 0.8]} rotation={[0, 0.08, 0]} color="#e0d8cc" />
      <Block position={[1.43, -0.18, 0]} scale={[1.62, 1.14, 0.8]} rotation={[0, -0.08, 0]} />
      <Node x={-1.16} />
      <Node x={1.16} />
    </group>
  );
}

function AngleWorld({ engaged }: { engaged: boolean }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!a.current || !b.current) return;
    const targetA = engaged ? -0.18 : -0.78;
    const targetB = engaged ? 0.18 : 0.86;
    a.current.rotation.z = damp(a.current.rotation.z, targetA, 3.1, delta);
    b.current.rotation.z = damp(b.current.rotation.z, targetB, 3.1, delta);
    a.current.position.x = damp(a.current.position.x, engaged ? -0.28 : -0.72, 3.1, delta);
    b.current.position.x = damp(b.current.position.x, engaged ? 0.28 : 0.78, 3.1, delta);
    const breathe = Math.sin(clock.elapsedTime * 0.62) * 0.022;
    a.current.position.y = breathe;
    b.current.position.y = -breathe;
  });
  return (
    <group position={[0, 0.25, 0]}>
      <group ref={a}>
        <Block position={[0, 0, 0]} scale={[0.86, 0.19, 0.38]} color={engaged ? "#e5c8bf" : "#b7aea5"} />
        <Block position={[-0.34, 0.25, 0]} scale={[0.18, 0.7, 0.38]} color={engaged ? rose : "#9d958d"} />
      </group>
      <group ref={b}>
        <Block position={[0, 0, 0]} scale={[0.86, 0.19, 0.38]} color={engaged ? "#f1ddd5" : "#d4cdc4"} />
        <Block position={[0.34, -0.25, 0]} scale={[0.18, 0.7, 0.38]} color={engaged ? porcelain : chalk} />
      </group>
      <mesh position={[0, -0.6, 0.02]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.34, 0.345, 64]} /><meshBasicMaterial color={engaged ? coral : graphite} transparent opacity={engaged ? 0.68 : 0.11} /></mesh>
    </group>
  );
}

function SignalWorld({ engaged }: { engaged: boolean }) {
  const packet0 = useRef<THREE.Mesh>(null);
  const packet1 = useRef<THREE.Mesh>(null);
  const packet2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    [packet0, packet1, packet2].forEach((ref, index) => {
      if (!ref.current) return;
      const raw = (clock.elapsedTime * 0.24 + index * 0.31) % 1;
      const travel = engaged ? raw : Math.min(raw, 0.58);
      ref.current.position.x = THREE.MathUtils.lerp(-1.02, 1.02, travel);
      ref.current.position.y = 0.25 + Math.sin(raw * Math.PI) * 0.17;
      const material = ref.current.material as THREE.MeshBasicMaterial;
      material.opacity = raw < 0.08 ? raw / 0.08 : raw > 0.92 ? (1 - raw) / 0.08 : 0.86;
    });
  });

  return (
    <group>
      <Node x={-1.3} alive />
      <Node x={1.3} alive={engaged} />
      <mesh position={[0, 0.25, -0.02]}><boxGeometry args={[2.25, 0.012, 0.012]} /><meshBasicMaterial color={engaged ? coral : "#9f958e"} transparent opacity={engaged ? 0.25 : 0.1} /></mesh>
      <mesh ref={packet0}><sphereGeometry args={[0.034, 18, 18]} /><meshBasicMaterial color={coral} transparent opacity={0.8} /></mesh>
      <mesh ref={packet1}><sphereGeometry args={[0.041, 18, 18]} /><meshBasicMaterial color={amber} transparent opacity={0.8} /></mesh>
      <mesh ref={packet2}><sphereGeometry args={[0.048, 18, 18]} /><meshBasicMaterial color={coral} transparent opacity={0.8} /></mesh>
    </group>
  );
}

function Membrane({ angle, tilt, color, scale = 1 }: { angle: number; tilt: number; color: string; scale?: number }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.14, 0.12, 0.31, 0.38, 0.08, 0.66);
    s.bezierCurveTo(-0.1, 0.42, -0.16, 0.16, 0, 0);
    return s;
  }, []);
  return (
    <mesh rotation={[tilt, angle, angle * 0.22]} scale={scale}>
      <extrudeGeometry args={[shape, { depth: 0.022, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.008, bevelSegments: 3, curveSegments: 24 }]} />
      <meshPhysicalMaterial color={color} roughness={0.7} transmission={0.05} thickness={0.35} transparent opacity={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Bloom({ engaged, named, folded = false }: { engaged: boolean; named: boolean; folded?: boolean }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const target = folded ? 0.18 : engaged ? (named ? 1.12 : 1) : 0.16;
    const scale = damp(root.current.scale.x, target, 2.7, delta);
    root.current.scale.setScalar(scale);
    root.current.rotation.y += delta * (engaged ? 0.055 : 0.018);
    root.current.position.y = 0.16 + Math.sin(clock.elapsedTime * 0.68) * (engaged ? 0.04 : 0.015);
  });
  return (
    <group ref={root} scale={0.16}>
      <Membrane angle={0} tilt={0.18} color="#f7e8e1" scale={1.05} />
      <Membrane angle={1.18} tilt={0.54} color="#e9beb5" scale={0.91} />
      <Membrane angle={2.38} tilt={-0.42} color="#f1d2ca" scale={0.88} />
      <Membrane angle={3.62} tilt={0.72} color="#d9988c" scale={0.76} />
      {named && <Membrane angle={4.9} tilt={-0.62} color="#faefeb" scale={0.8} />}
      <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.13, 32, 32]} /><meshStandardMaterial color={amber} emissive={coral} emissiveIntensity={engaged ? 0.42 : 0.04} roughness={0.42} /></mesh>
    </group>
  );
}

function ThirdWorld({ engaged, named = false, folded = false }: { engaged: boolean; named?: boolean; folded?: boolean }) {
  return (
    <group>
      <Node x={-1.34} alive={engaged} />
      <Node x={1.34} alive={named} />
      <Bloom engaged={engaged} named={named} folded={folded} />
    </group>
  );
}

function CompletionRing({ progress }: { progress: number }) {
  const total = 72;
  const lit = Math.round(total * progress);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.25) * 0.025;
  });
  return (
    <group ref={group} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.28, 0]}>
      {Array.from({ length: total }).map((_, index) => {
        const angle = (index / total) * Math.PI * 2;
        const live = index < lit;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.084, 0.018, 0.018]} />
            <meshBasicMaterial color={live ? (index > lit - 7 ? amber : coral) : "#c8bfb5"} transparent opacity={live ? 0.92 : 0.15} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.03]}><ringGeometry args={[0.48, 0.49, 64]} /><meshBasicMaterial color={wine} transparent opacity={0.16} /></mesh>
    </group>
  );
}

function Dust({ warm }: { warm: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 110;
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const t = index * 1.6180339887;
      values[index * 3] = Math.sin(t * 2.2) * (2.4 + (index % 6) * 0.2);
      values[index * 3 + 1] = -0.8 + (((index * 43) % 100) / 100) * 4;
      values[index * 3 + 2] = -2.2 + Math.cos(t * 1.6) * (2 + (index % 5) * 0.14);
    }
    return values;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * (warm ? 0.022 : 0.01);
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.16) * 0.05;
  });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial size={warm ? 0.027 : 0.019} color={warm ? rose : "#8b8178"} transparent opacity={warm ? 0.28 : 0.16} sizeAttenuation /></points>;
}

export function RecipientWorld({ scene, engaged, named }: Props) {
  const root = useRef<THREE.Group>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const narrow = viewportWidth < 3.5;
  const warm = ["third", "reveal", "name", "choice", "ninetyone", "ninetysix"].includes(scene);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!root.current) return;
    const close = ["third", "reveal", "name", "choice", "ninetyone", "ninetysix"].includes(scene);
    cameraTarget.set(0, close ? 0.9 : 1.08, narrow ? (close ? 6.2 : 6.75) : (close ? 4.65 : 5.4));
    lookTarget.set(0, 0.22, 0);
    const camera = state.camera;
    camera.position.x = damp(camera.position.x, cameraTarget.x, 2.7, delta);
    camera.position.y = damp(camera.position.y, cameraTarget.y, 2.7, delta);
    camera.position.z = damp(camera.position.z, cameraTarget.z, 2.7, delta);
    camera.lookAt(lookTarget);
    root.current.rotation.y = damp(root.current.rotation.y, state.pointer.x * (narrow ? 0.022 : 0.055), 3.4, delta);
    root.current.rotation.x = damp(root.current.rotation.x, -state.pointer.y * (narrow ? 0.012 : 0.028), 3.4, delta);
  });

  return (
    <group ref={root} scale={narrow ? 0.63 : 1} position={[0, narrow ? 0.2 : -0.06, 0]}>
      <Dust warm={warm} />
      {scene === "object" && <ObjectArtifact />}
      {scene === "gap" && <GapWorld />}
      {scene === "angle" && <AngleWorld engaged={engaged} />}
      {scene === "signal" && <SignalWorld engaged={engaged} />}
      {scene === "third" && <ThirdWorld engaged={engaged} />}
      {scene === "reveal" && <ThirdWorld engaged named={false} />}
      {scene === "name" && <ThirdWorld engaged named={named} />}
      {scene === "choice" && <ThirdWorld engaged named={named} />}
      {scene === "ninetyone" && <CompletionRing progress={0.91} />}
      {scene === "ninetysix" && <CompletionRing progress={0.96} />}
      {scene === "unchanged" && <ThirdWorld engaged={false} named={false} folded />}
      <mesh position={[0, -1.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 14]} /><meshStandardMaterial color={warm ? "#efe0d7" : "#e8e2d8"} roughness={1} /></mesh>
      <ContactShadows position={[0, -1, 0]} opacity={warm ? 0.29 : 0.21} scale={8} blur={3.8} far={4} />
    </group>
  );
}
