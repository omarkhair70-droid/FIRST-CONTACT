export type IntroStage = "object" | "context" | "world" | "metrics" | "problem" | "inspect";

export type SpaceId = "build" | "sound" | "object" | "door";
export type ResponseAction = "wave" | "message" | "archive";

export type ExperienceMode =
  | { kind: "intro"; stage: IntroStage }
  | { kind: "explore"; activeSpace: SpaceId | null; visited: SpaceId[] }
  | { kind: "reveal" }
  | { kind: "identify" }
  | { kind: "consent"; recipientName: string }
  | { kind: "message"; recipientName: string }
  | { kind: "complete"; recipientName: string; action: Exclude<ResponseAction, "archive"> }
  | { kind: "archived"; recipientName: string };

export const SPACE_COPY: Record<SpaceId, { label: string; code: string; line: string; note: string }> = {
  build: {
    label: "ANGLE",
    code: "REFRAME / 01",
    line: "The same distance can mean more than one thing.",
    note: "Move around it before deciding what it means.",
  },
  sound: {
    label: "SIGNAL",
    code: "MISSED / 02",
    line: "A signal can exist without being received.",
    note: "Silence is not always absence. Sometimes it is just bad transmission.",
  },
  object: {
    label: "THIRD THING",
    code: "SOCIAL OBJECT / 03",
    line: "Talking through the same thing can be easier than talking directly.",
    note: "This object exists so neither person has to carry the whole first moment alone.",
  },
  door: {
    label: "REMAINDER",
    code: "IRL / 04",
    line: "Some part of this cannot be completed here.",
    note: "If anything real happens, the last part has to belong to real life.",
  },
};
