# OBJECT 001 — Fabrication + Handoff Spec

Status: design-locked enough for prototype fabrication; final QR/token intentionally deferred.

## Role

OBJECT 001 is the physical threshold into NEIGHBOR_01. It is not a gift and not a card. Its job is to create safe curiosity, then get out of the way.

The emotional sequence begins before the phone:

1. notice a small unfamiliar object
2. read a low-pressure safety cue
3. choose whether to touch/open/tap
4. discover the digital encounter
5. keep full agency over whether anything continues

## Physical form

- Target size: **62 × 42 × 4 mm**
- Softly asymmetric rounded rectangle, not a perfect business-card slab
- Off-white / chalk / porcelain family
- Matte micro-texture; avoid glossy injection-molded appearance
- One restrained clay/coral/wine accent only
- No hearts, roses, sender name, portrait, romantic copy, or ornamental QR on the front

### Front

- `HELLO://01 · FIELD OBJECT`
- `OBJECT 001`
- one hairline rule
- `UNRESOLVED / CONNECTION`
- one tiny index mark / dot

The front should read like a found art object, not an invitation card.

### Back

Primary copy:

`TAP / ONLY IF CURIOUS`

Secondary principle:

`No app. No automatic message.`

NFC mark should be visually legible but quiet. QR is a fallback only and should not dominate the composition.

## Sleeve / handoff cue

Use a translucent or off-white vellum/paper sleeve. Outside copy:

`NOT URGENT / ONLY IF CURIOUS`

Purpose: reduce threat/obligation before mystery begins. The sleeve is not decoration; it is part of the consent architecture.

Do not write a long note on the sleeve. Do not add a demand to reply.

## Material path

### Prototype A — fastest

- 3 mm frosted/off-white acrylic or matte 3D-printed resin body
- printed or vinyl front/back graphics
- NFC sticker/tag adhered inside rear layer
- use this only to validate proportions, NFC range, hand feel, and typography

### Prototype B — intended final feel

- cast resin / Jesmonite-like mineral composite / similar non-metal cast material
- hand-sanded matte finish
- graphics transferred, engraved, screen printed, or applied with a very thin durable layer
- NFC encapsulated near rear face

Avoid metal bodies, metallic foil directly over the tag, or thick dense material over the antenna.

## NFC

- NTAG213 or NTAG215 is sufficient for a URL payload
- keep antenna close to the rear surface; target <= 1.5 mm cover where fabrication allows
- test on at least several phones with different NFC antenna positions
- encode only the final signed encounter URL after the digital flow is locked
- do not encode a temporary lab URL into the final object

## QR fallback

Do not place a fake or placeholder QR on the final physical object.

The final QR should be generated only after the signed encounter URL exists. Keep it secondary to NFC and large/high-contrast enough for reliable scanning. The lab mockup deliberately labels the QR area as `FINAL TOKEN ONLY` instead of drawing a decorative fake code.

## Delivery principles

- no covert placement that implies surveillance
- no wording that suggests the recipient is being watched or tracked
- no requirement to respond
- no visible sender identity required on the exterior, but the experience reveals Omar early enough that mystery does not become prolonged anonymity
- the recipient can stop cleanly at any point

## Digital handoff

Physical tap opens the recipient experience. The digital emotional arc is:

`OBJECT → GAP → ANGLE → SIGNAL → THIRD THING → REVEAL → VOLUNTARY NAME → CHOICE → 91% / 96% / UNCHANGED`

ANGLE, SIGNAL, and THIRD THING are causally driven by recipient touch. They should not self-resolve before interaction.

The final screen never claims that a relationship has begun or that a response is owed. The intended carry-over is simply that the next real encounter no longer starts from zero.

## Lab routes

- recipient preview: `/lab/neighbor-01`
- internal sensory controls: `/lab/neighbor-01/dev`
- physical artifact fabrication lab: `/lab/object-001`

## Final fabrication gate

Do not manufacture the final object until all of the following are true:

- real-device mobile visual review is complete
- NFC tap range tested with prototype
- final production encounter URL/token exists
- real QR fallback generated and tested
- typography is legible at actual 62 × 42 mm scale
- physical material does not attenuate NFC excessively
- sleeve/hand-off language feels calm rather than ominous

At that point create OBJECT 001 as the first real deployment artifact, not as a generic reusable marketing object.
