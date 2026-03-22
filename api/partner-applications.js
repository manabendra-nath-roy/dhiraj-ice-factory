const ADMIN_STATUSES = [
  'Pending',
  'Verifying',
  'Approved',
  'Rejected',
  'Cancelled',
  'In Transit',
  'Completed'
];

const ADMIN_STATUS_TRANSITIONS = {
  Pending: ['Verifying', 'Rejected', 'Cancelled'],
  Verifying: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['In Transit', 'Cancelled'],
  Rejected: [],
  Cancelled: [],
  'In Transit': ['Completed'],
  Completed: []
};

const ADMIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const ADMIN_RATE_LIMIT_MAX_REQUESTS = 120;

const adminRateLimitStore = globalThis.__partnerApplicationsRateLimitStore || new Map();
globalThis.__partnerApplicationsRateLimitStore = adminRateLimitStore;

function normalizeStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();

  switch (normalized) {
    case 'pending':
      return 'Pending';
    case 'verifying':
      return 'Verifying';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    case 'in transit':
    case 'in_transit':
      return 'In Transit';
    case 'completed':
      return 'Completed';
    default:
      return 'Pending';
  }
}

function parseFirestoreFields(doc = {}) {
  const fields = doc.fields || {};
  const read = (key) =>
    fields[key]?.stringValue ?? fields[key]?.integerValue ?? fields[key]?.doubleValue ?? '';

  return {
    id: doc.name?.split('/').pop() || '',
    restaurantName: read('restaurantName'),
    ownerName: read('ownerName'),
    phone: read('phone'),
    email: read('email'),
    address: read('address'),
    city: read('city'),
    state: read('state'),
    pincode: read('pincode'),
    expectedMonthlyQuantity: read('expectedMonthlyQuantity'),
    additionalNotes: read('additionalNotes'),
    status: normalizeStatus(read('status') || 'Pending'),
    submittedAtIso: read('submittedAtIso')
  };
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
  const key = `${getClientIp(req)}:partner-applications:${req.method}`;
  const record = adminRateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    adminRateLimitStore.set(key, { count: 1, resetAt: now + ADMIN_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= ADMIN_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(Math.max(retryAfterSeconds, 1)));
    return true;
  }

  record.count += 1;
  adminRateLimitStore.set(key, record);
  return false;
}

function getAuthError(req) {
  const expectedId = process.env.ADMIN_PORTAL_ID;
  const expectedPassword = process.env.ADMIN_PORTAL_PASSWORD;

  if (!expectedId || !expectedPassword) {
    return {
      status: 500,
      body: {
        error: 'Admin credentials missing. Set ADMIN_PORTAL_ID and ADMIN_PORTAL_PASSWORD in Vercel environment variables.'
      }
    };
  }

  const providedId = req.headers['x-admin-id'];
  const providedPassword = req.headers['x-admin-password'];

  if (providedId !== expectedId || providedPassword !== expectedPassword) {
    return {
      status: 401,
      body: { error: 'Invalid admin ID or password.' }
    };
  }

  return null;
}

function getFirebaseConfigError() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return {
      error: {
        status: 500,
        body: {
          error: 'Server Firebase config missing. Set FIREBASE_PROJECT_ID and FIREBASE_API_KEY in Vercel project settings and redeploy.'
        }
      }
    };
  }

  return { projectId, apiKey };
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

function isSafeFirestoreDocId(value) {
  return /^[A-Za-z0-9_-]{1,200}$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (enforceRateLimit(req, res)) {
    res.status(429).json({ error: 'Too many requests. Please wait a few minutes before trying again.' });
    return;
  }

  const authError = getAuthError(req);
  if (authError) {
    res.status(authError.status).json(authError.body);
    return;
  }

  const firebaseConfig = getFirebaseConfigError();
  if (firebaseConfig.error) {
    res.status(firebaseConfig.error.status).json(firebaseConfig.error.body);
    return;
  }

  const { projectId, apiKey } = firebaseConfig;

  if (req.method === 'GET') {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications?key=${apiKey}`;

    const firestoreResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!firestoreResponse.ok) {
      const errorText = await firestoreResponse.text();
      res.status(firestoreResponse.status).json({ error: `Unable to fetch applications. ${errorText}` });
      return;
    }

    const data = await firestoreResponse.json();
    const applications = (data.documents || []).map(parseFirestoreFields);

    applications.sort((a, b) => new Date(b.submittedAtIso || 0).getTime() - new Date(a.submittedAtIso || 0).getTime());

    res.status(200).json({ ok: true, applications });
    return;
  }

  const payload = parseBody(req);
  const id = String(payload?.id || '').trim();
  const nextStatus = normalizeStatus(payload?.status);

  if (!id) {
    res.status(400).json({ error: 'Application ID is required.' });
    return;
  }

  if (!isSafeFirestoreDocId(id)) {
    res.status(400).json({ error: 'Application ID format is invalid.' });
    return;
  }

  if (!ADMIN_STATUSES.includes(nextStatus)) {
    res.status(400).json({ error: 'Invalid status value.' });
    return;
  }

  const documentEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications/${encodeURIComponent(id)}?key=${apiKey}`;

  const documentResponse = await fetch(documentEndpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!documentResponse.ok) {
    const errorText = await documentResponse.text();
    res.status(documentResponse.status).json({ error: `Unable to read current application status. ${errorText}` });
    return;
  }

  const doc = await documentResponse.json();
  const currentStatus = normalizeStatus(doc?.fields?.status?.stringValue || 'Pending');

  const allowedNextStatuses = ADMIN_STATUS_TRANSITIONS[currentStatus] || [];
  const isSameStatus = currentStatus === nextStatus;

  if (!isSameStatus && !allowedNextStatuses.includes(nextStatus)) {
    res.status(400).json({
      error: `Invalid status transition: ${currentStatus} -> ${nextStatus}.`,
      allowedTransitions: allowedNextStatuses
    });
    return;
  }

  const patchEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications/${encodeURIComponent(id)}?key=${apiKey}&updateMask.fieldPaths=status`;

  const patchResponse = await fetch(patchEndpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        status: { stringValue: nextStatus }
      }
    })
  });

  if (!patchResponse.ok) {
    const errorText = await patchResponse.text();
    res.status(patchResponse.status).json({ error: `Unable to update application status. ${errorText}` });
    return;
  }

  res.status(200).json({
    ok: true,
    id,
    previousStatus: currentStatus,
    status: nextStatus
  });
}
