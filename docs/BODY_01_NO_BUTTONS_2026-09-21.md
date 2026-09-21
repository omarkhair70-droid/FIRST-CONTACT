# BODY://01 — NO BUTTONS
Status: ACTIVE / Experiment 01
Branch: lab/creative-tech-track-body01-20260921

## Question

Can a person open a URL, allow the camera once, and then stop "using a website" entirely?

## Experience

Initial boundary:
- One minimal action exists only to satisfy browser camera/audio permission requirements.
- The page states clearly that camera frames are analyzed locally for motion.
- No recording/upload is required for this experiment.

After permission:
- Conventional controls disappear.
- The camera image becomes a faint atmospheric layer, not the UI.
- A living 3D form occupies the screen.
- The person's movement changes the form.
- Left/right motion biases the form and stereo field.
- Vertical movement changes the form's posture.
- Motion intensity changes displacement, pulse and sound energy.
- Stillness lets the material settle.

The interaction should be discoverable by moving, not explained by a tutorial.

## Slice 01 — raw embodied signal

No ML dependency yet.

Pipeline:

camera
  -> low-resolution frame
  -> luminance difference against prior frame
  -> motion energy + motion centroid
  -> smoothed signal
  -> shader uniforms + audio parameters

This is intentionally primitive and useful: it proves the architecture before semantic body tracking.

## Slice 02 — semantic body

Upgrade raw motion with MediaPipe / equivalent on-device vision:
- pose landmarks
- wrists / hands
- shoulder line
- head position
- gesture states

Possible mappings:
- hand opening blooms the material
- shoulder angle changes gravity
- distance from camera changes depth / sound
- both arms raised triggers a state transition

## Slice 03 — spatial sound + memory

- richer procedural sound
- positional/depth mapping
- short-lived traces of previous movement
- no conventional controls after entry

## Technical guardrails

- HTTPS required for camera access in production.
- getUserMedia permission is explicit.
- raw frames stay client-side in Slice 01.
- stop MediaStream tracks on unmount.
- audio starts only after user activation.
- render/analysis rate is bounded for phone thermals.
- provide graceful error/fallback state if camera is denied/unavailable.

## Completion gate

BODY://01 is not complete because it builds.

It is complete when:
- camera permission works on a real phone
- real body movement visibly changes the 3D material
- stillness visibly settles it
- left/right location is perceptible in motion and sound
- performance is stable enough for a sustained session
- no accidental conventional UI remains after entry
- denied camera produces a clean fallback
