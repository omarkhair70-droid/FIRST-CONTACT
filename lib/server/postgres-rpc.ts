const SUPABASE_URL = "https://dtfclllihkqinlhnribm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aCYDN8J776twQLNH_NXLLw_02DZoQbK";

async function callRpc<T>(fn: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message ?? "Postgres RPC failed.")
        : `Postgres RPC failed (${response.status}).`;
    throw new Error(message);
  }

  return data as T;
}

export type InboxResponse = {
  encounterId: string;
  artifact: string;
  state: "responded" | "archived";
  type: "wave" | "message" | "archive";
  recipientName: string;
  message: string | null;
  createdAt: string;
};

export async function submitEncounterResponse(input: {
  token: string;
  type: "wave" | "message" | "archive";
  recipientName: string;
  message?: string;
}) {
  return callRpc<{ ok: boolean; state: "connected" | "archived" }>("first_contact_respond", {
    p_token: input.token,
    p_type: input.type,
    p_recipient_name: input.recipientName,
    p_message: input.message ?? null,
  });
}

export async function loadInbox(adminKey: string) {
  return callRpc<InboxResponse[]>("first_contact_inbox", { p_admin_key: adminKey });
}
