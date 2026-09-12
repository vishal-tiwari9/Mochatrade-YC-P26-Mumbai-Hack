# ClassAI Continuity Memory

Last reviewed: 2026-09-12

This folder is the durable handoff for future ClassAI sessions. It describes the current source state and verification evidence; always recheck live processes and external services before relying on a snapshot.

## Read order

1. `PROJECT_STATUS.md` - current implementation and verified checks.
2. `KNOWN_ISSUES.md` - remaining work and external blockers.
3. `RUNBOOK.md` - local startup and verification commands.
4. `ARCHITECTURE_AND_CONTRACTS.md` - service boundaries and shared API rules.
5. `NEXT_SESSION.md` - recommended continuation sequence.

## Guardrails

- The teacher web, local Whisper service, FastAPI backend, Firebase integrations, and Android client share one contract.
- Do not reintroduce mock data as the Android runtime source.
- Do not upload raw lecture audio automatically.
- Never commit Groq keys, Firebase Admin credentials, local `.env` files, or generated build output.
- Firebase roles are server-owned; never trust a client-provided role.
