export const metadata = {
  title: "HELLO:// OBJECT 001 — 1:1 Print Sheet",
  robots: { index: false, follow: false },
};

export default function Object001PrintSheetPage() {
  return (
    <main className="sheet">
      <style>{`
        *{box-sizing:border-box}
        html,body{margin:0;background:#d7d2cb;color:#2e2927;font-family:Arial,Helvetica,sans-serif}
        .sheet{min-height:100vh;padding:24px}
        .toolbar{max-width:186mm;margin:0 auto 18px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        .print-command{border:1px solid rgba(46,41,39,.25);background:#f5f0e8;padding:10px 14px;white-space:nowrap}
        .paper{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:14mm;box-shadow:0 20px 60px rgba(0,0,0,.14)}
        .paper-head{display:flex;justify-content:space-between;gap:10mm;padding-bottom:6mm;border-bottom:.25mm solid #d7d0c8;font-size:7pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
        .instructions{margin:7mm 0 10mm;max-width:132mm;color:#716862;font:9pt/1.55 Georgia,'Times New Roman',serif}
        .row{display:flex;gap:14mm;align-items:flex-start;margin:0 0 13mm}
        .sample-wrap{position:relative;padding:4mm}
        .crop{position:absolute;width:4mm;height:4mm;border-color:#8d837c;opacity:.7}
        .crop.tl{left:0;top:0;border-left:.25mm solid;border-top:.25mm solid}.crop.tr{right:0;top:0;border-right:.25mm solid;border-top:.25mm solid}.crop.bl{left:0;bottom:0;border-left:.25mm solid;border-bottom:.25mm solid}.crop.br{right:0;bottom:0;border-right:.25mm solid;border-bottom:.25mm solid}
        .object-card{width:62mm;height:42mm;border:.25mm solid #bfb6ad;border-radius:4mm 3mm 3.6mm 2.5mm;background:linear-gradient(145deg,#f4efe7,#e3dbcf);position:relative;overflow:hidden;color:#302b29}
        .object-card:after{content:"";position:absolute;inset:0;background-image:radial-gradient(circle at 20% 18%,rgba(255,255,255,.7),transparent 23%),linear-gradient(120deg,transparent,rgba(98,73,64,.03));pointer-events:none}
        .front{padding:5.4mm 6mm;display:flex;flex-direction:column;justify-content:space-between}
        .front .top{font-size:5pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#645c57}
        .front h1{margin:0;font:400 26pt/.82 Georgia,'Times New Roman',serif;letter-spacing:-.055em}
        .front .rule{width:31mm;height:.25mm;margin-top:2.6mm;background:#4d4743}
        .front .foot{display:flex;align-items:flex-end;justify-content:space-between;font-size:4.7pt;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#6e6560}
        .dot{width:3.6mm;height:3.6mm;border:.3mm solid #cf7d68;border-radius:50%;position:relative}.dot:after{content:"";position:absolute;inset:1.15mm;border-radius:50%;background:#672f39}
        .back{padding:5mm 5.8mm;display:grid;grid-template-columns:1fr auto;gap:4mm;align-items:center}
        .back strong{display:block;font-size:6pt;letter-spacing:.15em;text-transform:uppercase;margin-bottom:2mm}
        .back p{margin:0;max-width:33mm;color:#706762;font:6.8pt/1.45 Georgia,'Times New Roman',serif}
        .nfc{width:15mm;height:15mm;border:.25mm solid rgba(103,47,57,.55);border-radius:50%;display:grid;place-items:center;font-size:4.5pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#672f39;position:relative}.nfc:before,.nfc:after{content:"";position:absolute;border:.2mm solid rgba(103,47,57,.32);border-radius:50%}.nfc:before{inset:2mm}.nfc:after{inset:4mm}
        .back-foot{position:absolute;left:5.8mm;right:5.8mm;bottom:3.6mm;display:flex;justify-content:space-between;font-size:4pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#776e68}
        .label{margin:2mm 0 0 4mm;color:#746b65;font-size:5.5pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        .sleeve-wrap{margin-top:2mm}
        .sleeve{width:70mm;height:49mm;border:.25mm solid #b9b0a8;background:linear-gradient(110deg,rgba(244,240,233,.72),rgba(223,215,205,.72));position:relative}
        .sleeve:before{content:"";position:absolute;left:0;right:0;top:0;height:23mm;border-bottom:.25mm solid #ccc3ba;background:linear-gradient(180deg,rgba(255,255,255,.32),transparent)}
        .sleeve span{position:absolute;left:6mm;bottom:6mm;font-size:5.6pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.sleeve em{font-style:normal;color:#672f39}
        .scale-check{margin-top:10mm;border-top:.25mm solid #ddd6ce;padding-top:6mm;display:flex;align-items:center;gap:6mm;color:#746b65;font-size:6.5pt;line-height:1.45}
        .scale-line{width:50mm;height:2mm;border-left:.25mm solid #333;border-right:.25mm solid #333;border-top:.25mm solid #333;flex:none}
        .notes{margin-top:10mm;display:grid;grid-template-columns:1fr 1fr;gap:7mm;color:#746b65;font-size:6.4pt;line-height:1.5}.notes b{color:#302b29}
        @page{size:A4 portrait;margin:0}
        @media print{
          html,body{background:#fff}
          .toolbar{display:none!important}
          .sheet{padding:0}
          .paper{margin:0;box-shadow:none;width:210mm;height:297mm;min-height:297mm;break-after:page}
        }
      `}</style>

      <div className="toolbar">
        <span>OBJECT 001 / 1:1 prototype sheet · print at 100% / actual size</span>
        <span className="print-command">Ctrl/Cmd + P</span>
      </div>

      <section className="paper">
        <div className="paper-head"><span>HELLO://01 · OBJECT 001</span><span>PHYSICAL PROTOTYPE / A4 / 1:1</span></div>
        <p className="instructions">Print at <strong>100% / Actual Size</strong>. Disable “Fit to page”. First cut the paper mockup, hold it, read it at arm’s length, then use it as a scale reference for acrylic/resin fabrication. The QR is intentionally absent until the final signed encounter URL exists.</p>

        <div className="row">
          <div>
            <div className="sample-wrap">
              <i className="crop tl"/><i className="crop tr"/><i className="crop bl"/><i className="crop br"/>
              <div className="object-card front">
                <div className="top">HELLO://01 · FIELD OBJECT</div>
                <div><h1>OBJECT<br/>001</h1><div className="rule"/></div>
                <div className="foot"><span>UNRESOLVED / CONNECTION</span><i className="dot"/></div>
              </div>
            </div>
            <p className="label">FRONT / 62 × 42 mm</p>
          </div>

          <div>
            <div className="sample-wrap">
              <i className="crop tl"/><i className="crop tr"/><i className="crop bl"/><i className="crop br"/>
              <div className="object-card back">
                <div><strong>TAP / ONLY IF CURIOUS</strong><p>No app. No automatic message. Opening the piece answers nothing for you.</p></div>
                <div className="nfc">tap</div>
                <div className="back-foot"><span>NFC / 01</span><span>QR / FINAL TOKEN ONLY</span></div>
              </div>
            </div>
            <p className="label">BACK / 62 × 42 mm</p>
          </div>
        </div>

        <div className="sleeve-wrap">
          <div className="sample-wrap" style={{display:"inline-block"}}>
            <i className="crop tl"/><i className="crop tr"/><i className="crop bl"/><i className="crop br"/>
            <div className="sleeve"><span>NOT URGENT / <em>ONLY IF CURIOUS</em></span></div>
          </div>
          <p className="label">SLEEVE SCALE MOCK / 70 × 49 mm</p>
        </div>

        <div className="scale-check"><div className="scale-line"/><span>This ruler is exactly <b>50 mm</b> when printing is correctly scaled. Measure it before trusting the prototype.</span></div>

        <div className="notes">
          <div><b>Prototype A:</b> cut these fronts/backs, sandwich around ~4 mm foam board or scrap acrylic, and evaluate hand feel + legibility before committing to a cast.</div>
          <div><b>NFC:</b> use a real NTAG213/215 in the physical prototype, but keep the print sheet itself token-free. Final encode comes only after production URL + signed token are locked.</div>
        </div>
      </section>
    </main>
  );
}
