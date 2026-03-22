# Dhiraj Ice Factory

This project is a **React + Vite + Tailwind CSS** website for an ice factory business, with:

- product catalog pages
- a "Become a Partner" application form
- Firebase-backed submission storage
- an admin dashboard at `/#/admin`
- Telegram notifications for new partner applications

## What this website does

- Shows a homepage with hero, products preview, and location section.
- Shows a full products page.
- Shows a partner registration page for business customers.
- Saves partner registration submissions to Firebase Firestore (`partner_applications` collection).
- Lets admins review applications and update workflow status.
- Sends Telegram notifications on successful application submission when configured.

## Tech stack

- React + TypeScript
- Vite (dev server + build tool)
- Tailwind CSS (styling)
- React Router (page routing)
- Firebase Firestore
- Vercel Serverless Functions

## Folder structure (important files)

```text
.
|-- index.html            # HTML shell; contains <div id="root"></div>
|-- package.json          # scripts + dependencies
|-- vite.config.ts        # Vite config
|-- api/
|   |-- partner-application.js   # partner form API + Telegram send
|   `-- partner-applications.js  # admin listing/status API
`-- src/
    |-- main.tsx          # app entry point; mounts React App
    |-- App.tsx           # main app + all page components/routes
    `-- assets/           # product images
```

## Run locally

Install dependencies:

```bash
npm install
```

For full local testing, including `/api/*` serverless routes, use Vercel dev:

```bash
npx vercel env pull .env.local
npx vercel dev
```

Then open the local URL shown by Vercel, usually:

- `http://localhost:3000`

Do not rely on `npm run dev` for admin/API testing. Vite alone does not run the serverless API routes.

## Build for production

```bash
npm run build
```

## Firebase setup (Partner form submissions)

1. Create a Firebase project and enable **Firestore Database**.
2. Copy `.env.example` to `.env.local` for local testing, or set the same values in Vercel for production.

```bash
cp .env.example .env.local
```

Required keys:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_API_KEY` as optional client-side fallback

3. In Firebase Console, open **Firestore Database** and create/verify collection:

- `partner_applications`

4. Update Firestore Security Rules so the app can create submissions.
   For production, lock rules down to your real auth/admin model.

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

Each document stores business details, contact/address, requested quantity, status, and submit timestamps.

## Telegram notifications

Telegram notifications are optional, but they are the recommended zero-cost alert mechanism for new applications.

### Setup

1. In Telegram, open [@BotFather](https://t.me/BotFather)
2. Run `/newbot`
3. Copy the bot token
4. Open the bot chat as the admin user and press **Start**
5. Find the admin chat ID:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

6. Add these environment variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Local test

```bash
npx vercel env pull .env.local
npx vercel dev
```

Then submit one partner application locally and confirm the Telegram message arrives.

### Direct Telegram test

You can test the bot directly in a browser before testing the form:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Test%20message
```

## Troubleshooting form submission errors

If you see an error while submitting the partner form:

- **`Firebase config missing...`** -> On Vercel set `FIREBASE_PROJECT_ID` + `FIREBASE_API_KEY` and redeploy. For local fallback, set `VITE_FIREBASE_PROJECT_ID` + `VITE_FIREBASE_API_KEY` in `.env.local` and restart local dev.
- Optional: you can inject runtime config with `window.__FIREBASE_CONFIG__ = { projectId: "...", apiKey: "..." }` before app startup.
- **`Permission denied by Firestore rules...`** -> update Firestore Security Rules to allow `create` on `partner_applications` for your client/auth model.
- **`API key is invalid`** -> recheck the Web API key in Firebase project settings.
- **`Firestore API is disabled`** -> enable Firestore API in Google Cloud Console for the same project.
- **Telegram notification not received** -> verify `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and confirm the admin has pressed **Start** in the bot chat.
- If the form still fails, open browser DevTools -> Network and check the response body for exact server details.

## Vercel deployment notes

For Vercel deployments, this project submits partner forms through:

- `POST /api/partner-application`

Set these in **Vercel Project Settings -> Environment Variables**:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `ADMIN_PORTAL_ID`
- `ADMIN_PORTAL_PASSWORD`
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)

Then redeploy.

## Admin dashboard (/admin)

A mobile-friendly admin portal is available at:

- `/#/admin`

It supports:

- status workflow updates
- colored status badges
- search by business or phone
- filter by status
- sorting by submission date, business, owner, status, and quantity

Set these environment variables in Vercel:

- `ADMIN_PORTAL_ID`
- `ADMIN_PORTAL_PASSWORD`

Keep admin credentials only in Vercel Environment Variables. Do not hardcode them in GitHub code.

## Production checklist

Before go-live, confirm all of the following:

1. `npm run build` passes
2. Vercel production environment variables are set
3. Firestore rules are locked down appropriately
4. `/api/partner-application` stores form submissions successfully
5. Telegram notification arrives on successful submission
6. `/#/admin` login works
7. Admin status transitions work as expected
8. Mobile and desktop smoke tests pass
