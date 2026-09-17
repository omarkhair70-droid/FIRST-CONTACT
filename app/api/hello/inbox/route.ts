import { timingSafeEqual } from "node:crypto";

import { listResponses } from "@/lib/server/encounter-store";

export const runtime = "nodejs";

function authorized(header: string | null, adminKey: string) {
  if (!header?.startsWith("Bearer ")) return false;
  const received = Buffer.from(header.slice(7));
  const expected = Buffer.from(adminKey);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  const adminKey = process.env.FIRST_CONTACT_ADMIN_KEY;
  if (!adminKey) return Response.json({ error: "HELLO inbox is not configured." }, { status: 503 });
  if (!authorized(request.headers.get("authorization"), adminKey)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const responses = await listResponses();
    return Response.json({ responses });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Inbox storage failed.";
    return Response.json({ error: detail }, { status: 503 });
  }
}
