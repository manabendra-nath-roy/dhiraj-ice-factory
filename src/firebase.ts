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

type RuntimeFirebaseConfig = {
  projectId?: string;
  apiKey?: string;
};

function getFirebaseConfig() {
  const runtimeConfig = ((globalThis as { __FIREBASE_CONFIG__?: RuntimeFirebaseConfig }).__FIREBASE_CONFIG__ || {}) as RuntimeFirebaseConfig;

  const projectId =
    runtimeConfig.projectId ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    import.meta.env.VITE_FIREBASE_PROJECTID ||
    import.meta.env.VITE_PROJECT_ID;

  const apiKey =
    runtimeConfig.apiKey ||
    import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_WEB_API_KEY ||
    import.meta.env.VITE_API_KEY;

  return { projectId, apiKey };
}

async function saveThroughVercelApi(payload: PartnerApplicationPayload) {
  const response = await fetch('/api/partner-application', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.status === 404) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Submission failed via /api/partner-application (${response.status}).`);
  }

  return data;
}

async function saveDirectToFirestore(payload: PartnerApplicationPayload) {
  const { projectId, apiKey } = getFirebaseConfig();

  if (!projectId || !apiKey) {
    throw new Error('Firebase config missing. On Vercel, set FIREBASE_PROJECT_ID and FIREBASE_API_KEY (recommended server-side path), or set VITE_FIREBASE_PROJECT_ID + VITE_FIREBASE_API_KEY and redeploy.');
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
          errorMessage = 'Firebase API key is invalid. Check FIREBASE_API_KEY / VITE_FIREBASE_API_KEY.';
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

export async function savePartnerApplication(payload: PartnerApplicationPayload) {
  const vercelApiResult = await saveThroughVercelApi(payload);
  if (vercelApiResult) {
    return vercelApiResult;
  }

  return saveDirectToFirestore(payload);
}
