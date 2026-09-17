# FIRST CONTACT

`HELLO:// NEIGHBOR_01` is a physical-digital first-contact protocol. OBJECT 001 opens a mobile-first experience through NFC, with QR as a fallback.

This repository is the production application, not a disposable prototype.

## Current journey

1. OBJECT 001 boot
2. Two neighboring structures appear
3. `PROXIMITY HIGH / INTRODUCTIONS 0`
4. Interactive NODE O
5. BUILD / SOUND / OBJECT / DOOR fragments
6. Omar source reveal
7. Recipient identifies their node with a name or nickname
8. Explicit consent: WAVE / MESSAGE / ARCHIVE
9. The bridge changes according to the chosen connection
10. Responses persist to the private HELLO inbox

## Stack

- Next.js 16 + React 19
- React Three Fiber + Drei + Three.js
- GSAP
- TypeScript
- Upstash Redis REST for durable response storage
- HMAC-signed encounter tokens for physical OBJECT URLs

## Local run

```bash
npm install
npm run dev
```

## Production environment

Copy `.env.example` and configure the same values in Vercel:

- `FIRST_CONTACT_SIGNING_SECRET` — long random secret used to sign OBJECT URLs.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — durable encounter storage.
- `FIRST_CONTACT_ADMIN_KEY` — separate key protecting `/hello/inbox`.
- `FIRST_CONTACT_DELIVERY_WEBHOOK_URL` — optional duplicate delivery after Redis has saved the response.

## Create the physical OBJECT 001 URL

Use the exact same `FIRST_CONTACT_SIGNING_SECRET` that exists in Vercel:

```bash
FIRST_CONTACT_SIGNING_SECRET="..." npm run token:create -- neighbor-01 OBJECT-001
```

The script prints an `?t=...` suffix. Append it to the deployed FIRST CONTACT URL and program that full URL into the NFC tag. The token contains only an encounter id, artifact id and issue timestamp; it contains no address, apartment, device id or recipient profile.

## Private inbox

Open `/hello/inbox` on the deployed site and enter `FIRST_CONTACT_ADMIN_KEY`. The key is sent only as an Authorization header to the server endpoint and is not hard-coded in the frontend.

## Build gate

```bash
npm run lint
npm run build
```

## Product rules

- No covert location/device/contact collection.
- No real apartment/floor reconstruction.
- Recipient controls whether a connection proceeds.
- `ARCHIVE` ends an encounter without nudges or retries.
- Physical object and digital world are one product, not a QR landing page.
