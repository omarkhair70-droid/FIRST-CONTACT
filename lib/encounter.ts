export type IntroStage = "object" | "context" | "world" | "metrics" | "problem" | "inspect";

export type SpaceId = "build" | "sound" | "object" | "door";

export type ExperienceMode =
  | { kind: "intro"; stage: IntroStage }
  | { kind: "explore"; activeSpace: SpaceId | null; visited: SpaceId[] }
  | { kind: "reveal" };

export const SPACE_COPY: Record<SpaceId, { label: string; code: string; line: string }> = {
  build: {
    label: "BUILD",
    code: "NOVA / TESWA",
    line: "He has a habit of turning “what if?” into things that actually run.",
  },
  sound: {
    label: "SOUND",
    code: "WZ / 2026",
    line: "Sometimes he builds because silence gets boring.",
  },
  object: {
    label: "OBJECT",
    code: "FC / MATERIAL",
    line: "Sometimes he doesn't know whether he's building software or making an object.",
  },
  door: {
    label: "DOOR",
    code: "LOCK / 02 NODES",
    line: "Locked. Requires another node.",
  },
};
