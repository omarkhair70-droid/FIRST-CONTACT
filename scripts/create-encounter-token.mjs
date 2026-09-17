import { createHmac, randomUUID } from "node:crypto";

const secret = process.env.FIRST_CONTACT_SIGNING_SECRET;
if (!secret) {
  console.error("FIRST_CONTACT_SIGNING_SECRET is required.");
  process.exit(1);
}

const id = process.argv[2] || randomUUID();
const artifact = process.argv[3] || "OBJECT-001";
const publicUrl = process.argv[4] || process.env.FIRST_CONTACT_PUBLIC_URL || "https://firstcontact-rho.vercel.app";
const payload = { id, artifact, issuedAt: Date.now() };
const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
const token = `${encoded}.${signature}`;
const url = new URL(publicUrl);
url.searchParams.set("t", token);

console.log(`Encounter: ${id}`);
console.log(`Artifact: ${artifact}`);
console.log(`Public base: ${url.origin}${url.pathname}`);
console.log(`NFC / QR URL: ${url.toString()}`);
console.log(`Token: ${token}`);
