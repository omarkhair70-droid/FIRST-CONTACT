import { createHmac, timingSafeEqual } from "node:crypto";

export type EncounterTokenPayload = {
  id: string;
  artifact: string;
  issuedAt: number;
};

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function verifyEncounterToken(token: string, secret: string): EncounterTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<EncounterTokenPayload>;
    if (typeof parsed.id !== "string" || typeof parsed.artifact !== "string" || typeof parsed.issuedAt !== "number") return null;
    return { id: parsed.id, artifact: parsed.artifact, issuedAt: parsed.issuedAt };
  } catch {
    return null;
  }
}
