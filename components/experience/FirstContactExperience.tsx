"use client";

import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { World } from "@/components/experience/World";
import { ExperienceMode, IntroStage, type ResponseAction, SPACE_COPY, SpaceId } from "@/lib/encounter";

const INTRO_SEQUENCE: Array<{ stage: IntroStage; at: number }> = [
  { stage: "object", at: 0 },
  { stage: "context", at: 1200 },
  { stage: "world", at: 3200 },
  { stage: "metrics", at: 6500 },
  { stage: "problem", at: 9600 },
  { stage: "inspect", at: 12600 },
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

  @media (max-width: 560px) {
    .narrative { left: 16px; right: 16px; top: calc(72px + env(safe-area-inset-top)); }
    .narrative.narrative-scroll { bottom: calc(54px + env(safe-area-inset-bottom)); }
    h1 { font-size: clamp(34px, 10.5vw, 48px); line-height: .94; }
    .support.wide { font-size: 13px; line-height: 1.6; }
    .reveal-copy { margin-top: 16px; }
    .reveal-copy .arabic { font-size: 17px; line-height: 1.72; }
    .reveal-nodes { margin-top: 20px; gap: 9px; }
    .choice-grid { margin-top: 18px; gap: 8px; }
    .choice-grid button { min-height: 78px; padding: 11px 12px; }
    .protocol-form { gap: 10px; }
    .protocol-form input,
    .protocol-form textarea { padding: 14px 0; }
    .system-header,
    .system-footer { padding-left: 16px; padding-right: 16px; }
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
    .choice-grid button { min-height: 68px; }
  }
`;

export function FirstContactExperience() {
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
    gsap.fromTo(copyRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", overwrite: true });
  }, [mode]);

  const stage: IntroStage = mode.kind === "intro" ? mode.stage : "inspect";
  const exploring = mode.kind === "explore";
  const postReveal = !["intro", "explore"].includes(mode.kind);
  const activeSpace = mode.kind === "explore" ? mode.activeSpace : null;
  const visited = mode.kind === "explore" ? mode.visited : [];
  const bridgeProgress = mode.kind === "complete" ? (mode.action === "message" ? 1 : 0.5) : 0;
  const narrativeScrollable = ["reveal", "identify", "consent", "message", "complete", "archived"].includes(mode.kind);

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
    if (mode.kind === "identify") return "Identify this node.";
    if (mode.kind === "consent") return "Connection requires consent.";
    if (mode.kind === "message") return "Send something through.";
    if (mode.kind === "complete") return mode.action === "message" ? "Bridge complete." : "Next encounter: IRL.";
    if (mode.kind === "archived") return "Encounter archived.";
    if (mode.kind === "explore") return activeCopy?.label ?? "NODE O";
    switch (mode.stage) {
      case "object": return "OBJECT 001";
      case "context": return "establishing context";
      case "world": return "HELLO:// ENCOUNTER 001";
      case "metrics": return "PROXIMITY HIGH";
      case "problem": return "This appears to be a design problem.";
      case "inspect": return "inspect node O";
    }
  }, [activeCopy, mode]);

  const keepFieldVisible = useCallback((element: HTMLElement) => {
    window.setTimeout(() => element.scrollIntoView({ block: "center", behavior: "smooth" }), 180);
  }, []);

  async function submitResponse(type: ResponseAction, recipientName: string, message?: string) {
    setSubmitError("");
    const token = new URLSearchParams(window.location.search).get("t") ?? "";
    if (!token) {
      setSubmitError("OBJECT 001 is in preview mode. Arm the NFC URL with a signed token first.");
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
    setMode({ kind: "consent", recipientName: name });
  }

  async function choose(type: "wave" | "archive", recipientName: string) {
    const saved = await submitResponse(type, recipientName);
    if (!saved) return;
    setMode(type === "archive" ? { kind: "archived", recipientName } : { kind: "complete", recipientName, action: "wave" });
  }

  async function sendMessage(event: FormEvent, recipientName: string) {
    event.preventDefault();
    const message = messageDraft.trim();
    if (!message) return;
    const saved = await submitResponse("message", recipientName, message);
    if (saved) setMode({ kind: "complete", recipientName, action: "message" });
  }

  const modeKey = mode.kind === "intro" ? `intro-${mode.stage}` : mode.kind === "explore" ? `explore-${activeSpace ?? "root"}` : mode.kind;

  return (
    <main className="experience-shell">
      <style>{MOBILE_CLOSURE_STYLES}</style>
      <div className="grain" aria-hidden="true" />
      <header className="system-header"><span>HELLO://01</span><span>NEIGHBOR_01</span></header>

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
          {mode.kind === "explore" ? activeCopy?.code ?? `${visited.length}/4 DISCOVERED` : mode.kind === "intro" ? "FIRST CONTACT PROTOCOL" : "CONNECTION PROTOCOL"}
        </p>
        <h1>{headline}</h1>

        {mode.kind === "intro" && mode.stage === "metrics" && <p className="support">INTRODUCTIONS <strong>0</strong></p>}
        {mode.kind === "intro" && mode.stage === "inspect" && <p className="support">Touch the dark node. The rest is not a menu.</p>}
        {mode.kind === "explore" && activeCopy && <p className="support wide">{activeCopy.line}</p>}
        {mode.kind === "explore" && !activeCopy && <p className="support wide">Four fragments. Pick any two. Curiosity should do the rest.</p>}
        {canReveal && <button className="quiet-action" type="button" onClick={() => setMode({ kind: "reveal" })}>enough. continue →</button>}

        {mode.kind === "reveal" && (
          <div className="reveal-copy">
            <p>Okay. This accidentally became a portfolio.</p>
            <p className="arabic" dir="rtl">أنا عمر، جارك. وكان ممكن أقول هاي زي بني آدم طبيعي.</p>
            <p className="arabic muted" dir="rtl">بس للأسف دي كانت هتبقى طريقة مملة جدًا.</p>
            <div className="reveal-nodes"><span>OMAR</span><i /><span>?</span></div>
            <button className="quiet-action" type="button" onClick={() => setMode({ kind: "identify" })}>identify node ? →</button>
          </div>
        )}

        {mode.kind === "identify" && (
          <form className="protocol-form" onSubmit={identify}>
            <p className="support wide">No profile. No account. Just the name you want this little system to know you by.</p>
            <input
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onFocus={(event) => keepFieldVisible(event.currentTarget)}
              maxLength={40}
              placeholder="name / nickname"
              autoComplete="off"
              enterKeyHint="done"
            />
            <button type="submit" disabled={!nameDraft.trim()}>continue →</button>
          </form>
        )}

        {mode.kind === "consent" && (
          <div className="protocol-panel">
            <div className="reveal-nodes"><span>OMAR</span><i /><span>{mode.recipientName.toUpperCase()}</span></div>
            <p className="support wide">You control what happens next.</p>
            <div className="choice-grid">
              <button type="button" disabled={submitting} onClick={() => choose("wave", mode.recipientName)}><b>01</b><span>WAVE</span><small>say hi next time</small></button>
              <button type="button" disabled={submitting} onClick={() => { setSubmitError(""); setMode({ kind: "message", recipientName: mode.recipientName }); }}><b>02</b><span>MESSAGE</span><small>send something now</small></button>
              <button type="button" disabled={submitting} onClick={() => choose("archive", mode.recipientName)}><b>03</b><span>ARCHIVE</span><small>leave it here</small></button>
            </div>
            {submitError && <p className="status-note error" role="status">{submitError}</p>}
          </div>
        )}

        {mode.kind === "message" && (
          <form className="protocol-form" onSubmit={(event) => sendMessage(event, mode.recipientName)}>
            <p className="support wide">This goes to Omar&apos;s private HELLO inbox. No Instagram redirect required.</p>
            <textarea
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
              onFocus={(event) => keepFieldVisible(event.currentTarget)}
              maxLength={1000}
              rows={4}
              placeholder="say anything…"
              enterKeyHint="send"
            />
            <div className="form-actions"><button type="button" onClick={() => setMode({ kind: "consent", recipientName: mode.recipientName })}>← back</button><button type="submit" disabled={submitting || !messageDraft.trim()}>{submitting ? "sending…" : "send through →"}</button></div>
            {submitError && <p className="status-note error" role="status">{submitError}</p>}
          </form>
        )}

        {mode.kind === "complete" && (
          <div className="protocol-panel">
            <div className="reveal-nodes"><span>OMAR</span><i className="connected" /><span>{mode.recipientName.toUpperCase()}</span></div>
            <p className="support wide">{mode.action === "message" ? "Connection saved. Your message made it through." : "Half the bridge stays unfinished on purpose. The rest happens when you meet."}</p>
            <p className="tiny">OBJECT 001 / CONNECTION ACCEPTED</p>
          </div>
        )}

        {mode.kind === "archived" && <div className="protocol-panel"><p className="support wide">Nothing else will be asked. The encounter ends here.</p><p className="tiny">OBJECT 001 / CLOSED CLEANLY</p></div>}
      </section>

      <footer className="system-footer"><span>OBJECT 001</span><span>{mode.kind === "complete" ? "CONNECTED" : mode.kind === "archived" ? "ARCHIVED" : mode.kind === "explore" ? `${visited.length}/4` : stage.toUpperCase()}</span></footer>
    </main>
  );
}
