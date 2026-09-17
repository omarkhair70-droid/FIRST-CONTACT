# OBJECT 001 backend

The production encounter backend uses a Postgres RPC surface with opaque bearer tokens.

- Raw encounter tokens exist only in the physical NFC/QR URL.
- The database stores only SHA-256 hashes of encounter tokens.
- The response table has RLS enabled and no direct anon/authenticated table grants.
- `first_contact_respond` is the only public write path and accepts a single response per encounter.
- The private inbox is exposed only through `first_contact_inbox`, which verifies a separate high-entropy admin key whose SHA-256 hash is stored in the database.
- No location, device fingerprint, contacts, or hidden recipient profile data are collected.

The current web app proxies these RPC calls through its Next.js route handlers so the client flow stays provider-agnostic. The schema is plain PostgreSQL and can move to another Postgres provider without changing the product model.
