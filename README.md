# Dhiraj Ice Factory (Beginner Guide)

This project is a **React + Vite + Tailwind CSS** website for an ice factory business.

## What this website does

- Shows a homepage with hero, products preview, and location section.
- Shows a full products page.
- Shows a partner registration page for restaurants.
- Saves partner registration submissions to Firebase Firestore (`partner_applications` collection).

## Tech stack

- React + TypeScript
- Vite (dev server + build tool)
- Tailwind CSS (styling)
- React Router (page routing)

## Folder structure (important files)

```text
.
├── index.html            # HTML shell; contains <div id="root"></div>
├── package.json          # scripts + dependencies
├── vite.config.ts        # Vite plugins/config
├── src/
│   ├── main.tsx          # app entry point; mounts React App
│   ├── App.tsx           # main app + all page components/routes
│   ├── index.css         # global CSS (imports Tailwind)
│   └── utils/
│       └── cn.ts         # utility for merging class names
└── node_modules/         # installed packages
```

## Which file controls the homepage?

Main control is in:

- `src/App.tsx`
  - `HomePage()` component defines homepage sections.
  - The route mapping sets `/` to `<HomePage />`.

Entry flow:

1. `index.html` loads `src/main.tsx`.
2. `src/main.tsx` renders `<App />`.
3. `src/App.tsx` router sends path `/` to `HomePage()`.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build for production

```bash
npm run build
```


## Firebase setup (Partner form submissions)

1. Create a Firebase project and enable **Firestore Database**.
2. Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required keys:

- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`

3. In Firebase Console, open **Firestore Database** and create/verify collection:

- `partner_applications`

4. Update Firestore Security Rules so client app can write submissions (and admin can read in console).
   - For production, lock rules down to your real auth/admin model.

Example temporary rule for testing:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partner_applications/{docId} {
      allow create: if true;
      allow read: if true;
    }
  }
}
```

After deployment, submitted forms appear in Firebase Console under:

- Firestore Database → `partner_applications`

Each document stores restaurant details, contact/address, requested quantity, status, and submit timestamps.


### Troubleshooting form submission errors

If you see an error while submitting the partner form:

- **`Firebase config missing...`** → add `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_API_KEY` in `.env`, then restart `npm run dev`.
- **`Permission denied by Firestore rules...`** → update Firestore Security Rules to allow `create` on `partner_applications` for your client/auth model.
- **`API key is invalid`** → recheck the Web API key in Firebase project settings.
- **`Firestore API is disabled`** → enable Firestore API in Google Cloud Console for the same project.
- If the form still fails, open browser DevTools → Network and check the Firestore request response body for exact server details.
