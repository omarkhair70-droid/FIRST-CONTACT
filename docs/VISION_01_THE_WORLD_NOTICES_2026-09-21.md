# VISION://01 — THE WORLD NOTICES
Date: 2026-09-21
Status: ACTIVE / integrated into BODY://01

## Role

BODY://01 is the living material.
VISION://01 is the perception layer.

The goal is to move from:
"something moved"

to:
"this body is open / rising / tilted / approaching."

VISION is deliberately reusable. It should become a perception primitive that later experiments can attach to different worlds.

## Current on-device pipeline

front camera
  -> MediaPipe Pose Landmarker
  -> pose landmarks
  -> semantic body signals
  -> smoothed shared signal field
  -> shader + transform + procedural audio

Raw camera frames are not uploaded by this experiment.

The current package is:
- @mediapipe/tasks-vision 1.0.1
- pose_landmarker_lite float16 model
- GPU delegate attempted first
- CPU fallback if GPU creation fails

If pose initialization fails entirely, BODY://01 continues in raw motion mode rather than breaking the experience.

## Semantic signals — Slice 01

### openness
Derived from wrist span relative to shoulder width.

Material mapping:
- widens / blooms the form
- adds pearl sheen
- opens the audio spectrum slightly

### ascent
Requires both wrists to rise above their corresponding shoulders.

Material mapping:
- stretches the form vertically
- reveals a brighter internal core
- raises part of the harmonic field

### shoulderTilt
Derived from the shoulder line angle.

Material mapping:
- shears the geometry
- introduces directional fracture
- biases rotation / stereo field

### proximity
Estimated from apparent shoulder width.

Material mapping:
- increases physical presence / scale
- increases rim energy
- slightly increases audio presence

### pose center
Shoulder midpoint is blended into the existing motion centroid.

Material mapping:
- the world can follow the body even during slower semantic poses

## Important separation

Raw motion and semantic pose do different jobs.

Raw motion:
- immediate energy
- memory accumulation
- corruption / recovery dynamics
- movement centroid

Semantic pose:
- meaning of posture
- bloom / ascent / directional fracture / presence

This prevents the piece from becoming a gesture-trigger toy.

## Next slices

### Slice 02 — hands
Add Hand Landmarker only if it creates a relationship worth the extra compute.

Candidate semantics:
- open palm
- closed fist
- pinch
- hand-to-material distance
- left/right independent influence

### Slice 03 — sustained gestures
Add temporal recognition:
- pose held for N milliseconds
- transition into / out of posture
- intentional vs accidental gesture
- gesture hysteresis to prevent flicker

### Slice 04 — silhouette / segmentation
Use body segmentation when the visual idea needs the human silhouette itself as material.

Possible:
- light leaking around the body
- shadow becoming part of the 3D world
- body-shaped negative space
- projection-ready mask

## Performance law

Pose inference is throttled independently from the visual render loop.

The shader can render at device frame rate while semantic pose runs at a lower cadence.

If a phone cannot sustain pose inference:
- keep raw motion alive
- reduce pose cadence
- do not freeze the experience just to preserve AI features

## Design law

VISION does not exist to show skeleton dots.

The person should feel that the world understands their posture without seeing a debug overlay.

Debug landmarks may exist in development tools later, never as the default experience.
