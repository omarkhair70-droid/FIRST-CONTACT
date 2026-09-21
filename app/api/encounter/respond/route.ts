import { randomUUID } from "node:crypto";

import type { ResponseAction } from "@/lib/encounter";
import { appendResponse, type StoredResponse } from "@/lib/server/encounter-store";
import { verifyEncounterToken } from "@/lib/server/encounter-token";

export const runtime = "nodejs";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const secret = process.env.FIRST_CONTACT_SIGNING_SECRET;
  if (!secret) return Response.json({ error: "Encounter signing is not configured." }, { status: 503 });

  const token = request.headers.get("x-encounter-token") ?? "";
  const encounter = verifyEncounterToken(token, secret);
  if (!encounter) return Response.json({ error: "This OBJECT token is invalid." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid response body." }, { status: 400 });

  const recipientName = cleanText(body.recipientName, 40);
  const type = body.type as ResponseAction;
  if (!(["wave", "message", "archive"] as ResponseAction[]).includes(type)) {
    return Response.json({ error: "Unknown response type." }, { status: 400 });
  }

  const message = cleanText(body.message, 1000);
  if (type === "message" && !message) return Response.json({ error: "Write something first." }, { status: 400 });

  const entry: StoredResponse = {
    id: randomUUID(),
    encounterId: encounter.id,
    artifactId: encounter.artifact,
    recipientName,
    type,
    ...(message ? { message } : {}),
    createdAt: new Date().toISOString(),
  };

  try {
    await appendResponse(entry);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Storage failed.";
    return Response.json({ error: detail }, { status: 503 });
  }

  const webhook = process.env.FIRST_CONTACT_DELIVERY_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "first_contact.response", response: entry }),
    }).catch(() => undefined);
  }

  return Response.json({ ok: true, responseId: entry.id, state: type });
}
