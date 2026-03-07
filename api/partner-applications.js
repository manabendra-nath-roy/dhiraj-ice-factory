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
    status: read('status') || 'pending',
    submittedAtIso: read('submittedAtIso')
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expectedId = process.env.ADMIN_PORTAL_ID;
  const expectedPassword = process.env.ADMIN_PORTAL_PASSWORD;

  if (!expectedId || !expectedPassword) {
    res.status(500).json({
      error: 'Admin credentials missing. Set ADMIN_PORTAL_ID and ADMIN_PORTAL_PASSWORD in Vercel environment variables.'
    });
    return;
  }

  const providedId = req.headers['x-admin-id'];
  const providedPassword = req.headers['x-admin-password'];

  if (providedId !== expectedId || providedPassword !== expectedPassword) {
    res.status(401).json({ error: 'Invalid admin ID or password.' });
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    res.status(500).json({
      error: 'Server Firebase config missing. Set FIREBASE_PROJECT_ID and FIREBASE_API_KEY in Vercel project settings and redeploy.'
    });
    return;
  }

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
}
