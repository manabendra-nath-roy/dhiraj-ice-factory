const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitStore = globalThis.__partnerApplicationRateLimitStore || new Map();
globalThis.__partnerApplicationRateLimitStore = rateLimitStore;

const ALLOWED_QUANTITY_OPTIONS = new Set([
  '',
  '100-500',
  '500-1000',
  '1000-2000',
  '2000-5000',
  '5000+'
]);

function mapFirestoreError(status, firestoreMessage) {
  if (firestoreMessage?.includes('PERMISSION_DENIED')) {
    return 'Permission denied by Firestore rules. Allow create access to partner_applications (or authenticate admin/client properly).';
  }

  if (firestoreMessage?.includes('API_KEY_INVALID')) {
    return 'Firebase API key is invalid. Check FIREBASE_API_KEY in Vercel environment variables.';
  }

  if (firestoreMessage?.includes('SERVICE_DISABLED')) {
    return 'Firestore API is disabled for this Firebase project. Enable Firestore API in Google Cloud Console.';
  }

  return firestoreMessage || `Firestore request failed (${status}).`;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function enforceRateLimit(req, res) {
  const now = Date.now();
  const key = `${getClientIp(req)}:partner-application:POST`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
    return true;
  }

  record.count += 1;
  rateLimitStore.set(key, record);
  return false;
}

function parseBody(req) {
  if (!req.body) return {};

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function validatePayload(input) {
  const errors = [];

  const restaurantName = normalizeText(input.restaurantName);
  if (!restaurantName) {
    errors.push('Business / Organization Name is required.');
  }
  if (restaurantName.length > 300) {
    errors.push('Business / Organization Name must be at most 300 characters.');
  }

  const ownerName = normalizeText(input.ownerName);
  if (!ownerName) {
    errors.push('Owner Name is required.');
  }
  if (ownerName.length > 100) {
    errors.push('Owner Name must be at most 100 characters.');
  }

  const rawPhoneDigits = normalizeText(input.phone).replace(/\D/g, '');
  let normalizedPhoneDigits = rawPhoneDigits;

  if (rawPhoneDigits.length === 12 && rawPhoneDigits.startsWith('91')) {
    normalizedPhoneDigits = rawPhoneDigits.slice(2);
  }

  if (normalizedPhoneDigits.length !== 10) {
    errors.push('Phone number must contain exactly 10 digits.');
  }
  const phone = normalizedPhoneDigits.length === 10 ? `+91${normalizedPhoneDigits}` : '';

  const email = normalizeText(input.email);
  if (email.length > 100) {
    errors.push('Email must be at most 100 characters.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is invalid.');
  }

  const address = normalizeText(input.address);
  if (!address) {
    errors.push('Address is required.');
  }
  if (address.length > 500) {
    errors.push('Address must be at most 500 characters.');
  }

  const city = normalizeText(input.city);
  if (!city) {
    errors.push('City is required.');
  }
  if (city.length > 100) {
    errors.push('City must be at most 100 characters.');
  }

  const stateRaw = normalizeText(input.state);
  const state = stateRaw || 'WestBengal';
  if (state.length > 100) {
    errors.push('State must be at most 100 characters.');
  }

  const pincode = normalizeText(input.pincode);
  if (!/^\d{6}$/.test(pincode)) {
    errors.push('PIN Code must be exactly 6 digits.');
  }

  const expectedMonthlyQuantity = normalizeText(input.expectedMonthlyQuantity);
  if (!ALLOWED_QUANTITY_OPTIONS.has(expectedMonthlyQuantity)) {
    errors.push('Estimated Order Quantity is invalid.');
  }

  const additionalNotes = normalizeText(input.additionalNotes);
  if (additionalNotes.length > 500) {
    errors.push('Additional Notes must be at most 500 characters.');
  }

  return {
    errors,
    payload: {
      restaurantName,
      ownerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      expectedMonthlyQuantity,
      additionalNotes,
      status: 'pending',
      submittedAtIso: new Date().toISOString()
    }
  };
}

function escapeTelegramHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildTelegramMessage(payload) {
  return [
    '<b>New Partner Application</b>',
    '',
    `<b>Business:</b> ${escapeTelegramHtml(payload.restaurantName)}`,
    `<b>Owner:</b> ${escapeTelegramHtml(payload.ownerName)}`,
    `<b>Phone:</b> ${escapeTelegramHtml(payload.phone)}`,
    `<b>Email:</b> ${escapeTelegramHtml(payload.email || 'N/A')}`,
    `<b>Address:</b> ${escapeTelegramHtml(payload.address)}`,
    `<b>City/State:</b> ${escapeTelegramHtml(`${payload.city}, ${payload.state}`)}`,
    `<b>PIN:</b> ${escapeTelegramHtml(payload.pincode)}`,
    `<b>Estimated Qty:</b> ${escapeTelegramHtml(payload.expectedMonthlyQuantity || 'N/A')}`,
    `<b>Notes:</b> ${escapeTelegramHtml(payload.additionalNotes || 'N/A')}`,
    `<b>Submitted At:</b> ${escapeTelegramHtml(payload.submittedAtIso)}`
  ].join('\n');
}

async function sendTelegramNotification(payload) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { sent: false, reason: 'config-missing' };
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage(payload),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { sent: false, reason: `telegram-http-${response.status}`, error: errorText };
    }

    return { sent: true };
  } catch (error) {
    return { sent: false, reason: 'telegram-network-error', error: error instanceof Error ? error.message : String(error) };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (enforceRateLimit(req, res)) {
    res.status(429).json({ error: 'Too many requests. Please wait a few minutes before trying again.' });
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    res.status(500).json({
      error:
        'Server Firebase config missing. Set FIREBASE_PROJECT_ID and FIREBASE_API_KEY in Vercel project settings and redeploy.'
    });
    return;
  }

  const rawPayload = parseBody(req);
  const { errors, payload } = validatePayload(rawPayload);

  if (errors.length > 0) {
    res.status(400).json({ error: errors[0], validationErrors: errors });
    return;
  }

  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications?key=${apiKey}`;

  const firestoreResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        restaurantName: { stringValue: payload.restaurantName },
        ownerName: { stringValue: payload.ownerName },
        phone: { stringValue: payload.phone },
        email: { stringValue: payload.email },
        address: { stringValue: payload.address },
        city: { stringValue: payload.city },
        state: { stringValue: payload.state },
        pincode: { stringValue: payload.pincode },
        expectedMonthlyQuantity: { stringValue: payload.expectedMonthlyQuantity },
        additionalNotes: { stringValue: payload.additionalNotes },
        status: { stringValue: payload.status },
        submittedAtIso: { stringValue: payload.submittedAtIso },
        submittedAtMillis: { integerValue: Date.now().toString() }
      }
    })
  });

  if (!firestoreResponse.ok) {
    let firestoreMessage;

    try {
      const errorBody = await firestoreResponse.json();
      firestoreMessage = errorBody?.error?.message;
    } catch {
      firestoreMessage = await firestoreResponse.text();
    }

    res.status(firestoreResponse.status).json({
      error: mapFirestoreError(firestoreResponse.status, firestoreMessage)
    });
    return;
  }

  const data = await firestoreResponse.json();
  const telegramResult = await sendTelegramNotification(payload);

  if (!telegramResult.sent && telegramResult.reason !== 'config-missing') {
    console.warn('Telegram notification failed:', telegramResult);
  }

  res.status(200).json({
    ok: true,
    data,
    notification: {
      telegramSent: telegramResult.sent,
      reason: telegramResult.reason || null
    }
  });
}

