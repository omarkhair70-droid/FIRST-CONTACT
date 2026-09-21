import type { Metadata } from "next";
import Body01Experiment from "../../../components/lab/Body01Experiment";

export const metadata: Metadata = {
  title: "BODY://01 — FALLEN LIGHT",
  description:
    "Creative Technology Lab — body motion becomes memory, material instability and reactive sound.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Body01Page() {
  return <Body01Experiment />;
}
