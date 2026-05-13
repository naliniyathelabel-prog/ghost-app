# Architecture

## System overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S PHONE                         │
│                                                             │
│   WhatsApp ──► Ghost Mobile App (Expo RN)                   │
│                        │                                    │
│                        │ REST + WebSocket                   │
└────────────────────────┼────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   FastAPI Backend   │
              │  (apps/backend)     │
              │                     │
              │  /api/messages      │
              │  /api/rules         │
              │  /api/persona       │
              │  WS /ws/relay       │
              └──────┬──────┬───────┘
                     │      │
          ┌──────────▼─┐  ┌─▼──────────────┐
          │  Supabase  │  │  AI Provider   │
          │ (Postgres) │  │ Claude / Gemini │
          └────────────┘  └────────────────┘
                     │
              ┌──────▼──────────────┐
              │  Baileys Bridge     │
              │  (bridge/)          │
              │                     │
              │  Node.js process    │
              │  Residential IP ⚠️  │
              │  wa-auth/ (local)   │
              └──────┬──────────────┘
                     │
                  WhatsApp Web
                  (QR-linked)
```

## Component responsibilities

### Mobile app (`apps/mobile`)
- Onboarding: QR scan trigger, persona setup ("Train Your Ghost")
- Dashboard: Ghost ON/OFF toggle, live reply feed
- Review inbox: view AI replies, thumbs up/down
- Contact rules: per-contact allow / block / ask-me-first
- Communicates with backend via REST (setup/config) and WebSocket (live feed)

### Backend (`apps/backend`)
- FastAPI: REST API for persona, rules, message history
- WebSocket `/ws/relay`: real-time bridge between Baileys bridge and mobile app
- AI agent: builds system prompt from user persona → calls LLM → returns reply
- Stores messages, replies, feedback in Supabase
- Never holds WhatsApp session (bridge owns that)

### Baileys bridge (`bridge/`)
- Standalone Node.js process — must run on residential IP
- Connects to WhatsApp Web via QR (session persisted in `wa-auth/`)
- Inbound: receives WA message → POSTs to backend `/internal/inbound`
- Outbound: receives reply from backend WS → sends via Baileys socket
- Anti-ban: randomised delays (10–30s), daily cap (40/day warm, 80/day stable)
- Warm-up schedule enforced in code — no config override

### Shared (`packages/shared`)
- TypeScript types shared between bridge and mobile: `Message`, `Reply`, `Persona`, `Rule`
- Constants: rate limits, delay ranges, warm-up schedule

---

## Data flow — inbound message → AI reply

```
1. Customer sends WA message
2. Baileys bridge receives it
3. Bridge POSTs to backend: POST /internal/inbound { from, body, timestamp }
4. Backend fetches: user persona + contact rule for `from`
5. IF rule = "never reply" → drop
   IF rule = "ask me first" → push notification to mobile, wait
   IF rule = "always reply" → continue
6. Backend calls AI: system_prompt(persona) + conversation_history + message
7. AI returns reply text
8. Backend stores in DB, pushes to mobile WS (live feed)
9. Backend POSTs to bridge: POST /internal/outbound { to, body }
10. Bridge sends via Baileys with randomised delay
11. Mobile app shows reply card in review feed
```

---

## Security boundaries

| Boundary | Rule |
|---|---|
| `wa-auth/` | Gitignored, local only, never leaves bridge host |
| Backend `/internal/*` | Internal only — bridge token auth, not exposed to mobile |
| Secrets | `.env` local, secret manager in prod, `.env.example` documents all vars |
| Bridge IP | Residential only — cloud/VPS IP risks permanent WA ban |
| LLM calls | Persona text only — no raw customer messages sent to LLM without user consent flag |

---

## Known risks & mitigations

| Risk | Mitigation |
|---|---|
| WhatsApp bans number (Baileys unofficial) | Warm-up, residential IP, low volume, human-paced delays |
| Persona prompt leaks private info | Persona built from style only — no PII in system prompt |
| Bridge process dies | Auto-restart via PM2, NEXT_ACTION.md recovery path |
| Session file lost | Documented re-link flow in runbook |

---

## Deferred (future slices)
- Multi-number support
- iOS build + App Store
- On-device LLM (privacy mode)
- Supabase RLS per-user isolation
