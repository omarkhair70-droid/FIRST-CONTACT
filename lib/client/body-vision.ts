import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export type BodyPoseSignals = {
  confidence: number;
  centerX: number;
  centerY: number;
  openness: number;
  ascent: number;
  shoulderTilt: number;
  proximity: number;
};

export type BodyVisionRuntime = {
  detect(video: HTMLVideoElement, timestampMs: number): BodyPoseSignals | null;
  close(): void;
};

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampSigned(value: number) {
  return Math.min(1, Math.max(-1, value));
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function visibility(point: { visibility?: number }) {
  return point.visibility ?? 1;
}

export async function createBodyVisionRuntime(): Promise<BodyVisionRuntime> {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);

  async function create(delegate?: "GPU") {
    return PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: POSE_MODEL,
        ...(delegate ? { delegate } : {}),
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    });
  }

  let poseLandmarker: PoseLandmarker;

  try {
    poseLandmarker = await create("GPU");
  } catch {
    poseLandmarker = await create();
  }

  return {
    detect(video, timestampMs) {
      const result = poseLandmarker.detectForVideo(video, timestampMs);
      const pose = result.landmarks[0];

      if (!pose || pose.length < 25) return null;

      const leftShoulder = pose[11];
      const rightShoulder = pose[12];
      const leftWrist = pose[15];
      const rightWrist = pose[16];
      const leftHip = pose[23];
      const rightHip = pose[24];

      const confidence =
        (visibility(leftShoulder) +
          visibility(rightShoulder) +
          visibility(leftWrist) +
          visibility(rightWrist) +
          visibility(leftHip) +
          visibility(rightHip)) /
        6;

      if (confidence < 0.35) return null;

      const shoulderWidth = Math.max(
        0.045,
        distance(leftShoulder, rightShoulder),
      );
      const wristSpan = distance(leftWrist, rightWrist);

      const shoulderMidX = (leftShoulder.x + rightShoulder.x) * 0.5;
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) * 0.5;
      const hipMidY = (leftHip.y + rightHip.y) * 0.5;
      const torsoHeight = Math.max(0.08, Math.abs(hipMidY - shoulderMidY));

      const leftRaise = clamp01(
        (leftShoulder.y - leftWrist.y) / Math.max(0.16, torsoHeight * 1.45),
      );
      const rightRaise = clamp01(
        (rightShoulder.y - rightWrist.y) /
          Math.max(0.16, torsoHeight * 1.45),
      );

      const ascent = Math.min(leftRaise, rightRaise);
      const openness = clamp01(
        (wristSpan / shoulderWidth - 1.05) / 2.15,
      );

      const shoulderTilt = clampSigned(
        ((rightShoulder.y - leftShoulder.y) / shoulderWidth) * 1.7,
      );

      const proximity = clamp01((shoulderWidth - 0.13) / 0.27);

      return {
        confidence: clamp01(confidence),
        centerX: clampSigned((0.5 - shoulderMidX) * 2),
        centerY: clampSigned((0.5 - shoulderMidY) * 2),
        openness,
        ascent,
        shoulderTilt,
        proximity,
      };
    },
    close() {
      poseLandmarker.close();
    },
  };
}
