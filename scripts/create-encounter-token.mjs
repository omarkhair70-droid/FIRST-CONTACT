import { createHmac, randomUUID } from "node:crypto";

const secret = process.env.FIRST_CONTACT_SIGNING_SECRET;
if (!secret) {
  console.error("FIRST_CONTACT_SIGNING_SECRET is required.");
  process.exit(1);
}

const id = process.argv[2] || randomUUID();
const artifact = process.argv[3] || "OBJECT-001";
const payload = { id, artifact, issuedAt: Date.now() };
const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
const token = `${encoded}.${signature}`;

console.log(`Encounter: ${id}`);
console.log(`Artifact: ${artifact}`);
console.log(`NFC URL suffix: ?t=${token}`);
