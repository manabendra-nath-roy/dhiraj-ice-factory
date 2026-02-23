# Dhiraj Ice Factory (Beginner Guide)

This project is a **React + Vite + Tailwind CSS** website for an ice factory business.

## What this website does

- Shows a homepage with hero, products preview, and location section.
- Shows a full products page.
- Shows a partner registration page for restaurants.
- Saves registration form submissions to browser `localStorage` (demo behavior).

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
