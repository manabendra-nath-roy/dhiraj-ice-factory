type PartnerApplicationPayload = {
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  expectedMonthlyQuantity: string;
  additionalNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAtIso: string;
};

export async function savePartnerApplication(payload: PartnerApplicationPayload) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    throw new Error('Firebase config is missing. Add VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_API_KEY.');
  }

  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partner_applications?key=${apiKey}`;

  const response = await fetch(endpoint, {
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
        expectedMonthlyQuantity: { stringValue: payload.expectedMonthlyQuantity || '' },
        additionalNotes: { stringValue: payload.additionalNotes || '' },
        status: { stringValue: payload.status },
        submittedAtIso: { stringValue: payload.submittedAtIso },
        submittedAtMillis: { integerValue: Date.now().toString() }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
