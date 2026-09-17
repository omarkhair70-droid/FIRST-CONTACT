"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { IntroStage, SpaceId } from "@/lib/encounter";

type WorldProps = {
  stage: IntroStage;
  exploring: boolean;
  postReveal: boolean;
  bridgeProgress: number;
  activeSpace: SpaceId | null;
  visited: SpaceId[];
  onInspectO: () => void;
  onSelectSpace: (space: SpaceId) => void;
};

const bone = "#ddd6c8";
const boneLight = "#f3eee4";
const ink = "#171713";
const graphite = "#625f58";
const signal = "#c56740";
const signalSoft = "#db9c7d";

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function MaterialBlock({ position, scale, rotation = [0, 0, 0], color = bone }: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox position={position} scale={scale} rotation={rotation} radius={0.06} smoothness={3}>
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.01} />
    </RoundedBox>
  );
}

function Dust() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 90;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const t = i * 1.61803398875;
      values[i * 3] = Math.sin(t * 2.1) * (2.8 + (i % 7) * 0.18);
      values[i * 3 + 1] = -0.2 + (((i * 37) % 100) / 100) * 3.8;
      values[i * 3 + 2] = -2.2 + Math.cos(t * 1.7) * (2.3 + (i % 5) * 0.16);
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.018;
    points.current.position.y = Math.sin(clock.elapsedTime * 0.18) * 0.06;
  });

  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.022} color="#7c766b" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function Artifact({ visible }: { visible: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = damp(group.current.rotation.y, -0.22 + Math.sin(clock.elapsedTime * 0.32) * 0.08, 2.5, delta);
    group.current.rotation.x = damp(group.current.rotation.x, 0.12 + Math.cos(clock.elapsedTime * 0.26) * 0.04, 2.5, delta);
    const target = visible ? 1 : 0.001;
    const s = damp(group.current.scale.x, target, 4, delta);
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={[0, 0.34, 0]}>
      <RoundedBox args={[2.15, 1.34, 0.11]} radius={0.11} smoothness={5}>
        <meshStandardMaterial color={boneLight} roughness={0.78} metalness={0.02} />
      </RoundedBox>
      <mesh position={[-0.55, 0.22, 0.067]}><boxGeometry args={[0.72, 0.04, 0.015]} /><meshBasicMaterial color={ink} /></mesh>
      <mesh position={[-0.72, 0.07, 0.067]}><boxGeometry args={[0.38, 0.025, 0.015]} /><meshBasicMaterial color={graphite} /></mesh>
      <mesh position={[0.72, -0.39, 0.067]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.08, 0.105, 28]} /><meshBasicMaterial color={signal} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Structure({ side }: { side: -1 | 1 }) {
  const x = side * 1.52;
  const mirror = side;
  return (
    <group position={[x, -0.15, 0]}>
      <MaterialBlock position={[0, -0.58, 0]} scale={[1.78, 0.22, 1.5]} />
      <MaterialBlock position={[0.24 * mirror, 0.02, 0.12]} scale={[1.02, 0.96, 0.96]} />
      <MaterialBlock position={[-0.44 * mirror, 0.35, -0.2]} scale={[0.52, 1.46, 0.58]} />
      <MaterialBlock position={[0.2 * mirror, 0.9, -0.22]} scale={[0.9, 0.13, 0.76]} rotation={[0, 0, 0.05 * mirror]} />
      <MaterialBlock position={[0.46 * mirror, 0.17, 0.52]} scale={[0.38, 0.15, 0.76]} rotation={[0, 0.18 * mirror, 0]} />
      <MaterialBlock position={[-0.04, 0.42, 0.62]} scale={[0.14, 0.88, 0.17]} color={side === -1 ? "#d2cabd" : bone} />
      <mesh position={[0.02 * mirror, -0.44, 0.79]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.23, 42]} /><meshBasicMaterial color="#aaa398" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function Node({ position, label, visible, interactive, onClick }: {
  position: [number, number, number];
  label: "O" | "?";
  visible: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!core.current || !halo.current) return;
    core.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.1) * 0.1);
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.3) * 0.15);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactive) onClick?.();
  };

  return (
    <group position={position} visible={visible}>
      {interactive && (
        <mesh onClick={handleClick} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "default")}>
          <sphereGeometry args={[0.32, 18, 18]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <mesh ref={halo}><sphereGeometry args={[0.17, 32, 32]} /><meshBasicMaterial color={label === "O" ? signalSoft : graphite} transparent opacity={label === "O" ? 0.1 : 0.05} depthWrite={false} /></mesh>
      <mesh ref={core}><sphereGeometry args={[0.075, 32, 32]} /><meshStandardMaterial color={label === "O" ? ink : graphite} emissive={label === "O" ? signal : "#000"} emissiveIntensity={label === "O" ? 0.16 : 0.03} /></mesh>
    </group>
  );
}

function GhostBridge() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.05, -0.2, 0.12),
    new THREE.Vector3(-0.35, -0.05, 0.28),
    new THREE.Vector3(0.35, -0.05, 0.28),
    new THREE.Vector3(1.05, -0.2, 0.12),
  ]), []);
  return <mesh><tubeGeometry args={[curve, 48, 0.008, 6, false]} /><meshBasicMaterial color={graphite} transparent opacity={0.18} /></mesh>;
}

function Bridge({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.scale.x = damp(group.current.scale.x, Math.max(0.001, progress), 4, delta);
  });
  return (
    <group ref={group} scale={[0.001, 1, 1]}>
      <mesh position={[0, -0.28, 0.08]} scale={[2.42, 0.075, 0.42]}><boxGeometry /><meshStandardMaterial color={signal} roughness={0.68} metalness={0.03} /></mesh>
      <mesh position={[0, -0.22, 0.08]} scale={[1.9, 0.02, 0.24]}><boxGeometry /><meshBasicMaterial color="#f0b499" transparent opacity={0.45} /></mesh>
    </group>
  );
}

function AngleWorld({ active }: { active: boolean }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!left.current || !right.current || !seam.current) return;
    left.current.rotation.z = damp(left.current.rotation.z, active ? 0 : 0.58, 3.2, delta);
    right.current.rotation.z = damp(right.current.rotation.z, active ? 0 : -0.58, 3.2, delta);
    left.current.position.x = damp(left.current.position.x, active ? -0.17 : -0.26, 3.2, delta);
    right.current.position.x = damp(right.current.position.x, active ? 0.17 : 0.26, 3.2, delta);
    const pulse = active ? 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08 : 0.5;
    seam.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <group ref={left} position={[-0.26, 0, 0]} rotation={[0, 0, 0.58]}><MaterialBlock position={[0, 0, 0]} scale={[0.18, 0.68, 0.12]} color={active ? boneLight : bone} /></group>
      <group ref={right} position={[0.26, 0, 0]} rotation={[0, 0, -0.58]}><MaterialBlock position={[0, 0, 0]} scale={[0.18, 0.68, 0.12]} color={active ? boneLight : bone} /></group>
      <mesh ref={seam} position={[0, 0, 0.08]}><sphereGeometry args={[0.045, 20, 20]} /><meshBasicMaterial color={signal} transparent opacity={active ? 0.95 : 0.08} /></mesh>
    </group>
  );
}

function SignalWorld({ active }: { active: boolean }) {
  const packet0 = useRef<THREE.Mesh>(null);
  const packet1 = useRef<THREE.Mesh>(null);
  const packet2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    [packet0, packet1, packet2].forEach((packet, index) => {
      if (!packet.current) return;
      const phase = (clock.elapsedTime * 0.42 + index / 3) % 1;
      const travel = active ? phase : Math.min(phase, 0.43);
      packet.current.position.x = -0.34 + travel * 0.68;
      packet.current.scale.setScalar(0.7 + Math.sin(phase * Math.PI) * 0.45);
    });
  });

  return (
    <group>
      <mesh position={[-0.38, 0, 0]}><sphereGeometry args={[0.09, 24, 24]} /><meshStandardMaterial color={ink} emissive={signal} emissiveIntensity={0.16} /></mesh>
      <mesh position={[0.38, 0, 0]}><sphereGeometry args={[0.09, 24, 24]} /><meshStandardMaterial color={graphite} emissive={active ? signal : "#000"} emissiveIntensity={active ? 0.16 : 0} /></mesh>
      <mesh scale={[0.72, 0.014, 0.014]}><boxGeometry /><meshBasicMaterial color={graphite} transparent opacity={0.18} /></mesh>
      <mesh ref={packet0}><sphereGeometry args={[0.026, 14, 14]} /><meshBasicMaterial color={active ? signal : graphite} transparent opacity={active ? 0.9 : 0.42} /></mesh>
      <mesh ref={packet1}><sphereGeometry args={[0.026, 14, 14]} /><meshBasicMaterial color={active ? signal : graphite} transparent opacity={active ? 0.9 : 0.42} /></mesh>
      <mesh ref={packet2}><sphereGeometry args={[0.026, 14, 14]} /><meshBasicMaterial color={active ? signal : graphite} transparent opacity={active ? 0.9 : 0.42} /></mesh>
      <mesh position={[-0.38, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.012, 10, 48]} /><meshBasicMaterial color={signal} transparent opacity={0.3} /></mesh>
    </group>
  );
}

function ThirdThingWorld({ active }: { active: boolean }) {
  const shared = useRef<THREE.Mesh>(null);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!shared.current || !left.current || !right.current) return;
    const target = active ? 1 : 0.12;
    const s = damp(shared.current.scale.x, target, 3.6, delta);
    shared.current.scale.setScalar(s);
    shared.current.rotation.x += delta * 0.2;
    shared.current.rotation.y += delta * 0.28;
    left.current.position.x = damp(left.current.position.x, active ? -0.42 : -0.24, 3.2, delta);
    right.current.position.x = damp(right.current.position.x, active ? 0.42 : 0.24, 3.2, delta);
    shared.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.045;
  });

  return (
    <group>
      <mesh ref={left} position={[-0.24, 0, 0]}><sphereGeometry args={[0.1, 24, 24]} /><meshStandardMaterial color={ink} /></mesh>
      <mesh ref={right} position={[0.24, 0, 0]}><sphereGeometry args={[0.1, 24, 24]} /><meshStandardMaterial color={graphite} /></mesh>
      <mesh ref={shared} scale={0.12}>
        <torusKnotGeometry args={[0.18, 0.055, 90, 14, 2, 3]} />
        <meshStandardMaterial color={boneLight} roughness={0.48} metalness={0.02} emissive={signal} emissiveIntensity={active ? 0.13 : 0} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.256) * 0.3, Math.sin(i * 1.256) * 0.3, -0.04]} rotation={[0, 0, i * 1.256]} scale={active ? [0.12, 0.04, 0.03] : [0.02, 0.01, 0.01]}>
          <sphereGeometry args={[1, 18, 10]} /><meshBasicMaterial color={signalSoft} transparent opacity={active ? 0.28 : 0.04} />
        </mesh>
      ))}
    </group>
  );
}

function RemainderWorld({ active }: { active: boolean }) {
  const ring = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    ring.current.rotation.z = active ? -0.15 + Math.sin(clock.elapsedTime * 0.28) * 0.04 : -0.15;
  });

  const arc = Math.PI * 2 * 0.91;
  return (
    <group ref={ring} rotation={[Math.PI / 2, 0, -0.15]}>
      <mesh><ringGeometry args={[0.27, 0.305, 80, 1, 0, arc]} /><meshBasicMaterial color={active ? signal : ink} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[0, 0, arc]}><ringGeometry args={[0.27, 0.305, 20, 1, 0, Math.PI * 2 * 0.09]} /><meshBasicMaterial color={graphite} transparent opacity={active ? 0.12 : 0.36} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0.35, 0, 0]}><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color={signalSoft} transparent opacity={active ? 0.8 : 0.16} /></mesh>
    </group>
  );
}

const SPACE_POSITIONS: Record<SpaceId, [number, number, number]> = {
  build: [-1.62, 0.62, 0.38],
  sound: [-0.55, 1.16, -0.25],
  object: [0.62, 0.9, 0.34],
  door: [1.68, 0.58, -0.22],
};

function SpacePortal({ id, active, visited, onSelect }: { id: SpaceId; active: boolean; visited: boolean; onSelect: (space: SpaceId) => void }) {
  const root = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!root.current) return;
    const target = active ? 1.45 : visited ? 1.04 : 0.92;
    const s = damp(root.current.scale.x, target, 3.6, delta);
    root.current.scale.setScalar(s);
  });

  return (
    <group ref={root} position={SPACE_POSITIONS[id]}>
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(id); }} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "default")}>
        <sphereGeometry args={[0.46, 16, 16]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {id === "build" && <AngleWorld active={active} />}
      {id === "sound" && <SignalWorld active={active} />}
      {id === "object" && <ThirdThingWorld active={active} />}
      {id === "door" && <RemainderWorld active={active} />}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.175, 36]} /><meshBasicMaterial color={active ? signal : graphite} transparent opacity={active ? 0.8 : visited ? 0.35 : 0.16} />
      </mesh>
      {active && <pointLight color={signalSoft} intensity={0.8} distance={1.8} decay={2} position={[0, 0.1, 0.45]} />}
    </group>
  );
}

function ExplorationWorld({ activeSpace, visited, onSelectSpace }: { activeSpace: SpaceId | null; visited: SpaceId[]; onSelectSpace: (space: SpaceId) => void }) {
  return (
    <group>
      {(Object.keys(SPACE_POSITIONS) as SpaceId[]).map((id) => <SpacePortal key={id} id={id} active={activeSpace === id} visited={visited.includes(id)} onSelect={onSelectSpace} />)}
      <GhostBridge />
    </group>
  );
}

export function World({ stage, exploring, postReveal, bridgeProgress, activeSpace, visited, onInspectO, onSelectSpace }: WorldProps) {
  const root = useRef<THREE.Group>(null);
  const architecture = useRef<THREE.Group>(null);
  const viewportWidth = useThree((state) => state.viewport.width);
  const isNarrow = viewportWidth < 3.5;
  const fitScale = isNarrow ? Math.max(0.44, Math.min(0.62, viewportWidth / 4.8)) : 1;
  const buildingsVisible = postReveal || ["world", "metrics", "problem", "inspect"].includes(stage);
  const nodesVisible = postReveal || ["metrics", "problem", "inspect"].includes(stage);
  const artifactVisible = stage === "object" || stage === "context";
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!root.current) return;
    if (artifactVisible) {
      cameraTarget.set(0, 0.72, isNarrow ? 5.6 : 4.65);
      lookTarget.set(0, 0.24, 0);
    } else if (exploring) {
      const focus = activeSpace ? SPACE_POSITIONS[activeSpace] : [0, 0.66, 0] as [number, number, number];
      cameraTarget.set(focus[0] * 0.28, 1 + focus[1] * 0.12, isNarrow ? 7.2 : activeSpace ? 5.35 : 6.15);
      lookTarget.set(focus[0] * 0.28, focus[1] * 0.42, 0);
    } else if (stage === "inspect") {
      cameraTarget.set(isNarrow ? -0.08 : -0.62, 1.25, isNarrow ? 7 : 5.5);
      lookTarget.set(-0.55, 0.48, 0);
    } else if (stage === "problem") {
      cameraTarget.set(0, 1.02, isNarrow ? 7.4 : 6);
      lookTarget.set(0, -0.02, 0.18);
    } else {
      cameraTarget.set(0, 1.15, isNarrow ? 7.6 : 6.35);
      lookTarget.set(0, 0.18, 0);
    }

    const camera = state.camera;
    camera.position.x = damp(camera.position.x, cameraTarget.x, 2.5, delta);
    camera.position.y = damp(camera.position.y, cameraTarget.y, 2.5, delta);
    camera.position.z = damp(camera.position.z, cameraTarget.z, 2.5, delta);
    camera.lookAt(lookTarget);

    root.current.rotation.y = damp(root.current.rotation.y, state.pointer.x * (isNarrow ? 0.035 : 0.075), 3.6, delta);
    root.current.rotation.x = damp(root.current.rotation.x, -state.pointer.y * (isNarrow ? 0.018 : 0.04), 3.6, delta);

    if (architecture.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.42) * 0.006;
      architecture.current.scale.setScalar(breathe);
    }
  });

  return (
    <group ref={root} position={[0, isNarrow ? 0.22 : -0.12, 0]} scale={fitScale}>
      <fog attach="fog" args={["#e8e1d5", 6.2, 12.5]} />
      <Dust />
      <Artifact visible={artifactVisible} />

      {buildingsVisible && !exploring && (
        <group ref={architecture}>
          <Structure side={-1} /><Structure side={1} /><GhostBridge /><Bridge progress={bridgeProgress} />
          <Node position={[-1.23, 1.15, 0.23]} label="O" visible={nodesVisible} interactive={!postReveal && stage === "inspect"} onClick={onInspectO} />
          <Node position={[1.32, 1, 0.09]} label="?" visible={nodesVisible} />
        </group>
      )}

      {exploring && <ExplorationWorld activeSpace={activeSpace} visited={visited} onSelectSpace={onSelectSpace} />}

      <mesh position={[0, -0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[14, 14]} /><meshStandardMaterial color="#e8e1d6" roughness={1} metalness={0} /></mesh>
      <ContactShadows position={[0, -0.93, 0]} opacity={0.24} scale={7.5} blur={3.2} far={4} />
    </group>
  );
}
