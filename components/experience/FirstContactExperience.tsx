"use client";

import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { World } from "@/components/experience/World";
import { ExperienceMode, IntroStage, SPACE_COPY, SpaceId } from "@/lib/encounter";

const INTRO_SEQUENCE: Array<{ stage: IntroStage; at: number }> = [
  { stage: "object", at: 0 },
  { stage: "context", at: 1200 },
  { stage: "world", at: 3200 },
  { stage: "metrics", at: 6500 },
  { stage: "problem", at: 9600 },
  { stage: "inspect", at: 12600 },
];

export function FirstContactExperience() {
  const [mode, setMode] = useState<ExperienceMode>({ kind: "intro", stage: "object" });
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = INTRO_SEQUENCE.slice(1).map(({ stage, at }) =>
      window.setTimeout(() => setMode({ kind: "intro", stage }), at),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!copyRef.current) return;
    gsap.fromTo(
      copyRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", overwrite: true },
    );
  }, [mode]);

  const stage: IntroStage = mode.kind === "intro" ? mode.stage : "inspect";
  const exploring = mode.kind === "explore";
  const activeSpace = mode.kind === "explore" ? mode.activeSpace : null;
  const visited = mode.kind === "explore" ? mode.visited : [];

  const inspectO = useCallback(() => {
    if (mode.kind !== "intro" || mode.stage !== "inspect") return;
    setMode({ kind: "explore", activeSpace: null, visited: [] });
    if (navigator.vibrate) navigator.vibrate(18);
  }, [mode]);

  const selectSpace = useCallback((space: SpaceId) => {
    setMode((current) => {
      if (current.kind !== "explore") return current;
      const visitedNext = current.visited.includes(space) ? current.visited : [...current.visited, space];
      return { kind: "explore", activeSpace: space, visited: visitedNext };
    });
    if (navigator.vibrate) navigator.vibrate(12);
  }, []);

  const canReveal = mode.kind === "explore" && mode.visited.length >= 2;
  const activeCopy = activeSpace ? SPACE_COPY[activeSpace] : null;

  const headline = useMemo(() => {
    if (mode.kind === "reveal") return "That wasn't the point.";
    if (mode.kind === "explore") return activeCopy?.label ?? "NODE O";
    switch (mode.stage) {
      case "object":
        return "OBJECT 001";
      case "context":
        return "establishing context";
      case "world":
        return "HELLO:// ENCOUNTER 001";
      case "metrics":
        return "PROXIMITY HIGH";
      case "problem":
        return "This appears to be a design problem.";
      case "inspect":
        return "inspect node O";
    }
  }, [activeCopy, mode]);

  return (
    <main className="experience-shell">
      <div className="grain" aria-hidden="true" />
      <header className="system-header">
        <span>HELLO://01</span>
        <span>NEIGHBOR_01</span>
      </header>

      <section className="canvas-wrap" aria-label="Interactive first contact world">
        <Canvas
          camera={{ position: [0, 2.45, 7.2], fov: 37 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.65} />
          <directionalLight position={[4, 7, 5]} intensity={2.4} color="#fff9eb" />
          <directionalLight position={[-4, 2, -2]} intensity={0.55} color="#b9c0c5" />
          <World
            stage={stage}
            exploring={exploring}
            activeSpace={activeSpace}
            visited={visited}
            onInspectO={inspectO}
            onSelectSpace={selectSpace}
          />
        </Canvas>
      </section>

      <section
        className="narrative"
        ref={copyRef}
        key={`${mode.kind}-${mode.kind === "intro" ? mode.stage : activeSpace ?? "root"}`}
      >
        <p className="eyebrow">
          {mode.kind === "explore"
            ? activeCopy?.code ?? `${visited.length}/4 DISCOVERED`
            : mode.kind === "reveal"
              ? "IDENTITY / SOURCE"
              : "FIRST CONTACT PROTOCOL"}
        </p>
        <h1>{headline}</h1>

        {mode.kind === "intro" && mode.stage === "metrics" && (
          <p className="support">
            INTRODUCTIONS <strong>0</strong>
          </p>
        )}
        {mode.kind === "intro" && mode.stage === "inspect" && (
          <p className="support">Touch the dark node. The rest is not a menu.</p>
        )}

        {mode.kind === "explore" && activeCopy && <p className="support wide">{activeCopy.line}</p>}
        {mode.kind === "explore" && !activeCopy && (
          <p className="support wide">Four fragments. Pick any two. Curiosity should do the rest.</p>
        )}

        {canReveal && (
          <button className="quiet-action" type="button" onClick={() => setMode({ kind: "reveal" })}>
            enough. continue →
          </button>
        )}

        {mode.kind === "reveal" && (
          <div className="reveal-copy">
            <p>Okay. This accidentally became a portfolio.</p>
            <p className="arabic" dir="rtl">
              أنا عمر، جارك. وكان ممكن أقول هاي زي بني آدم طبيعي.
            </p>
            <p className="arabic muted" dir="rtl">
              بس للأسف دي كانت هتبقى طريقة مملة جدًا.
            </p>
            <div className="reveal-nodes" aria-label="Connection state">
              <span>OMAR</span>
              <i />
              <span>?</span>
            </div>
            <p className="tiny">NEXT: IDENTIFY NODE / CONSENT / BRIDGE</p>
          </div>
        )}
      </section>

      <footer className="system-footer">
        <span>OBJECT 001</span>
        <span>
          {mode.kind === "reveal"
            ? "SOURCE REVEALED"
            : mode.kind === "explore"
              ? `${visited.length}/4`
              : stage.toUpperCase()}
        </span>
      </footer>
    </main>
  );
}
