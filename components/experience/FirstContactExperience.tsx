"use client";

import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { World } from "@/components/experience/World";
import { playCue } from "@/lib/client/sonic";
import { ExperienceMode, IntroStage, type ResponseAction, SPACE_COPY, SpaceId } from "@/lib/encounter";

const INTRO_SEQUENCE: Array<{ stage: IntroStage; at: number }> = [
  { stage: "object", at: 0 },
  { stage: "context", at: 1700 },
  { stage: "world", at: 4300 },
  { stage: "metrics", at: 7100 },
  { stage: "problem", at: 9900 },
  { stage: "inspect", at: 12800 },
];

const MOBILE_CLOSURE_STYLES = `
  .narrative.narrative-scroll {
    bottom: calc(58px + env(safe-area-inset-bottom));
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    pointer-events: auto;
    padding-bottom: 28px;
    scrollbar-width: none;
  }
  .narrative.narrative-scroll::-webkit-scrollbar { display: none; }
  .protocol-form input,
  .protocol-form textarea { font-size: 16px; }
  .quiet-action,
  .protocol-form > button,
  .form-actions button { min-height: 44px; display: inline-flex; align-items: center; }
  .system-header { padding-top: max(18px, env(safe-area-inset-top)); }
  .system-footer { padding-bottom: max(18px, env(safe-area-inset-bottom)); }
  .relation-note { margin-top: 10px; max-width: 440px; color: var(--muted); font-family: Georgia, 'Times New Roman', serif; font-size: 14px; line-height: 1.5; }
  .completion-meter { margin: 24px 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(48px, 12vw, 90px); font-weight: 400; letter-spacing: -.06em; line-height: .85; }
  .completion-rule { width: min(100%, 390px); height: 1px; margin: 18px 0; background: linear-gradient(90deg, var(--accent) 0 91%, var(--line) 91% 100%); }
  .lab-flag { position: absolute; z-index: 40; top: calc(48px + env(safe-area-inset-top)); right: 16px; padding: 7px 9px; border: 1px solid var(--line); background: rgba(236,232,223,.76); backdrop-filter: blur(10px); color: var(--muted); font-size: 8px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; pointer-events: none; }

  @media (max-width: 560px) {
    .narrative { left: 16px; right: 16px; top: calc(72px + env(safe-area-inset-top)); }
    .narrative.narrative-scroll { bottom: calc(54px + env(safe-area-inset-bottom)); }
    h1 { font-size: clamp(34px, 10.5vw, 48px); line-height: .94; }
    .support.wide { font-size: 13px; line-height: 1.6; }
    .reveal-copy { margin-top: 16px; }
    .reveal-copy .arabic { font-size: 17px; line-height: 1.72; }
    .reveal-nodes { margin-top: 20px; gap: 9px; }
    .choice-grid { margin-top: 18px; gap: 8px; }
    .choice-grid button { min-height: 82px; padding: 11px 12px; }
    .protocol-form { gap: 10px; }
    .protocol-form input,
    .protocol-form textarea { padding: 14px 0; }
    .system-header,
    .system-footer { padding-left: 16px; padding-right: 16px; }
    .relation-note { font-size: 13px; }
    .lab-flag { top: calc(51px + env(safe-area-inset-top)); }
  }

  @media (max-height: 700px) {
    .narrative { top: calc(66px + env(safe-area-inset-top)); }
    .narrative.narrative-scroll { bottom: calc(50px + env(safe-area-inset-bottom)); }
    h1 { font-size: clamp(30px, 8vw, 44px); }
    .eyebrow { margin-bottom: 8px; }
    .support { margin-top: 10px; }
    .reveal-copy,
    .protocol-panel,
    .protocol-form { margin-top: 14px; }
    .reveal-copy .arabic { margin-top: 10px; font-size: 15px; line-height: 1.6; }
    .choice-grid button { min-height: 70px; }
  }
`;

export function FirstContactExperience({ labMode = false }: { labMode?: boolean }) {
  const [mode, setMode] = useState<ExperienceMode>({ kind: "intro", stage: "object" });
  const [nameDraft, setNameDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = INTRO_SEQUENCE.slice(1).map(({ stage, at }) => window.setTimeout(() => setMode({ kind: "intro", stage }), at));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!copyRef.current) return;
    gsap.fromTo(copyRef.current, { opacity: 0, y: 10, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.78, ease: "power3.out", overwrite: true });
  }, [mode]);

  const stage: IntroStage = mode.kind === "intro" ? mode.stage : "inspect";
  const exploring = mode.kind === "explore";
  const postReveal = !["intro", "explore"].includes(mode.kind);
  const activeSpace = mode.kind === "explore" ? mode.activeSpace : null;
  const visited = mode.kind === "explore" ? mode.visited : [];
  const bridgeProgress = mode.kind === "complete" ? (mode.action === "message" ? 0.96 : 0.91) : 0;
  const narrativeScrollable = ["reveal", "identify", "consent", "message", "complete", "archived"].includes(mode.kind);

  const inspectO = useCallback(() => {
    if (mode.kind !== "intro" || mode.stage !== "inspect") return;
    playCue("inspect");
    setMode({ kind: "explore", activeSpace: null, visited: [] });
    if (navigator.vibrate) navigator.vibrate(18);
  }, [mode]);

  const selectSpace = useCallback((space: SpaceId) => {
    playCue("shift");
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
    if (mode.kind === "reveal") return "This wasn't made to explain me.";
    if (mode.kind === "identify") return "Become the second node?";
    if (mode.kind === "consent") return "You decide what this becomes.";
    if (mode.kind === "message") return "Send one signal through.";
    if (mode.kind === "complete") return "Not complete. Intentionally.";
    if (mode.kind === "archived") return "Nothing changed. That's allowed.";
    if (mode.kind === "explore") return activeCopy?.label ?? "THE GAP";
    switch (mode.stage) {
      case "object": return "OBJECT 001";
      case "context": return "mapping a very small distance";
      case "world": return "TWO NODES / ONE GAP";
      case "metrics": return "DISTANCE SMALL";
      case "problem": return "MEANING UNKNOWN";
      case "inspect": return "TOUCH O — DON'T DECIDE YET";
    }
  }, [activeCopy, mode]);

  const keepFieldVisible = useCallback((element: HTMLElement) => {
    window.setTimeout(() => element.scrollIntoView({ block: "center", behavior: "smooth" }), 180);
  }, []);

  async function submitResponse(type: ResponseAction, recipientName: string, message?: string) {
    setSubmitError("");

    if (labMode) {
      setSubmitting(true);
      await new Promise((resolve) => window.setTimeout(resolve, type === "message" ? 680 : 420));
      if (navigator.vibrate) navigator.vibrate(type === "message" ? [16, 28, 22] : 16);
      setSubmitting(false);
      return true;
    }

    const token = new URLSearchParams(window.location.search).get("t") ?? "";
    if (!token) {
      setSubmitError("OBJECT 001 is in preview mode. The physical object has not armed this encounter yet.");
      return false;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/encounter/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-encounter-token": token },
        body: JSON.stringify({ type, recipientName, message }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Connection failed.");
      if (navigator.vibrate) navigator.vibrate(type === "message" ? [16, 28, 22] : 16);
      return true;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Connection failed.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function identify(event: FormEvent) {
    event.preventDefault();
    const name = nameDraft.trim().slice(0, 40);
    if (!name) return;
    playCue("consent");
    setMode({ kind: "consent", recipientName: name });
  }

  async function choose(type: "wave" | "archive", recipientName: string) {
    const saved = await submitResponse(type, recipientName);
    if (!saved) return;
    if (type === "archive") {
      playCue("archive");
      setMode({ kind: "archived", recipientName });
      return;
    }
    playCue("complete");
    setMode({ kind: "complete", recipientName, action: "wave" });
  }

  async function sendMessage(event: FormEvent, recipientName: string) {
    event.preventDefault();
    const message = messageDraft.trim();
    if (!message) return;
    playCue("send");
    const saved = await submitResponse("message", recipientName, message);
    if (saved) {
      playCue("complete");
      setMode({ kind: "complete", recipientName, action: "message" });
    }
  }

  const modeKey = mode.kind === "intro" ? `intro-${mode.stage}` : mode.kind === "explore" ? `explore-${activeSpace ?? "root"}` : mode.kind;

  return (
    <main className="experience-shell">
      <style>{MOBILE_CLOSURE_STYLES}</style>
      <div className="grain" aria-hidden="true" />
      <header className="system-header"><span>HELLO://01</span><span>{labMode ? "SENSORY LAB" : "NEIGHBOR_01"}</span></header>
      {labMode && <div className="lab-flag">LOCAL / NO BACKEND</div>}

      <section className="canvas-wrap" aria-label="Interactive first contact world">
        <Canvas camera={{ position: [0, 2.45, 7.2], fov: 37 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
          <ambientLight intensity={1.65} />
          <directionalLight position={[4, 7, 5]} intensity={2.4} color="#fff9eb" />
          <directionalLight position={[-4, 2, -2]} intensity={0.55} color="#b9c0c5" />
          <World stage={stage} exploring={exploring} postReveal={postReveal} bridgeProgress={bridgeProgress} activeSpace={activeSpace} visited={visited} onInspectO={inspectO} onSelectSpace={selectSpace} />
        </Canvas>
      </section>

      <section className={`narrative${narrativeScrollable ? " narrative-scroll" : ""}`} ref={copyRef} key={modeKey}>
        <p className="eyebrow">
          {mode.kind === "explore" ? activeCopy?.code ?? `${visited.length}/4 VIEWS` : mode.kind === "intro" ? "FIRST CONTACT / FIELD TEST 001" : "SHARED OBJECT / ACTIVE"}
        </p>
        <h1>{headline}</h1>

        {mode.kind === "intro" && mode.stage === "metrics" && <p className="support">SHARED CONTEXT <strong>0</strong></p>}
        {mode.kind === "intro" && mode.stage === "problem" && <p className="support wide">Small physical distance. Unknown social distance. The system cannot infer the difference.</p>}
        {mode.kind === "intro" && mode.stage === "inspect" && <p className="support wide">One node is known. The other stays unknown unless it chooses otherwise.</p>}
        {mode.kind === "explore" && activeCopy && <><p className="support wide">{activeCopy.line}</p><p className="relation-note">{activeCopy.note}</p></>}
        {mode.kind === "explore" && !activeCopy && <p className="support wide">This is not a profile. It is four ways to look at the same gap. Touch any two.</p>}
        {canReveal && <button className="quiet-action" type="button" onClick={() => { playCue("reveal"); setMode({ kind: "reveal" }); }}>change the question →</button>}

        {mode.kind === "reveal" && (
          <div className="reveal-copy">
            <p>It was made to give two people one shared thing that did not exist before.</p>
            <p className="arabic" dir="rtl">أنا عمر، جارك. ولو كان بينا سوء فهم، انطباع، أو حتى مفيش فهم أصلًا — مش هحاول أصلحه من شاشة.</p>
            <p className="arabic muted" dir="rtl">دي بس فرصة إن المرة الجاية ما تبدأش من صفر.</p>
            <div className="reveal-nodes"><span>OMAR</span><i /><span>?</span></div>
            <button className="quiet-action" type="button" onClick={() => { playCue("identify"); setMode({ kind: "identify" }); }}>the other node decides →</button>
          </div>
        )}

        {mode.kind === "identify" && (
          <form className="protocol-form" onSubmit={identify}>
            <p className="support wide">If you want to become the second node, give it any name. No profile. No account. You can also leave it unknown.</p>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onFocus={(event) => keepFieldVisible(event.currentTarget)}
              maxLength={40}
              placeholder="name / nickname"
              autoComplete="off"
              enterKeyHint="done"
            />
            <button type="submit" disabled={!nameDraft.trim()}>enter the field →</button>
          </form>
        )}

        {mode.kind === "consent" && (
          <div className="protocol-panel">
            <div className="reveal-nodes"><span>OMAR</span><i /><span>{mode.recipientName.toUpperCase()}</span></div>
            <p className="support wide">Nothing here assumes what you think or what happens next.</p>
            <div className="choice-grid">
              <button type="button" disabled={submitting} onClick={() => choose("wave", mode.recipientName)}><b>01</b><span>91%</span><small>leave the last 9% for real life</small></button>
              <button type="button" disabled={submitting} onClick={() => { playCue("consent"); setSubmitError(""); setMode({ kind: "message", recipientName: mode.recipientName }); }}><b>02</b><span>SIGNAL</span><small>send one thing through</small></button>
              <button type="button" disabled={submitting} onClick={() => choose("archive", mode.recipientName)}><b>03</b><span>UNCHANGED</span><small>end without owing anything</small></button>
            </div>
            {submitError && <p className="status-note error" role="status">{submitError}</p>}
          </div>
        )}

        {mode.kind === "message" && (
          <form className="protocol-form" onSubmit={(event) => sendMessage(event, mode.recipientName)}>
            <p className="support wide">One sentence is enough. This is not a chat app; it is just a signal before the next real encounter.</p>
            <textarea
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onFocus={(event) => keepFieldVisible(event.currentTarget)}
              maxLength={1000}
              rows={4}
              placeholder="send one thing…"
              enterKeyHint="send"
            />
            <div className="form-actions"><button type="button" onClick={() => setMode({ kind: "consent", recipientName: mode.recipientName })}>← back</button><button type="submit" disabled={submitting || !messageDraft.trim()}>{submitting ? "crossing the gap…" : "send signal →"}</button></div>
            {submitError && <p className="status-note error" role="status">{submitError}</p>}
          </form>
        )}

        {mode.kind === "complete" && (
          <div className="protocol-panel">
            <div className="reveal-nodes"><span>OMAR</span><i className="connected" /><span>{mode.recipientName.toUpperCase()}</span></div>
            <div className="completion-meter">{mode.action === "message" ? "96%" : "91%"}</div>
            <div className="completion-rule" aria-hidden="true" />
            <p className="support wide">{mode.action === "message" ? "A signal crossed. The remaining part still cannot be completed digitally." : "Enough changed for the next meeting not to start from zero. The remaining 9% belongs to real life."}</p>
            <p className="tiny">NEXT ENCOUNTER / IRL</p>
          </div>
        )}

        {mode.kind === "archived" && <div className="protocol-panel"><p className="support wide">No explanation required. No follow-up is owed. The field closes exactly where you left it.</p><p className="tiny">OBJECT 001 / NO CLAIM MADE</p></div>}
      </section>

      <footer className="system-footer"><span>OBJECT 001</span><span>{mode.kind === "complete" ? "IRL REMAINDER" : mode.kind === "archived" ? "UNCHANGED" : mode.kind === "explore" ? `${visited.length}/4 VIEWS` : stage.toUpperCase()}</span></footer>
    </main>
  );
}
