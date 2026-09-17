"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { IntroStage, SpaceId } from "@/lib/encounter";

type WorldProps = {
  stage: IntroStage;
  exploring: boolean;
  activeSpace: SpaceId | null;
  visited: SpaceId[];
  onInspectO: () => void;
  onSelectSpace: (space: SpaceId) => void;
};

const ivory = "#d8d2c5";
const charcoal = "#20201d";
const accent = "#a55436";

function Block({ position, scale, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <RoundedBox position={position} scale={scale} rotation={rotation} radius={0.055} smoothness={3}>
      <meshStandardMaterial color={ivory} roughness={0.87} metalness={0.02} />
    </RoundedBox>
  );
}

function Structure({ side }: { side: -1 | 1 }) {
  const x = side * 1.55;
  const mirror = side;
  return (
    <group position={[x, -0.15, 0]}>
      <Block position={[0, -0.55, 0]} scale={[1.8, 0.26, 1.55]} />
      <Block position={[0.25 * mirror, 0.1, 0.1]} scale={[1.0, 1.0, 1.0]} />
      <Block position={[-0.45 * mirror, 0.38, -0.2]} scale={[0.55, 1.5, 0.62]} />
      <Block position={[0.24 * mirror, 0.94, -0.22]} scale={[0.9, 0.16, 0.78]} rotation={[0, 0, 0.05 * mirror]} />
      <Block position={[0.46 * mirror, 0.18, 0.56]} scale={[0.42, 0.18, 0.8]} rotation={[0, 0.18 * mirror, 0]} />
      <Block position={[-0.04, 0.43, 0.65]} scale={[0.16, 0.9, 0.2]} />
    </group>
  );
}

function Node({ position, label, visible, interactive, onClick }: { position: [number, number, number]; label: "O" | "?"; visible: boolean; interactive?: boolean; onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.07;
    ref.current.scale.setScalar(pulse);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactive) onClick?.();
  };

  return (
    <group position={position} visible={visible}>
      <mesh ref={ref} onClick={handleClick} onPointerOver={() => interactive && (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "default")}>
        <sphereGeometry args={[0.09, 32, 32]} />
        <meshStandardMaterial color={label === "O" ? charcoal : "#6c6a63"} emissive={label === "O" ? charcoal : "#000000"} emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

function SpaceObjects({ activeSpace, visited, onSelectSpace }: { activeSpace: SpaceId | null; visited: SpaceId[]; onSelectSpace: (space: SpaceId) => void }) {
  const spaces = useMemo(
    () => [
      { id: "build" as const, p: [-1.65, 0.85, 0.55] as [number, number, number], shape: "box" },
      { id: "sound" as const, p: [-0.55, 1.35, -0.25] as [number, number, number], shape: "ring" },
      { id: "object" as const, p: [0.62, 1.05, 0.42] as [number, number, number], shape: "ico" },
      { id: "door" as const, p: [1.72, 0.7, -0.28] as [number, number, number], shape: "door" },
    ],
    [],
  );

  return (
    <group>
      {spaces.map(({ id, p, shape }) => {
        const isActive = activeSpace === id;
        const hasVisited = visited.includes(id);
        const color = isActive ? accent : hasVisited ? "#746b5d" : charcoal;
        return (
          <group key={id} position={p} onClick={(e) => { e.stopPropagation(); onSelectSpace(id); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "default")}>
            {shape === "ring" && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.19, 0.045, 16, 64]} /><meshStandardMaterial color={color} roughness={0.45} /></mesh>}
            {shape === "ico" && <mesh><icosahedronGeometry args={[0.22, 1]} /><meshStandardMaterial color={color} roughness={0.72} /></mesh>}
            {shape === "door" && <mesh scale={[0.24, 0.46, 0.08]}><boxGeometry /><meshStandardMaterial color={color} roughness={0.8} /></mesh>}
            {shape === "box" && <mesh rotation={[0.2, 0.45, 0.1]} scale={[0.3, 0.3, 0.3]}><boxGeometry /><meshStandardMaterial color={color} roughness={0.78} /></mesh>}
          </group>
        );
      })}
    </group>
  );
}

export function World({ stage, exploring, activeSpace, visited, onInspectO, onSelectSpace }: WorldProps) {
  const world = useRef<THREE.Group>(null);
  const buildingsVisible = stage === "world" || stage === "metrics" || stage === "problem" || stage === "inspect";
  const nodesVisible = stage === "metrics" || stage === "problem" || stage === "inspect";

  useFrame((state, delta) => {
    if (!world.current) return;
    const targetY = state.pointer.x * 0.12;
    const targetX = -state.pointer.y * 0.055;
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, targetY, 4, delta);
    world.current.rotation.x = THREE.MathUtils.damp(world.current.rotation.x, targetX, 4, delta);
  });

  return (
    <group ref={world} position={[0, -0.15, 0]}>
      {buildingsVisible && !exploring && (
        <group>
          <Structure side={-1} />
          <Structure side={1} />
          <Node position={[-1.25, 1.18, 0.22]} label="O" visible={nodesVisible} interactive={stage === "inspect"} onClick={onInspectO} />
          <Node position={[1.34, 1.02, 0.08]} label="?" visible={nodesVisible} />
        </group>
      )}
      {exploring && <SpaceObjects activeSpace={activeSpace} visited={visited} onSelectSpace={onSelectSpace} />}
      <ContactShadows position={[0, -0.93, 0]} opacity={0.2} scale={7} blur={2.8} far={3.2} />
    </group>
  );
}
