# NEIGHBOR_01 — Real Device + Physical QA Gate

This is the final pre-merge gate for the first real OBJECT 001 deployment.

The creative branch is allowed to remain a lab until every recipient-facing item below passes. Do not merge merely because CI is green.

## A. Recipient route — no token / preview behavior

Open the creative branch root without `?t=`.

Expected:
- no `LAB`, `preview`, debug, backend, token, or developer language is visible
- title reads `HELLO:// NEIGHBOR_01`
- opening state is OBJECT 001
- first intentional touch starts audio when browser policy permits it
- experience remains fully usable if sound is muted or Web Audio is unavailable
- no network response is required to reach the local endings

## B. Emotional sequence

Run this exact order once without using the dev lab:

`OBJECT → GAP → ANGLE → SIGNAL → THIRD THING → REVEAL → NAME → CHOICE`

Check:
- OBJECT feels curious rather than ominous
- GAP reads immediately as two nearby-but-unresolved presences
- ANGLE begins visibly misaligned and does not resolve until recipient touch
- ANGLE copy says `one angle ≠ the whole story`; it must not imply a rejection or invent a specific misunderstanding
- SIGNAL visibly stalls before recipient touch and crosses only after recipient action
- THIRD THING remains embryonic/closed until recipient touch, then opens as a porcelain-organic shared object
- reveal is early and clear enough that mystery never becomes prolonged anonymity
- recipient name is never assumed; the art changes only after voluntary entry
- choice state feels like agency, not a conversion funnel

## C. End states

### 91%
- ring clearly stops short of closure
- final sonic harmony remains unresolved
- copy does not imply that a relationship has already begun
- next real-world encounter is suggested without demanding it

### SIGNAL / 96%
- message field is comfortable with mobile keyboard open
- short message can be submitted without layout jumping off-screen
- 96% still feels incomplete; digital message is not framed as the relationship itself

### UNCHANGED
- warmth recedes cleanly
- no guilt copy, retry prompt, or manipulative animation appears
- ending is dignified and final enough that the recipient can close the phone immediately

## D. Signed OBJECT response path

Generate a fresh signed token with `scripts/create-encounter-token.mjs` and use the complete URL it prints.

Test all three actions separately with fresh encounter IDs:
- 91% → stored as `wave`
- SIGNAL → stored as `message` with exact message text
- UNCHANGED → stored as `archive`

Verify each appears in the owner inbox/storage exactly once.

Failure behavior:
- if storage/network fails, remain on the choice state
- show only a small retryable signal-crossing error
- do not fake a completed 91/96/archive state

## E. Mobile visual pass

Minimum devices:
- one Android phone with NFC
- one additional narrow/small viewport
- one iPhone/Safari if available, even if haptics/NFC behavior differs

For each:
- portrait at first load
- safe-area/header not clipped
- no accidental horizontal scroll
- headline does not cover the primary 3D subject
- buttons/inputs are comfortably tappable
- keyboard does not hide name or signal actions
- no browser zoom caused by small form font
- reduced-motion mode remains understandable
- device rotation does not permanently break the scene after returning to portrait

## F. Sound + haptics

Sound:
- starts only after an intentional gesture
- starts quiet; does not jump in volume
- room/air layer reads as atmosphere rather than obvious white noise
- ceramic ticks are tactile accents, not UI beeps
- sound progression becomes warmer through THIRD THING / NAME
- 91% intentionally lacks the resolving upper note

Haptics:
- absence of vibration support never blocks anything
- haptics are rare enough to retain meaning
- ANGLE, SIGNAL, THIRD THING, NAME, and 91% feel distinct but restrained

## G. OBJECT 001 — paper scale prototype

Open `/lab/object-001/print` and print at `100% / Actual Size`.

Before cutting:
- measure the 50 mm scale check with a real ruler
- reject the print if it is not 50 mm

After cutting:
- front/back piece measures 62 × 42 mm
- smallest type is readable in ordinary indoor light
- object does not feel like a business card or ticket
- asymmetry feels authored, not like a print/cut mistake
- sleeve copy is readable but not shouty

## H. NFC physical prototype

Prototype before final casting.

- use NTAG213/215 or equivalent URL-capable NFC tag
- keep metal away from antenna
- test tag behind intended rear material thickness
- test with multiple phone antenna positions
- tap opens the exact signed production encounter URL
- repeated tap does not trigger any automatic message/action by itself
- QR fallback scans reliably but remains visually secondary

Never fabricate the final QR using a temporary lab/preview URL.

## I. Handoff simulation

Before giving the object to the real recipient, simulate the full handoff with another person who has not seen the project.

Give them only the sleeve/object — no verbal explanation.

Observe, without coaching:
- do they understand that opening/tapping is optional?
- do they know where to tap?
- does the first screen feel connected to the physical object they just held?
- do they pause at ANGLE / THIRD THING for the intended reason, or because controls are unclear?
- do they understand the reveal without needing technical explanation?
- do they understand that UNCHANGED is a legitimate exit?

Do not optimize for whether they “like Omar.” Optimize for whether the encounter is clear, safe, memorable, and leaves agency intact.

## J. Merge gate

Merge PR #4 only after:
- CI lint green
- CI build green
- latest recipient route visually reviewed on a real phone
- signed response path verified end-to-end
- 1:1 paper prototype physically inspected
- NFC prototype tap range verified
- final production URL chosen
- final signed OBJECT 001 token generated
- final QR generated from that exact URL and tested

After merge, create the final physical OBJECT 001 and encode the same URL into NFC and QR. No further conceptual redesign should happen after final fabrication unless a real QA failure requires it.
