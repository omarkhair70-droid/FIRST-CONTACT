import type { Metadata } from "next";
import Body01Experiment from "../../../components/lab/Body01Experiment";

export const metadata: Metadata = {
  title: "BODY://01 — NO BUTTONS",
  description: "Creative Technology Lab — body motion becomes shader matter and sound.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Body01Page() {
  return <Body01Experiment />;
}
