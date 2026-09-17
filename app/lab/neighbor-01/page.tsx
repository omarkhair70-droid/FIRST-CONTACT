import { RecipientSensoryPreview } from "@/components/lab/RecipientSensoryPreview";

export const metadata = {
  title: "HELLO:// NEIGHBOR_01",
  description: "OBJECT 001 / FIRST CONTACT",
  robots: { index: false, follow: false },
};

export default function Neighbor01SensoryLabPage() {
  return (
    <>
      <style>{`
        .encounter-top-actions button:nth-child(2){display:none!important}
        .encounter-copy{animation:encounterCopyIn .82s cubic-bezier(.2,.75,.22,1) both}
        .encounter-copy .kicker{animation:encounterCopyIn .58s .06s cubic-bezier(.2,.75,.22,1) both}
        .encounter-copy .body,.encounter-copy .whisper{animation:encounterCopyIn .72s .12s cubic-bezier(.2,.75,.22,1) both}
        .choice-panel,.name-form,.signal-form,.end-panel{animation:encounterControlIn .72s .1s cubic-bezier(.2,.75,.22,1) both}
        @keyframes encounterCopyIn{from{opacity:0;transform:translateY(12px);filter:blur(3px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes encounterControlIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:translateY(0)}}
        @media(prefers-reduced-motion:reduce){.encounter-copy,.encounter-copy .kicker,.encounter-copy .body,.encounter-copy .whisper,.choice-panel,.name-form,.signal-form,.end-panel{animation:none!important}}
      `}</style>
      <RecipientSensoryPreview />
    </>
  );
}
