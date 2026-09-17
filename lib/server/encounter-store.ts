import type { ResponseAction } from "@/lib/encounter";

export type StoredResponse = {
  id: string;
  encounterId: string;
  artifactId: string;
  recipientName: string;
  type: ResponseAction;
  message?: string;
  createdAt: string;
};

class StoreUnavailableError extends Error {}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new StoreUnavailableError("Encounter storage is not configured.");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  const payload = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || payload.error) throw new Error(payload.error ?? `Redis request failed (${response.status}).`);
  return payload.result as T;
}

export async function appendResponse(entry: StoredResponse) {
  const serialized = JSON.stringify(entry);
  await Promise.all([
    redisCommand<number>(["LPUSH", "hello:responses", serialized]),
    redisCommand<number>([
      "HSET",
      `hello:encounter:${entry.encounterId}`,
      "status",
      entry.type,
      "recipientName",
      entry.recipientName,
      "artifactId",
      entry.artifactId,
      "updatedAt",
      entry.createdAt,
    ]),
  ]);
}

export async function listResponses(limit = 100): Promise<StoredResponse[]> {
  const rows = await redisCommand<string[]>(["LRANGE", "hello:responses", 0, Math.max(0, limit - 1)]);
  return rows.flatMap((row) => {
    try {
      return [JSON.parse(row) as StoredResponse];
    } catch {
      return [];
    }
  });
}
