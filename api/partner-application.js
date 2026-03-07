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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
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

  const payload = req.body || {};

  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications?key=${apiKey}`;

  const firestoreResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        restaurantName: { stringValue: payload.restaurantName || '' },
        ownerName: { stringValue: payload.ownerName || '' },
        phone: { stringValue: payload.phone || '' },
        email: { stringValue: payload.email || '' },
        address: { stringValue: payload.address || '' },
        city: { stringValue: payload.city || '' },
        state: { stringValue: payload.state || '' },
        pincode: { stringValue: payload.pincode || '' },
        expectedMonthlyQuantity: { stringValue: payload.expectedMonthlyQuantity || '' },
        additionalNotes: { stringValue: payload.additionalNotes || '' },
        status: { stringValue: payload.status || 'pending' },
        submittedAtIso: { stringValue: payload.submittedAtIso || new Date().toISOString() },
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
  res.status(200).json({ ok: true, data });
}
