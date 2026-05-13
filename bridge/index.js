/**
 * Ghost — Baileys WhatsApp Bridge
 *
 * SECURITY: Run ONLY on residential IP — data centre IPs risk permanent WA ban.
 * SESSION:  wa-auth/ is gitignored — never commit it.
 * RATE:     Hard cap MAX_MESSAGES_PER_DAY. Do not raise above 40 in week 1.
 */

import 'dotenv/config';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from 'baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import express from 'express';

const logger = pino({ level: 'info' });
const app = express();
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';
const BRIDGE_TOKEN = process.env.BRIDGE_INTERNAL_TOKEN || '';
const WA_AUTH_DIR = process.env.WA_AUTH_DIR || './wa-auth';
const MAX_PER_DAY = parseInt(process.env.MAX_MESSAGES_PER_DAY || '40');
const MIN_DELAY = parseInt(process.env.MIN_DELAY_MS || '10000');
const MAX_DELAY = parseInt(process.env.MAX_DELAY_MS || '30000');

let sentToday = 0;
let lastResetDate = new Date().toDateString();
let sock = null;

function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function checkDailyReset() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    sentToday = 0;
    lastResetDate = today;
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(WA_AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    markOnlineOnConnect: false,   // stay offline — human-like
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      logger.info('Scan QR code to link WhatsApp:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn({ code }, 'Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) setTimeout(connectToWhatsApp, 5000);
    }
    if (connection === 'open') {
      logger.info('WhatsApp connected ✓');
    }
  });

  // ── INBOUND: forward messages to backend ──────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const from = msg.key.remoteJid;
      const body = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || '';
      if (!body) continue;

      try {
        await fetch(`${BACKEND_URL}/internal/inbound`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Bridge-Token': BRIDGE_TOKEN,
          },
          body: JSON.stringify({ from, body, timestamp: Date.now(), messageId: msg.key.id }),
        });
        logger.info({ from }, 'Forwarded inbound message to backend');
      } catch (err) {
        logger.error({ err }, 'Failed to forward inbound message');
      }
    }
  });
}

// ── OUTBOUND: receive reply from backend, send via Baileys ──────────────────
app.post('/internal/send', async (req, res) => {
  const token = req.headers['x-bridge-token'];
  if (token !== BRIDGE_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const { to, body } = req.body;
  if (!to || !body) return res.status(400).json({ error: 'to and body required' });

  checkDailyReset();
  if (sentToday >= MAX_PER_DAY) {
    logger.warn('Daily cap reached — message queued for tomorrow');
    return res.status(429).json({ error: 'Daily cap reached', sentToday, cap: MAX_PER_DAY });
  }

  const delay = randomDelay();
  logger.info({ to, delay }, `Sending in ${delay}ms (${sentToday + 1}/${MAX_PER_DAY} today)`);

  setTimeout(async () => {
    try {
      await sock.sendMessage(to, { text: body });
      sentToday++;
      logger.info({ to, sentToday }, 'Message sent ✓');
    } catch (err) {
      logger.error({ err, to }, 'Failed to send message');
    }
  }, delay);

  res.json({ ok: true, delayMs: delay, sentToday: sentToday + 1, cap: MAX_PER_DAY });
});

app.get('/health', (_, res) => {
  checkDailyReset();
  res.json({
    status: 'ok',
    connected: !!sock?.user,
    sentToday,
    cap: MAX_PER_DAY,
    remaining: MAX_PER_DAY - sentToday,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Bridge listening on :${PORT}`));
connectToWhatsApp();
