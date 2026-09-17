import { FirstContactExperience } from "@/components/experience/FirstContactExperience";

export const metadata = {
  title: "HELLO:// NEIGHBOR_01 — Sensory Lab",
  robots: { index: false, follow: false },
};

export default function Neighbor01SensoryLabPage() {
  return <FirstContactExperience labMode />;
}
