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
    throw new Error('Firebase config missing: set VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_API_KEY in your .env file, then restart the dev server.');
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
    let errorMessage = `Firestore request failed (${response.status}).`;

    try {
      const errorBody = await response.json();
      const firestoreMessage = errorBody?.error?.message as string | undefined;

      if (firestoreMessage) {
        if (firestoreMessage.includes('PERMISSION_DENIED')) {
          errorMessage = 'Permission denied by Firestore rules. Allow create access to partner_applications (or authenticate admin/client properly).';
        } else if (firestoreMessage.includes('API_KEY_INVALID')) {
          errorMessage = 'Firebase API key is invalid. Check VITE_FIREBASE_API_KEY in .env.';
        } else if (firestoreMessage.includes('SERVICE_DISABLED')) {
          errorMessage = 'Firestore API is disabled for this Firebase project. Enable Firestore API in Google Cloud Console.';
        } else {
          errorMessage = firestoreMessage;
        }
      }
    } catch {
      const fallbackText = await response.text();
      if (fallbackText) {
        errorMessage = `${errorMessage} ${fallbackText}`;
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
