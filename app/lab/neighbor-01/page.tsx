import { RecipientSensoryPreview } from "@/components/lab/RecipientSensoryPreview";

export const metadata = {
  title: "HELLO:// NEIGHBOR_01 — Recipient Preview",
  robots: { index: false, follow: false },
};

export default function Neighbor01SensoryLabPage() {
  return (
    <>
      <style>{`.encounter-top-actions button:nth-child(2){display:none!important}`}</style>
      <RecipientSensoryPreview />
    </>
  );
}
