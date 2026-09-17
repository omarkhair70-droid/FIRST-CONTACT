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

function MaterialBlock({
  position,
  scale,
  rotation = [0, 0, 0],
  color = bone,
}: {
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
      values[i * 3 + 1] = -0.2 + ((i * 37) % 100) / 100 * 3.8;
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
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
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
      <mesh position={[-0.55, 0.22, 0.067]}>
        <boxGeometry args={[0.72, 0.04, 0.015]} />
        <meshBasicMaterial color={ink} />
      </mesh>
      <mesh position={[-0.72, 0.07, 0.067]}>
        <boxGeometry args={[0.38, 0.025, 0.015]} />
        <meshBasicMaterial color={graphite} />
      </mesh>
      <mesh position={[0.72, -0.39, 0.067]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.08, 0.105, 28]} />
        <meshBasicMaterial color={signal} side={THREE.DoubleSide} />
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
        <ringGeometry args={[0.22, 0.23, 42]} />
        <meshBasicMaterial color="#aaa398" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function Node({
  position,
  label,
  visible,
  interactive,
  onClick,
}: {
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
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.1;
    core.current.scale.setScalar(pulse);
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
          <sphereGeometry args={[0.32, 18, 18]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <mesh ref={halo}>
        <sphereGeometry args={[0.17, 32, 32]} />
        <meshBasicMaterial color={label === "O" ? signalSoft : graphite} transparent opacity={label === "O" ? 0.1 : 0.05} depthWrite={false} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshStandardMaterial color={label === "O" ? ink : graphite} emissive={label === "O" ? signal : "#000"} emissiveIntensity={label === "O" ? 0.16 : 0.03} />
      </mesh>
    </group>
  );
}

function GhostBridge() {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.05, -0.2, 0.12),
      new THREE.Vector3(-0.35, -0.05, 0.28),
      new THREE.Vector3(0.35, -0.05, 0.28),
      new THREE.Vector3(1.05, -0.2, 0.12),
    ]),
    [],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 48, 0.008, 6, false]} />
      <meshBasicMaterial color={graphite} transparent opacity={0.18} />
    </mesh>
  );
}

function Bridge({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = Math.max(0.001, progress);
    group.current.scale.x = damp(group.current.scale.x, target, 4, delta);
  });
  return (
    <group ref={group} scale={[0.001, 1, 1]}>
      <mesh position={[0, -0.28, 0.08]} scale={[2.42, 0.075, 0.42]}>
        <boxGeometry />
        <meshStandardMaterial color={signal} roughness={0.68} metalness={0.03} />
      </mesh>
      <mesh position={[0, -0.22, 0.08]} scale={[1.9, 0.02, 0.24]}>
        <boxGeometry />
        <meshBasicMaterial color="#f0b499" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function BuildWorld({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = damp(ref.current.rotation.y, active ? clock.elapsedTime * 0.14 : 0.2, 2, delta);
    ref.current.rotation.x = damp(ref.current.rotation.x, active ? -0.12 : 0, 3, delta);
  });
  return (
    <group ref={ref}>
      {[-1, 0, 1].map((x, i) => (
        <MaterialBlock key={x} position={[x * 0.14, (i % 2) * 0.13, i * -0.06]} scale={[0.18, 0.18 + i * 0.07, 0.18]} color={active ? signalSoft : bone} />
      ))}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.345, 48]} />
        <meshBasicMaterial color={signal} transparent opacity={active ? 0.75 : 0.18} />
      </mesh>
    </group>
  );
}

function SoundWorld({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * (active ? 0.3 : 0.08);
    const s = 1 + Math.sin(clock.elapsedTime * (active ? 3.2 : 1.4)) * (active ? 0.08 : 0.025);
    ref.current.scale.setScalar(s);
  });
  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      {[0.16, 0.25, 0.34].map((r, i) => (
        <mesh key={r} rotation={[0, i * 0.5, 0]}>
          <torusGeometry args={[r, 0.018 + i * 0.004, 12, 64]} />
          <meshStandardMaterial color={active && i === 1 ? signal : i === 0 ? ink : graphite} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function ObjectWorld({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * (active ? 0.22 : 0.06);
    ref.current.rotation.y += delta * (active ? 0.36 : 0.08);
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.31, 2]} />
      <meshStandardMaterial color={active ? boneLight : bone} roughness={0.66} metalness={0.05} emissive={active ? signal : "#000"} emissiveIntensity={active ? 0.08 : 0} />
    </mesh>
  );
}

function DoorWorld({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.z = Math.sin(clock.elapsedTime * 0.55) * (active ? 0.08 : 0.025);
  });
  return (
    <group ref={ref}>
      <MaterialBlock position={[-0.2, 0, 0]} scale={[0.11, 0.68, 0.12]} color={ink} />
      <MaterialBlock position={[0.2, 0, 0]} scale={[0.11, 0.68, 0.12]} color={ink} />
      <MaterialBlock position={[0, 0.3, 0]} scale={[0.5, 0.11, 0.12]} color={ink} />
      <mesh position={[0, -0.04, 0.035]} scale={[0.28, 0.5, 0.02]}>
        <boxGeometry />
        <meshBasicMaterial color={active ? signal : "#26241f"} transparent opacity={active ? 0.22 : 0.9} />
      </mesh>
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
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {id === "build" && <BuildWorld active={active} />}
      {id === "sound" && <SoundWorld active={active} />}
      {id === "object" && <ObjectWorld active={active} />}
      {id === "door" && <DoorWorld active={active} />}
      <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.175, 36]} />
        <meshBasicMaterial color={active ? signal : graphite} transparent opacity={active ? 0.8 : visited ? 0.35 : 0.16} />
      </mesh>
    </group>
  );
}

function ExplorationWorld({ activeSpace, visited, onSelectSpace }: { activeSpace: SpaceId | null; visited: SpaceId[]; onSelectSpace: (space: SpaceId) => void }) {
  return (
    <group>
      {(Object.keys(SPACE_POSITIONS) as SpaceId[]).map((id) => (
        <SpacePortal key={id} id={id} active={activeSpace === id} visited={visited.includes(id)} onSelect={onSelectSpace} />
      ))}
      <GhostBridge />
    </group>
  );
}

export function World({ stage, exploring, postReveal, bridgeProgress, activeSpace, visited, onInspectO, onSelectSpace }: WorldProps) {
  const root = useRef<THREE.Group>(null);
  const architecture = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);
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
      cameraTarget.set(focus[0] * 0.28, 1.0 + focus[1] * 0.12, isNarrow ? 7.2 : activeSpace ? 5.35 : 6.15);
      lookTarget.set(focus[0] * 0.28, focus[1] * 0.42, 0);
    } else if (stage === "inspect") {
      cameraTarget.set(isNarrow ? -0.08 : -0.62, 1.25, isNarrow ? 7.0 : 5.5);
      lookTarget.set(-0.55, 0.48, 0);
    } else if (stage === "problem") {
      cameraTarget.set(0, 1.02, isNarrow ? 7.4 : 6.0);
      lookTarget.set(0, -0.02, 0.18);
    } else {
      cameraTarget.set(0, 1.15, isNarrow ? 7.6 : 6.35);
      lookTarget.set(0, 0.18, 0);
    }

    camera.position.x = damp(camera.position.x, cameraTarget.x, 2.5, delta);
    camera.position.y = damp(camera.position.y, cameraTarget.y, 2.5, delta);
    camera.position.z = damp(camera.position.z, cameraTarget.z, 2.5, delta);
    camera.lookAt(lookTarget);

    const pointerY = state.pointer.x * (isNarrow ? 0.035 : 0.075);
    const pointerX = -state.pointer.y * (isNarrow ? 0.018 : 0.04);
    root.current.rotation.y = damp(root.current.rotation.y, pointerY, 3.6, delta);
    root.current.rotation.x = damp(root.current.rotation.x, pointerX, 3.6, delta);

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
          <Structure side={-1} />
          <Structure side={1} />
          <GhostBridge />
          <Bridge progress={bridgeProgress} />
          <Node position={[-1.23, 1.15, 0.23]} label="O" visible={nodesVisible} interactive={!postReveal && stage === "inspect"} onClick={onInspectO} />
          <Node position={[1.32, 1.0, 0.09]} label="?" visible={nodesVisible} />
        </group>
      )}

      {exploring && <ExplorationWorld activeSpace={activeSpace} visited={visited} onSelectSpace={onSelectSpace} />}

      <mesh position={[0, -0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#e8e1d6" roughness={1} metalness={0} />
      </mesh>
      <ContactShadows position={[0, -0.93, 0]} opacity={0.24} scale={7.5} blur={3.2} far={4} />
    </group>
  );
}
