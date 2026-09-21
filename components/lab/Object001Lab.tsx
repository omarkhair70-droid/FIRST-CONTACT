"use client";

import { useState } from "react";

export function Object001Lab() {
  const [flipped, setFlipped] = useState(false);
  const [sleeveOpen, setSleeveOpen] = useState(false);

  return (
    <main className="object-lab">
      <style>{`
        *{box-sizing:border-box}
        .object-lab{--paper:#eee9e1;--deep:#d8d0c5;--ink:#2e2927;--muted:#756b68;--wine:#672f39;--coral:#cf7d68;min-height:100dvh;background:radial-gradient(circle at 58% 25%,rgba(255,255,255,.95),transparent 28%),linear-gradient(145deg,var(--paper),var(--deep));color:var(--ink);font-family:Arial,Helvetica,sans-serif;padding:24px;overflow:auto}
        .object-lab header{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-bottom:18px;border-bottom:1px solid rgba(46,41,39,.14);font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        .object-lab header a{color:inherit;text-decoration:none;border-bottom:1px solid rgba(46,41,39,.35);padding-bottom:3px}
        .lab-layout{width:min(1180px,100%);margin:7vh auto 0;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:clamp(36px,7vw,110px);align-items:center}
        .object-stage{min-height:560px;display:grid;place-items:center;position:relative;perspective:1200px}
        .halo{position:absolute;width:420px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(214,123,98,.19),rgba(214,123,98,.03) 46%,transparent 72%);filter:blur(18px);pointer-events:none}
        .object-wrap{width:min(430px,78vw);aspect-ratio:62/42;position:relative;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.22,.8,.2,1);cursor:pointer;filter:drop-shadow(0 28px 32px rgba(74,49,42,.16))}
        .object-wrap.flipped{transform:rotateY(180deg) rotateZ(-1deg)}
        .face{position:absolute;inset:0;backface-visibility:hidden;border-radius:34px 24px 30px 20px;background:linear-gradient(145deg,#f5f0e8,#ddd5ca);border:1px solid rgba(76,63,59,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.75),inset -12px -14px 24px rgba(96,73,65,.05);overflow:hidden}
        .face:before{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E");mix-blend-mode:multiply;opacity:.38;pointer-events:none}
        .front{padding:13% 12%;display:flex;flex-direction:column;justify-content:space-between}
        .front-top{font-size:9px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#5f5854}
        .front h1{margin:0;font:400 clamp(34px,6vw,68px)/.88 Georgia,'Times New Roman',serif;letter-spacing:-.055em}
        .front-rule{width:56%;height:1px;background:rgba(46,41,39,.55);margin-top:16px}
        .front-bottom{display:flex;justify-content:space-between;align-items:flex-end;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#6f6662}
        .index-dot{width:16px;height:16px;border:1px solid var(--coral);border-radius:50%;position:relative}
        .index-dot:after{content:"";position:absolute;inset:5px;border-radius:50%;background:var(--wine)}
        .back{transform:rotateY(180deg);padding:11% 12%;display:grid;grid-template-columns:1fr auto;align-items:center;gap:24px}
        .back-copy b{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;margin-bottom:11px}
        .back-copy p{margin:0;max-width:210px;color:var(--muted);font:400 14px/1.5 Georgia,'Times New Roman',serif}
        .nfc-mark{width:92px;height:92px;border:1px solid rgba(103,47,57,.42);border-radius:50%;display:grid;place-items:center;position:relative;color:var(--wine);font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        .nfc-mark:before,.nfc-mark:after{content:"";position:absolute;border:1px solid rgba(103,47,57,.3);border-radius:50%}.nfc-mark:before{inset:12px}.nfc-mark:after{inset:24px}
        .back-foot{position:absolute;left:12%;right:12%;bottom:10%;display:flex;justify-content:space-between;gap:10px;color:#766d68;font-size:7px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
        .stage-note{position:absolute;bottom:22px;color:rgba(65,53,50,.55);font-size:8px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
        .controls{display:flex;gap:8px;justify-content:center;margin-top:18px}
        .controls button,.sleeve-toggle{border:1px solid rgba(46,41,39,.16);background:rgba(255,250,245,.4);backdrop-filter:blur(12px);padding:10px 13px;color:var(--ink);cursor:pointer;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
        .spec h2{margin:0 0 18px;font:400 clamp(38px,5vw,72px)/.94 Georgia,'Times New Roman',serif;letter-spacing:-.05em}
        .spec-intro{margin:0 0 28px;color:var(--muted);font:400 15px/1.65 Georgia,'Times New Roman',serif;max-width:470px}
        .spec-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(46,41,39,.14);border-left:1px solid rgba(46,41,39,.14)}
        .spec-grid div{padding:16px;border-right:1px solid rgba(46,41,39,.14);border-bottom:1px solid rgba(46,41,39,.14)}
        .spec-grid small{display:block;color:var(--muted);font-size:7px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
        .spec-grid strong{font:400 15px/1.4 Georgia,'Times New Roman',serif}
        .sleeve-card{margin-top:24px;padding:18px;border:1px solid rgba(46,41,39,.14);background:rgba(248,244,238,.35)}
        .sleeve{position:relative;height:92px;border:1px solid rgba(46,41,39,.2);background:linear-gradient(110deg,rgba(255,255,255,.44),rgba(228,220,210,.55));overflow:hidden;transition:.6s ease;margin-bottom:14px}
        .sleeve:after{content:"";position:absolute;left:0;right:0;top:0;height:46%;border-bottom:1px solid rgba(46,41,39,.12);background:linear-gradient(180deg,rgba(255,255,255,.18),transparent);transform-origin:top;transition:.6s ease}
        .sleeve.open:after{transform:rotateX(78deg)}
        .sleeve-copy{position:absolute;left:16px;bottom:14px;font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5f5753}
        .sleeve-copy span{color:var(--wine)}
        .sleeve-card p{margin:10px 0 0;color:var(--muted);font-size:11px;line-height:1.55}
        .fab-note{margin-top:22px;padding-top:18px;border-top:1px solid rgba(46,41,39,.14);color:var(--muted);font-size:11px;line-height:1.65}
        @media(max-width:850px){.object-lab{padding:16px}.lab-layout{grid-template-columns:1fr;margin-top:4vh;gap:28px}.object-stage{min-height:410px}.spec{padding-bottom:50px}.spec-grid{grid-template-columns:1fr 1fr}.halo{width:82vw;height:54vw}.object-wrap{width:min(370px,82vw)}}
        @media(max-width:520px){.spec-grid{grid-template-columns:1fr}.back{padding:11%;grid-template-columns:1fr auto}.nfc-mark{width:76px;height:76px}.object-stage{min-height:360px}}
      `}</style>

      <header>
        <span>HELLO:// OBJECT 001 / FABRICATION LAB</span>
        <a href="/lab/neighbor-01">recipient preview →</a>
      </header>

      <section className="lab-layout">
        <div>
          <div className="object-stage">
            <div className="halo" aria-hidden="true" />
            <div className={`object-wrap${flipped ? " flipped" : ""}`} onClick={() => setFlipped((v) => !v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped((v) => !v); }} aria-label="Flip OBJECT 001">
              <div className="face front">
                <div className="front-top">HELLO://01 · FIELD OBJECT</div>
                <div>
                  <h1>OBJECT<br/>001</h1>
                  <div className="front-rule" />
                </div>
                <div className="front-bottom"><span>UNRESOLVED / CONNECTION</span><i className="index-dot" /></div>
              </div>
              <div className="face back">
                <div className="back-copy"><b>TAP / ONLY IF CURIOUS</b><p>No app. No automatic message. Opening the piece does not answer anything for you.</p></div>
                <div className="nfc-mark">tap</div>
                <div className="back-foot"><span>NFC / 01</span><span>QR FALLBACK / FINAL TOKEN ONLY</span></div>
              </div>
            </div>
            <div className="stage-note">tap object to inspect front / back</div>
          </div>
          <div className="controls"><button type="button" onClick={() => setFlipped(false)}>front</button><button type="button" onClick={() => setFlipped(true)}>back</button></div>
        </div>

        <div className="spec">
          <p style={{margin:"0 0 10px",fontSize:8,fontWeight:800,letterSpacing:".16em",textTransform:"uppercase",color:"#756b68"}}>PHYSICAL HANDOFF / V1</p>
          <h2>A small object with one job: make curiosity feel safe.</h2>
          <p className="spec-intro">Not a card with a QR code. Not a gift that creates obligation. It should feel like a tiny art object whose digital layer is discovered only after an intentional tap.</p>

          <div className="spec-grid">
            <div><small>size</small><strong>62 × 42 × 4 mm</strong></div>
            <div><small>material</small><strong>off-white cast resin / Jesmonite, or frosted acrylic prototype</strong></div>
            <div><small>surface</small><strong>matte, very fine grain, no glossy plastic feel</strong></div>
            <div><small>accent</small><strong>one restrained clay / wine mark only</strong></div>
            <div><small>NFC</small><strong>NTAG213/215, non-metal object, tag close to back surface</strong></div>
            <div><small>fallback</small><strong>real QR added only after final encounter token exists; never a fake decorative QR</strong></div>
          </div>

          <div className="sleeve-card">
            <div className={`sleeve${sleeveOpen ? " open" : ""}`}>
              <div className="sleeve-copy">NOT URGENT / <span>ONLY IF CURIOUS</span></div>
            </div>
            <button className="sleeve-toggle" type="button" onClick={() => setSleeveOpen((v) => !v)}>{sleeveOpen ? "close sleeve" : "open sleeve"}</button>
            <p>The outer sleeve is the safety cue. It lowers pressure before the mystery starts. No sender name, no romantic symbol, no demand to respond.</p>
          </div>

          <p className="fab-note"><strong>Fabrication rule:</strong> avoid metal near the NFC antenna. Keep the tag under a thin rear skin and test it on multiple phones before final assembly. The QR fallback should remain visually secondary and only be generated after the final signed encounter URL exists.</p>
        </div>
      </section>
    </main>
  );
}
