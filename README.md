# Ghost 👻

> Your AI twin on WhatsApp. Replies as you, while you live your life.

Ghost learns your tone, slang, and context — then handles WhatsApp conversations
on your behalf. Built for shop owners, freelancers, and anyone who wants to stay
responsive without being glued to their phone.

---

## What it does

- Connects to your WhatsApp via QR scan (no Meta API, no template approval)
- Learns your personality from 5 sample replies you paste in
- Auto-replies to customers / contacts as **you** — not a bot
- Shows every reply in a review inbox — thumbs up/down to improve over time
- Runs silently in background; you can take over any chat instantly

---

## Stack

| Layer | Tech | Version |
|---|---|---|
| Mobile app | Expo + React Native | SDK 55 / RN 0.83 |
| Navigation | Expo Router | v7 |
| Backend API | FastAPI | 0.136.1 |
| WhatsApp bridge | Baileys (Node.js) | 6.7.17 |
| Database | Supabase (PostgreSQL) | latest |
| AI | Claude Haiku / Gemini Flash | — |
| Auth | Supabase Auth (OTP) | — |

---

## Monorepo structure

```
ghost-app/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── backend/         # FastAPI + WebSocket server
├── bridge/              # Baileys WhatsApp bridge (Node.js)
├── packages/
│   └── shared/          # Shared types / constants
├── docs/                # ADRs, runbooks, API contracts
├── .env.example         # All env vars documented (no values)
└── ARCHITECTURE.md
```

---

## Local dev setup

### Prerequisites
- Node 20+ (bridge + mobile)
- Python 3.11+ (backend)
- Expo CLI: `npm i -g expo-cli`
- Android emulator or physical device

### 1. Clone
```bash
git clone https://github.com/naliniyathelabel-prog/ghost-app.git
cd ghost-app
```

### 2. Backend
```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../../.env.example .env   # fill in values
uvicorn main:app --reload
```

### 3. Bridge
```bash
cd bridge
npm install
cp ../.env.example .env
node index.js   # scan QR on first run
```

### 4. Mobile
```bash
cd apps/mobile
npm install
npx expo start
```

---

## Security rules (non-negotiable)

- `wa-auth/` is gitignored — WhatsApp session files stay local only
- No secrets in repo — use `.env` locally, secret manager in prod
- Bridge must run on **residential IP** — data centre IPs risk WA ban
- See `docs/THREAT-MODEL.md` for full risk register

---

## Roadmap

- [ ] Slice 1 — Monorepo scaffold + architecture (this PR)
- [ ] Slice 2 — Baileys bridge: connect, QR, send/receive
- [ ] Slice 3 — FastAPI: WebSocket relay + REST endpoints
- [ ] Slice 4 — Mobile: onboarding + QR scan screen
- [ ] Slice 5 — Mobile: Ghost toggle + live reply feed
- [ ] Slice 6 — Mobile: Train Your Ghost (personality setup)
- [ ] Slice 7 — AI agent: system prompt builder + LLM integration
- [ ] Slice 8 — Review inbox + thumbs up/down feedback loop
- [ ] Slice 9 — Contact rules (per-contact allow/block/ask)
- [ ] Slice 10 — Supabase persistence + auth

---

## Contributing

Branch naming: `feat/<slice>` | `fix/<slice>` | `chore/<slice>`  
Commits: atomic only, no mixed refactor + feature  
No inline secrets. Ever.
