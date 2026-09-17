"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { StoredResponse } from "@/lib/server/encounter-store";

export default function HelloInboxPage() {
  const [key, setKey] = useState("");
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/hello/inbox", { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
      const payload = (await response.json()) as { responses?: StoredResponse[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Inbox unavailable.");
      setResponses(payload.responses ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Inbox unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="inbox-shell">
      <header className="inbox-header"><span>HELLO://</span><span>PRIVATE ARCHIVE</span></header>
      <section className="inbox-content">
        <p className="eyebrow">OWNER CONSOLE</p>
        <h1>Incoming contact.</h1>
        <form className="inbox-unlock" onSubmit={unlock}>
          <input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="admin key" autoComplete="current-password" />
          <button type="submit" disabled={loading || !key}>{loading ? "opening…" : "open archive"}</button>
        </form>
        {error && <p className="status-note error">{error}</p>}
        <div className="inbox-list">
          {responses.map((item) => (
            <article className="inbox-card" key={item.id}>
              <div><strong>{item.recipientName}</strong><span>{item.type.toUpperCase()}</span></div>
              {item.message && <p>{item.message}</p>}
              <small>{item.artifactId} · {new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {!error && !loading && key && responses.length === 0 && <p className="status-note">No responses yet.</p>}
        </div>
      </section>
    </main>
  );
}
