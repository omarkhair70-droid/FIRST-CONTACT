"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { SensoryLabWorld, type SensoryScene } from "@/components/lab/SensoryLabWorld";
import { createSensorySoundscape } from "@/lib/client/sensory-sonic";

const ORDER: SensoryScene[] = ["object", "gap", "angle", "signal", "third", "reveal", "name", "choice", "ninetyone"];

const COPY: Partial<Record<SensoryScene, { kicker: string; title: string; body?: string; whisper?: string }>> = {
  object: { kicker: "FIELD OBJECT / 001", title: "OBJECT 001", body: "touch to wake" },
  gap: { kicker: "PROXIMITY / UNKNOWN", title: "Small distance. Unknown meaning." },
  angle: { kicker: "REFRAME / 01", title: "The thing didn't change. The angle did.", whisper: "misalignment ≠ rejection" },
  signal: { kicker: "TRANSMISSION / 02", title: "A signal can exist without arriving." },
  third: { kicker: "SOCIAL OBJECT / 03", title: "Something third begins to live." },
  reveal: { kicker: "SHARED CONTEXT", title: "أنا عمر، جارك.", body: "وكان ممكن أقول هاي عادي. واضح إن الموضوع خرج عن السيطرة شوية.", whisper: "دي بس فرصة إن المرة الجاية ما تبدأش من صفر." },
  name: { kicker: "SECOND NODE / VOLUNTARY", title: "The other node decides." },
  choice: { kicker: "AGENCY / NO CLAIM MADE", title: "You decide what this becomes." },
  ninetyone: { kicker: "IRL REMAINDER / 09%", title: "91%", body: "THE REST DOESN'T BELONG TO THIS SCREEN.", whisper: "NEXT ENCOUNTER / IRL" },
  ninetysix: { kicker: "SIGNAL CROSSED / 04%", title: "96%", body: "A little more crossed. Not everything.", whisper: "NEXT ENCOUNTER / IRL" },
  unchanged: { kicker: "CLOSED CLEANLY", title: "Nothing changed. That's allowed.", body: "No explanation required. No follow-up is owed." },
};

function mood(scene: SensoryScene) {
  if (["third", "reveal", "name", "choice"].includes(scene)) return "warm";
  if (["ninetyone", "ninetysix"].includes(scene)) return "peak";
  if (scene === "unchanged") return "quiet";
  if (scene === "signal") return "signal";
  if (scene === "angle") return "angle";
  return "cold";
}

export function RecipientSensoryPreview() {
  const [scene, setScene] = useState<SensoryScene>("object");
  const [soundOn, setSoundOn] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [signalDraft, setSignalDraft] = useState("");
  const [signalOpen, setSignalOpen] = useState(false);
  const engineRef = useRef<ReturnType<typeof createSensorySoundscape>>(null);

  const sceneMood = mood(scene);
  const copy = COPY[scene] ?? COPY.object!;
  const terminal = ["ninetyone", "ninetysix", "unchanged"].includes(scene);

  useEffect(() => {
    if (!soundOn || !engineRef.current) return;
    engineRef.current.setScene(scene);
    engineRef.current.accent(scene);
  }, [scene, soundOn]);

  useEffect(() => () => engineRef.current?.destroy(), []);

  function ensureSound() {
    if (engineRef.current) return;
    engineRef.current = createSensorySoundscape();
    engineRef.current?.setScene(scene);
    engineRef.current?.accent(scene);
    setSoundOn(Boolean(engineRef.current));
  }

  function haptic(next: SensoryScene) {
    if (!navigator.vibrate) return;
    if (next === "angle") navigator.vibrate([10, 34, 10]);
    else if (next === "signal") navigator.vibrate(10);
    else if (next === "name") navigator.vibrate(24);
    else if (next === "ninetyone") navigator.vibrate([20, 52, 11]);
    else navigator.vibrate(9);
  }

  function go(next: SensoryScene) {
    ensureSound();
    setSignalOpen(false);
    setScene(next);
    haptic(next);
  }

  function advance() {
    if (scene === "object") return go("gap");
    if (scene === "gap") return go("angle");
    if (scene === "angle") return go("signal");
    if (scene === "signal") return go("third");
    if (scene === "third") return go("reveal");
    if (scene === "reveal") return go("name");
  }

  function acceptName() {
    const value = nameDraft.trim().slice(0, 40);
    if (!value) return;
    ensureSound();
    setRecipientName(value);
    setScene("choice");
    if (navigator.vibrate) navigator.vibrate(26);
  }

  function sendSignal() {
    if (!signalDraft.trim()) return;
    go("ninetysix");
  }

  function restart() {
    setRecipientName("");
    setNameDraft("");
    setSignalDraft("");
    setSignalOpen(false);
    go("object");
  }

  function toggleSound() {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
      setSoundOn(false);
    } else {
      ensureSound();
    }
  }

  const nameForArt = recipientName || (labOpen && scene === "name" ? "YASMEEN" : "");

  return (
    <main className={`encounter-preview encounter-${sceneMood}`}>
      <style>{`
        .encounter-preview {
          --ink:#2d2827; --muted:#736a67; --line:rgba(74,58,54,.15);
          --rose:#c88f89; --coral:#d47a61; --amber:#daa65d; --wine:#672f39;
          position:relative; width:100vw; height:100dvh; overflow:hidden; color:var(--ink);
          background:radial-gradient(circle at 66% 28%,rgba(255,255,255,.94),transparent 28%),linear-gradient(150deg,#efeae2,#ded7cd);
          transition:background 1.4s ease,color 1s ease;
        }
        .encounter-warm { background:radial-gradient(circle at 62% 36%,rgba(255,245,239,.98),transparent 28%),radial-gradient(circle at 48% 64%,rgba(217,154,142,.22),transparent 38%),linear-gradient(145deg,#f1e4db,#ddc6ba); }
        .encounter-peak { background:radial-gradient(circle at 50% 43%,rgba(255,239,226,.98),transparent 24%),radial-gradient(circle at 70% 65%,rgba(218,166,93,.22),transparent 34%),linear-gradient(145deg,#ecd5c8,#d2a89e); }
        .encounter-signal { background:radial-gradient(circle at 55% 42%,#f4ede7,#dfd6ce 58%,#d4ccc5); }
        .encounter-angle { background:radial-gradient(circle at 48% 46%,#f3eee7,#e2dbd2 60%,#d7d0c9); }
        .encounter-quiet { background:linear-gradient(150deg,#ece8e0,#ddd7ce); }
        .encounter-grain { position:absolute; inset:0; z-index:7; pointer-events:none; opacity:.1; mix-blend-mode:multiply; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.74' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.16'/%3E%3C/svg%3E"); }
        .encounter-canvas { position:absolute; inset:0; z-index:1; }
        .encounter-canvas canvas { touch-action:none; }
        .encounter-top { position:absolute; z-index:20; left:0; right:0; top:0; display:flex; justify-content:space-between; align-items:center; gap:12px; padding:max(17px,env(safe-area-inset-top)) 18px 15px; border-bottom:1px solid var(--line); font:700 8px/1 Arial,sans-serif; letter-spacing:.16em; text-transform:uppercase; }
        .encounter-top-actions { display:flex; align-items:center; gap:14px; }
        .encounter-top button { border:0; padding:0; background:none; color:inherit; font:inherit; letter-spacing:inherit; cursor:pointer; }
        .encounter-copy { position:absolute; z-index:12; top:14vh; left:6vw; width:min(560px,47vw); pointer-events:none; }
        .encounter-copy .kicker { margin:0 0 12px; color:var(--muted); font:700 8px/1.2 Arial,sans-serif; letter-spacing:.18em; text-transform:uppercase; }
        .encounter-copy h1 { margin:0; max-width:560px; font-family:Georgia,'Times New Roman',serif; font-size:clamp(38px,5.5vw,82px); font-weight:400; line-height:.94; letter-spacing:-.055em; }
        .encounter-copy .body { max-width:470px; margin:18px 0 0; color:var(--muted); font:500 13px/1.68 Arial,sans-serif; }
        .encounter-copy .whisper { max-width:470px; margin:15px 0 0; color:var(--wine); font:italic 15px/1.55 Georgia,'Times New Roman',serif; }
        .encounter-copy.reveal h1 { font-family:Tahoma,Arial,sans-serif; font-size:clamp(34px,4.8vw,67px); line-height:1.15; letter-spacing:-.04em; }
        .encounter-copy.reveal .body,.encounter-copy.reveal .whisper { font-family:Tahoma,Arial,sans-serif; direction:rtl; text-align:right; font-style:normal; }
        .encounter-continue { position:absolute; z-index:16; left:6vw; bottom:11vh; border:0; border-bottom:1px solid currentColor; padding:7px 0; background:transparent; color:var(--ink); cursor:pointer; font:700 9px/1 Arial,sans-serif; letter-spacing:.13em; text-transform:uppercase; }
        .encounter-wake { position:absolute; z-index:16; left:50%; bottom:12vh; transform:translateX(-50%); min-width:150px; border:1px solid var(--line); border-radius:999px; padding:13px 18px; background:rgba(252,248,243,.54); backdrop-filter:blur(16px); color:var(--ink); cursor:pointer; font:700 9px/1 Arial,sans-serif; letter-spacing:.15em; text-transform:uppercase; }
        .name-form,.choice-panel,.signal-form,.end-panel { position:absolute; z-index:18; left:6vw; bottom:9vh; width:min(500px,88vw); }
        .name-form { display:flex; align-items:flex-end; gap:14px; }
        .name-form input,.signal-form textarea { flex:1; min-width:0; border:0; border-bottom:1px solid rgba(45,40,39,.58); border-radius:0; outline:0; padding:12px 0; background:transparent; color:var(--ink); font:400 17px/1.3 Georgia,'Times New Roman',serif; }
        .name-form input::placeholder,.signal-form textarea::placeholder { color:rgba(70,58,55,.48); }
        .name-form button,.signal-form button,.choice-panel button,.end-panel button { border:1px solid var(--line); padding:11px 13px; background:rgba(255,248,244,.48); backdrop-filter:blur(14px); color:var(--ink); cursor:pointer; font:700 8px/1 Arial,sans-serif; letter-spacing:.12em; text-transform:uppercase; }
        .choice-panel { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .choice-panel button { min-height:92px; display:flex; flex-direction:column; align-items:flex-start; justify-content:space-between; text-align:left; }
        .choice-panel b { color:var(--wine); font:400 24px/1 Georgia,'Times New Roman',serif; letter-spacing:-.03em; }
        .choice-panel small { color:var(--muted); font:500 9px/1.35 Arial,sans-serif; letter-spacing:0; text-transform:none; }
        .signal-form { display:grid; gap:10px; }
        .signal-form textarea { width:100%; resize:none; font-size:16px; }
        .signal-actions { display:flex; justify-content:space-between; gap:10px; }
        .name-ghost { position:absolute; z-index:8; right:6vw; top:19vh; writing-mode:vertical-rl; transform:rotate(180deg); color:rgba(103,47,57,.12); font:400 clamp(48px,9vw,124px)/.85 Georgia,'Times New Roman',serif; letter-spacing:.07em; pointer-events:none; opacity:${nameForArt ? 1 : 0}; transition:opacity .9s ease; }
        .end-panel { color:var(--muted); font:600 8px/1.3 Arial,sans-serif; letter-spacing:.14em; text-transform:uppercase; }
        .end-panel button { margin-top:14px; }
        .lab-drawer { position:absolute; z-index:30; right:14px; top:58px; width:min(340px,calc(100vw - 28px)); padding:12px; border:1px solid var(--line); background:rgba(245,239,232,.82); backdrop-filter:blur(20px); box-shadow:0 18px 60px rgba(66,46,40,.08); }
        .lab-drawer p { margin:0 0 9px; color:var(--muted); font:700 8px/1 Arial,sans-serif; letter-spacing:.14em; text-transform:uppercase; }
        .lab-grid { display:flex; flex-wrap:wrap; gap:5px; }
        .lab-grid button { border:1px solid var(--line); padding:7px; background:rgba(255,255,255,.25); color:var(--muted); cursor:pointer; font:700 7px/1 Arial,sans-serif; letter-spacing:.1em; text-transform:uppercase; }
        .lab-grid button[data-active='true'] { color:var(--wine); border-color:rgba(103,47,57,.4); }
        .tap-hint { position:absolute; z-index:12; right:18px; bottom:18px; color:rgba(73,61,58,.45); font:700 7px/1 Arial,sans-serif; letter-spacing:.14em; text-transform:uppercase; pointer-events:none; }
        @media (max-width:760px) {
          .encounter-copy { left:16px; right:16px; top:calc(76px + env(safe-area-inset-top)); width:auto; }
          .encounter-copy h1 { max-width:94%; font-size:clamp(35px,10.6vw,56px); }
          .encounter-copy .body { max-width:92%; font-size:12px; line-height:1.55; }
          .encounter-copy .whisper { max-width:92%; font-size:13px; }
          .encounter-continue { left:16px; bottom:19vh; }
          .encounter-wake { bottom:16vh; }
          .name-form,.choice-panel,.signal-form,.end-panel { left:16px; right:16px; bottom:max(62px,calc(7vh + env(safe-area-inset-bottom))); width:auto; }
          .choice-panel { grid-template-columns:1fr; gap:6px; }
          .choice-panel button { min-height:58px; flex-direction:row; align-items:center; }
          .choice-panel small { max-width:46%; text-align:right; }
          .name-ghost { right:1vw; top:31vh; font-size:21vw; }
          .tap-hint { display:none; }
        }
      `}</style>

      <div className="encounter-grain" aria-hidden="true" />
      <header className="encounter-top">
        <span>HELLO://01 · NEIGHBOR_01</span>
        <div className="encounter-top-actions">
          <button type="button" onClick={toggleSound}>{soundOn ? "SOUND ON" : "SOUND"}</button>
          <button type="button" onClick={() => setLabOpen((value) => !value)}>{labOpen ? "CLOSE LAB" : "LAB"}</button>
        </div>
      </header>

      <section className="encounter-canvas" aria-label="NEIGHBOR_01 recipient sensory preview">
        <Canvas camera={{ position:[0,1.08,5.45], fov:38 }} dpr={[1,1.7]} gl={{ antialias:true, alpha:true, powerPreference:"high-performance" }}>
          <ambientLight intensity={sceneMood === "peak" ? 1.8 : sceneMood === "warm" ? 1.56 : 1.24} />
          <directionalLight position={[4,7,5]} intensity={sceneMood === "peak" ? 3 : 2.2} color={sceneMood === "cold" ? "#f5f3ef" : "#ffede2"} />
          <pointLight position={[-2,1.6,2]} intensity={sceneMood === "warm" || sceneMood === "peak" ? 1.35 : .22} color="#d47a61" />
          <pointLight position={[2.1,.8,1.4]} intensity={sceneMood === "peak" ? 1.05 : .15} color="#daa65d" />
          <SensoryLabWorld scene={scene} onAdvance={terminal || ["name","choice"].includes(scene) ? undefined : advance} />
        </Canvas>
      </section>

      <section className={`encounter-copy${scene === "reveal" ? " reveal" : ""}`} key={scene}>
        <p className="kicker">{copy.kicker}</p>
        <h1>{scene === "name" && nameForArt ? nameForArt.toUpperCase() : copy.title}</h1>
        {copy.body && <p className="body">{copy.body}</p>}
        {copy.whisper && <p className="whisper">{copy.whisper}</p>}
      </section>

      {nameForArt && <div className="name-ghost" aria-hidden="true">{nameForArt.toUpperCase()}</div>}

      {scene === "object" && <button className="encounter-wake" type="button" onClick={advance}>touch to wake</button>}
      {["gap","angle","signal","third","reveal"].includes(scene) && <button className="encounter-continue" type="button" onClick={advance}>continue →</button>}

      {scene === "name" && (
        <form className="name-form" onSubmit={(event) => { event.preventDefault(); acceptName(); }}>
          <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="name / nickname" maxLength={40} autoComplete="off" />
          <button type="submit" disabled={!nameDraft.trim()}>enter field</button>
        </form>
      )}

      {scene === "choice" && !signalOpen && (
        <div className="choice-panel">
          <button type="button" onClick={() => go("ninetyone")}><b>91%</b><small>leave the last 9% to real life</small></button>
          <button type="button" onClick={() => { ensureSound(); setSignalOpen(true); }}><b>SIGNAL</b><small>send one thing through</small></button>
          <button type="button" onClick={() => go("unchanged")}><b>UNCHANGED</b><small>end without owing anything</small></button>
        </div>
      )}

      {scene === "choice" && signalOpen && (
        <form className="signal-form" onSubmit={(event) => { event.preventDefault(); sendSignal(); }}>
          <textarea value={signalDraft} onChange={(event) => setSignalDraft(event.target.value)} rows={2} maxLength={280} placeholder="one sentence is enough…" />
          <div className="signal-actions"><button type="button" onClick={() => setSignalOpen(false)}>back</button><button type="submit" disabled={!signalDraft.trim()}>send signal</button></div>
        </form>
      )}

      {terminal && <div className="end-panel"><span>{recipientName ? `${recipientName.toUpperCase()} / ` : ""}OBJECT 001</span><br/><button type="button" onClick={restart}>replay encounter</button></div>}

      {labOpen && (
        <aside className="lab-drawer">
          <p>sensory lab · local only · no backend</p>
          <div className="lab-grid">
            {[...ORDER,"ninetysix","unchanged"].map((item) => <button key={item} type="button" data-active={scene === item} onClick={() => { if (item === "name" && !nameDraft) setNameDraft("YASMEEN"); go(item); }}>{item === "ninetyone" ? "91%" : item === "ninetysix" ? "96%" : item}</button>)}
          </div>
        </aside>
      )}

      {!terminal && scene !== "object" && <div className="tap-hint">tap the world or continue</div>}
    </main>
  );
}
