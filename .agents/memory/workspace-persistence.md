---
name: Workspace persistence schema parity
description: Why the existing workspace state must remain represented in both Prisma and Drizzle schemas.
---

The API uses Prisma for workspace state, while automatic post-merge setup still runs Drizzle push. Keep both schema representations aligned with the existing table rather than migrating to a different database or omitting it from Drizzle.

**Why:** A Drizzle push against a schema that omits an existing table can reconcile it away and lose saved preparation progress.

**How to apply:** Before changing persistence schemas or post-merge setup, inspect the current table and preserve it in both models. Use the documented migration flow; do not apply ad hoc production DDL.