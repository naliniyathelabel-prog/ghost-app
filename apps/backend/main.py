"""
Ghost — FastAPI Backend
Relay hub between Baileys bridge, AI agent, and mobile app.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio, httpx, os
from dotenv import load_dotenv

load_dotenv()

BRIDGE_TOKEN = os.getenv("BRIDGE_INTERNAL_TOKEN", "")
BRIDGE_URL = os.getenv("BRIDGE_INTERNAL_URL", "http://localhost:3001")

app = FastAPI(title="Ghost API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WebSocket connection manager (mobile app live feed) ──────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()

# ── Models ───────────────────────────────────────────────────────────────────
class InboundMessage(BaseModel):
    from_: str  # WA JID
    body: str
    timestamp: int
    messageId: str

class OutboundRequest(BaseModel):
    to: str
    body: str

# ── Internal routes (bridge only) ────────────────────────────────────────────
def verify_bridge_token(x_bridge_token: str = Header(...)):
    if x_bridge_token != BRIDGE_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.post("/internal/inbound", dependencies=[Depends(verify_bridge_token)])
async def inbound(msg: InboundMessage):
    """
    Receives message from Baileys bridge.
    1. Check contact rule
    2. Build AI reply
    3. Push to mobile WS feed
    4. Send reply via bridge
    """
    # TODO Slice 7: fetch persona + rule from Supabase
    # TODO Slice 7: call AI agent with persona system prompt
    # Placeholder — echo reply for scaffold validation
    reply_text = f"[Ghost placeholder] received: {msg.body[:50]}"

    # Push to mobile live feed
    await manager.broadcast({
        "event": "new_reply",
        "from": msg.from_,
        "original": msg.body,
        "reply": reply_text,
        "timestamp": msg.timestamp,
    })

    # Send reply via bridge
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{BRIDGE_URL}/internal/send",
            json={"to": msg.from_, "body": reply_text},
            headers={"x-bridge-token": BRIDGE_TOKEN},
            timeout=10,
        )

    return {"ok": True}

# ── Mobile app routes ────────────────────────────────────────────────────────
@app.websocket("/ws/relay")
async def ws_relay(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}

# Persona, rules, messages routes — Slice 3+
@app.get("/api/persona")
def get_persona():
    return {"todo": "Slice 3 — Supabase persona fetch"}

@app.post("/api/persona")
def save_persona(payload: dict):
    return {"todo": "Slice 3 — Supabase persona save"}

@app.get("/api/rules")
def get_rules():
    return {"todo": "Slice 3 — Supabase rules fetch"}
