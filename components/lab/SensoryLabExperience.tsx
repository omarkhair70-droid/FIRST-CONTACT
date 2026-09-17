"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";

import { SensoryLabWorld, type SensoryScene } from "@/components/lab/SensoryLabWorld";
import { createSensorySoundscape } from "@/lib/client/sensory-sonic";

const SCENES: SensoryScene[] = [
  "object",
  "gap",
  "angle",
  "signal",
  "third",
  "reveal",
  "name",
  "choice",
  "ninetyone",
  "ninetysix",
  "unchanged",
];

const COPY: Record<SensoryScene, { eyebrow: string; title: string; body: string; whisper?: string }> = {
  object: {
    eyebrow: "FIELD OBJECT / 001",
    title: "Before a hello, there is an object.",
    body: "Cold porcelain. No profile. No explanation. Just enough strangeness to make curiosity safer than assumption.",
  },
  gap: {
    eyebrow: "PROXIMITY / UNKNOWN",
    title: "The distance is small. The meaning isn't.",
    body: "Two people can live almost beside each other and still carry completely different stories about the same silence.",
  },
  angle: {
    eyebrow: "REFRAME / 01",
    title: "The thing did not change. The angle did.",
    body: "A first impression can feel solid even when it is only one view. Here the object physically settles only after perspective changes.",
    whisper: "misalignment ≠ rejection",
  },
  signal: {
    eyebrow: "TRANSMISSION / 02",
    title: "A signal can exist without arriving.",
    body: "Something leaves one side, stalls, disappears, tries again. Silence is allowed to mean more than one thing.",
    whisper: "absence of reception is not proof of absence",
  },
  third: {
    eyebrow: "SOCIAL OBJECT / 03",
    title: "Something third begins to live.",
    body: "Neither node moves closer. Instead, a porcelain-organic form grows in the space between them: not his, not hers, only possible because both sides exist.",
    whisper: "stone → organism",
  },
  reveal: {
    eyebrow: "REVEAL / SHARED CONTEXT",
    title: "This was never a portfolio.",
    body: "It is a small machine for giving two people one shared event before the next real encounter.",
    whisper: "أنا عمر، جارك.",
  },
  name: {
    eyebrow: "SECOND NODE / VOLUNTARY",
    title: "YASMEEN enters the field.",
    body: "The unknown node gains a halo, and the shared form opens one more petal. The first irreversible visual change is caused by her presence, not by the system talking about Omar.",
    whisper: "YASMEEN",
  },
  choice: {
    eyebrow: "AGENCY / NO CLAIM MADE",
    title: "Nothing here decides what this means.",
    body: "Continue, send one signal, or leave unchanged. The piece keeps its emotional charge without turning that charge into pressure.",
  },
  ninetyone: {
    eyebrow: "IRL REMAINDER / 09%",
    title: "91% is enough for the screen.",
    body: "The ring stops before closure. The sound refuses its final resolving note. The missing part is not a bug; it belongs to a real meeting.",
    whisper: "THE REST DOESN'T BELONG TO THIS SCREEN.",
  },
  ninetysix: {
    eyebrow: "SIGNAL CROSSED / 04%",
    title: "A little more crossed. Not everything.",
    body: "A message can move the state further, but it still does not finish the relationship digitally.",
    whisper: "NEXT ENCOUNTER / IRL",
  },
  unchanged: {
    eyebrow: "CLOSED CLEANLY",
    title: "Nothing changed. That's allowed.",
    body: "The warmth recedes, the bloom folds, and no follow-up is owed. A graceful exit is part of the emotional design too.",
  },
};

function mood(scene: SensoryScene) {
  if (["third", "reveal", "name", "choice"].includes(scene)) return "warm";
  if (["ninetyone", "ninetysix"].includes(scene)) return "peak";
  if (scene === "unchanged") return "quiet";
  if (scene === "signal") return "signal";
  if (scene === "angle") return "angle";
  return "cold";
}

export function SensoryLabExperience() {
  const [scene, setScene] = useState<SensoryScene>("object");
  const [soundOn, setSoundOn] = useState(false);
  const engineRef = useRef<ReturnType<typeof createSensorySoundscape>>(null);

  const index = SCENES.indexOf(scene);
  const copy = COPY[scene];
  const sceneMood = mood(scene);

  const progress = useMemo(() => ((index + 1) / SCENES.length) * 100, [index]);

  useEffect(() => {
    if (!soundOn || !engineRef.current) return;
    engineRef.current.setScene(scene);
    engineRef.current.accent(scene);
  }, [scene, soundOn]);

  useEffect(() => () => engineRef.current?.destroy(), []);

  function enableSound() {
    if (soundOn) {
      engineRef.current?.destroy();
      engineRef.current = null;
      setSoundOn(false);
      return;
    }
    engineRef.current = createSensorySoundscape();
    engineRef.current?.setScene(scene);
    engineRef.current?.accent(scene);
    setSoundOn(true);
  }

  function go(next: SensoryScene) {
    setScene(next);
    if (navigator.vibrate) {
      if (next === "ninetyone") navigator.vibrate([18, 40, 24]);
      else if (next === "name") navigator.vibrate(22);
      else navigator.vibrate(10);
    }
  }

  function next() {
    go(SCENES[(index + 1) % SCENES.length]);
  }

  function prev() {
    go(SCENES[(index - 1 + SCENES.length) % SCENES.length]);
  }

  return (
    <main className={`sensory-lab sensory-${sceneMood}`}>
      <style>{`
        .sensory-lab {
          --ink:#2f2928;
          --muted:#746967;
          --line:rgba(70,55,52,.16);
          --rose:#c98f89;
          --coral:#d67b62;
          --amber:#d9a45d;
          --burgundy:#672f39;
          position:relative;
          width:100vw;
          height:100dvh;
          overflow:hidden;
          color:var(--ink);
          background:
            radial-gradient(circle at 66% 26%, rgba(255,255,255,.92), transparent 30%),
            radial-gradient(circle at 40% 66%, rgba(214,123,98,.05), transparent 34%),
            linear-gradient(150deg,#eee9e1 0%,#e4ddd3 100%);
          transition:background 1.2s ease,color .8s ease;
        }
        .sensory-lab::before {
          content:"";
          position:absolute; inset:-10%; z-index:0; pointer-events:none;
          background:radial-gradient(circle at 62% 46%,rgba(255,255,255,.66),transparent 32%);
          opacity:.66; filter:blur(40px); transition:all 1.1s ease;
        }
        .sensory-warm {
          background:
            radial-gradient(circle at 66% 28%, rgba(255,246,241,.96), transparent 29%),
            radial-gradient(circle at 47% 60%, rgba(216,157,146,.24), transparent 36%),
            linear-gradient(145deg,#f0e4dc 0%,#ddc8bd 100%);
        }
        .sensory-warm::before { background:radial-gradient(circle at 55% 48%,rgba(233,178,159,.34),transparent 34%); opacity:.9; }
        .sensory-peak {
          background:
            radial-gradient(circle at 52% 42%, rgba(255,238,226,.98), transparent 24%),
            radial-gradient(circle at 70% 62%, rgba(217,164,93,.24), transparent 35%),
            linear-gradient(145deg,#ecd7cb 0%,#d3aaa0 100%);
        }
        .sensory-peak::before { background:radial-gradient(circle at 52% 48%,rgba(214,123,98,.36),transparent 31%); opacity:1; }
        .sensory-signal { background:radial-gradient(circle at 55% 42%,#f3ece6 0%,#e2d9d1 52%,#d7d0cb 100%); }
        .sensory-angle { background:radial-gradient(circle at 48% 46%,#f2ece5 0%,#e4ddd5 58%,#d9d2cb 100%); }
        .sensory-quiet { background:linear-gradient(150deg,#ebe7df,#ded8cf); }
        .sensory-grain { position:absolute; inset:0; z-index:7; pointer-events:none; opacity:.11; mix-blend-mode:multiply; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.76' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E"); }
        .sensory-canvas { position:absolute; inset:0; z-index:1; }
        .sensory-canvas canvas { touch-action:none; }
        .sensory-header { position:absolute; z-index:12; top:0; left:0; right:0; display:flex; justify-content:space-between; gap:16px; padding:max(18px,env(safe-area-inset-top)) 20px 16px; border-bottom:1px solid var(--line); font:700 9px/1 Arial,sans-serif; letter-spacing:.16em; text-transform:uppercase; }
        .sensory-header button { border:0; padding:0; background:transparent; color:inherit; cursor:pointer; font:inherit; letter-spacing:inherit; }
        .sensory-copy { position:absolute; z-index:11; left:6vw; top:15vh; width:min(520px,46vw); pointer-events:none; }
        .sensory-copy .kicker { margin:0 0 12px; color:var(--muted); font:700 9px/1.3 Arial,sans-serif; letter-spacing:.18em; text-transform:uppercase; }
        .sensory-copy h1 { margin:0; max-width:560px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(38px,5.4vw,80px); font-weight:400; line-height:.94; letter-spacing:-.055em; }
        .sensory-copy .body { max-width:470px; margin:20px 0 0; color:var(--muted); font:500 13px/1.65 Arial,sans-serif; letter-spacing:.005em; }
        .sensory-copy .whisper { margin:18px 0 0; color:var(--burgundy); font-family:Georgia,'Times New Roman',serif; font-size:15px; font-style:italic; }
        .sensory-name-ghost { position:absolute; z-index:8; right:8vw; top:20vh; writing-mode:vertical-rl; transform:rotate(180deg); color:rgba(103,47,57,.11); font-family:Georgia,'Times New Roman',serif; font-size:clamp(44px,8vw,112px); letter-spacing:.08em; opacity:0; transition:opacity .8s ease; pointer-events:none; }
        .sensory-name .sensory-name-ghost,.sensory-choice .sensory-name-ghost { opacity:1; }
        .sensory-controls { position:absolute; z-index:14; left:20px; right:20px; bottom:max(18px,env(safe-area-inset-bottom)); display:flex; align-items:flex-end; justify-content:space-between; gap:16px; }
        .sensory-stepper { display:flex; gap:7px; flex-wrap:wrap; max-width:min(760px,72vw); }
        .sensory-stepper button { border:1px solid var(--line); padding:7px 8px; background:rgba(249,244,238,.48); backdrop-filter:blur(14px); color:var(--muted); cursor:pointer; font:700 8px/1 Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; transition:.25s ease; }
        .sensory-stepper button[data-active='true'] { border-color:rgba(103,47,57,.46); color:var(--burgundy); background:rgba(255,244,239,.7); }
        .sensory-arrows { display:flex; align-items:center; gap:8px; }
        .sensory-arrows button { width:44px; height:44px; border:1px solid var(--line); background:rgba(249,244,238,.6); backdrop-filter:blur(14px); border-radius:50%; cursor:pointer; color:var(--ink); }
        .sensory-progress { position:absolute; z-index:12; bottom:0; left:0; width:${progress}%; height:2px; background:linear-gradient(90deg,var(--rose),var(--coral),var(--amber)); transition:width .7s cubic-bezier(.22,.8,.23,1); }
        .sensory-hint { position:absolute; z-index:10; right:20px; bottom:84px; color:rgba(74,61,58,.5); font:700 8px/1 Arial,sans-serif; letter-spacing:.15em; text-transform:uppercase; }
        @media (max-width:760px) {
          .sensory-copy { left:16px; right:16px; top:calc(76px + env(safe-area-inset-top)); width:auto; }
          .sensory-copy h1 { max-width:92%; font-size:clamp(36px,11vw,56px); }
          .sensory-copy .body { max-width:92%; font-size:12px; line-height:1.55; }
          .sensory-copy .whisper { font-size:14px; }
          .sensory-name-ghost { right:2vw; top:29vh; font-size:22vw; }
          .sensory-controls { left:12px; right:12px; bottom:max(12px,env(safe-area-inset-bottom)); align-items:flex-end; }
          .sensory-stepper { max-width:calc(100vw - 116px); max-height:92px; overflow:auto; scrollbar-width:none; }
          .sensory-stepper::-webkit-scrollbar { display:none; }
          .sensory-stepper button { padding:7px; font-size:7px; }
          .sensory-arrows button { width:42px; height:42px; }
          .sensory-hint { display:none; }
        }
      `}</style>

      <div className="sensory-grain" aria-hidden="true" />
      <header className="sensory-header">
        <span>NEIGHBOR_01 / SENSORY ART LAB</span>
        <button type="button" onClick={enableSound}>{soundOn ? "SOUND / ON" : "SOUND / OFF"}</button>
      </header>

      <section className="sensory-canvas" aria-label="NEIGHBOR_01 emotional art direction prototype">
        <Canvas camera={{ position: [0, 1.1, 5.4], fov: 38 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
          <ambientLight intensity={sceneMood === "peak" ? 1.75 : sceneMood === "warm" ? 1.55 : 1.25} />
          <directionalLight position={[4, 7, 5]} intensity={sceneMood === "peak" ? 3 : 2.25} color={sceneMood === "cold" ? "#f3f3ef" : "#fff0e6"} />
          <pointLight position={[-2, 1.6, 2.2]} intensity={sceneMood === "warm" || sceneMood === "peak" ? 1.4 : 0.28} color="#d67b62" />
          <pointLight position={[2.2, .6, 1.5]} intensity={sceneMood === "peak" ? 1.1 : .18} color="#d9a45d" />
          <SensoryLabWorld scene={scene} />
        </Canvas>
      </section>

      <section className="sensory-copy" key={scene}>
        <p className="kicker">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="body">{copy.body}</p>
        {copy.whisper && <p className="whisper">{copy.whisper}</p>}
      </section>

      <div className="sensory-name-ghost" aria-hidden="true">YASMEEN</div>
      <div className="sensory-hint">LAB ONLY / NO BACKEND / CLICK THROUGH STATES</div>

      <div className="sensory-controls">
        <div className="sensory-stepper">
          {SCENES.map((item) => (
            <button key={item} type="button" data-active={scene === item} onClick={() => go(item)}>{item === "ninetyone" ? "91%" : item === "ninetysix" ? "96%" : item}</button>
          ))}
        </div>
        <div className="sensory-arrows">
          <button type="button" aria-label="Previous scene" onClick={prev}>←</button>
          <button type="button" aria-label="Next scene" onClick={next}>→</button>
        </div>
      </div>
      <div className="sensory-progress" aria-hidden="true" />
    </main>
  );
}
