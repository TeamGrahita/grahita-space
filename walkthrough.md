# ✅ Grahita Space — Walkthrough & Deployment Guide

## What Was Done

### 🔴 Critical Bug Fixes

| File | Fix |
|------|-----|
| [firebase-applet-config.json](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/firebase-applet-config.json) | Converted from broken JS syntax (`const firebaseConfig = {`) to valid JSON |
| [firebase.ts](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/src/lib/firebase.ts) | Replaced `initializeFirestore` with `getFirestore` (default DB); removed broken JSON import |
| [AppContext.tsx](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/src/context/AppContext.tsx) | Removed insecure `admin` username bypass; fixed mismatched admin UIDs; admin now detected by email `gr4hita@gmail.com` |
| [server.ts](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/server.ts) | Fixed non-existent Gemini model `gemini-3.5-flash` → `gemini-2.0-flash` |

### 🟡 Minor Fixes

| File | Fix |
|------|-----|
| [index.html](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/index.html) | Updated title to "Grahita Space", added SEO meta, added Google Fonts (Plus Jakarta Sans + Inter) |
| [package.json](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/package.json) | Removed duplicate `vite` from dependencies; separated build scripts |
| [.gitignore](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/.gitignore) | Added `dist/`, `.env`, `node_modules/`, Vercel files |

### 🔐 Admin Login Setup

[App.tsx](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/src/App.tsx) — Added 👑 Admin tab to the role selector grid

[AppContext.tsx](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/src/context/AppContext.tsx) — Admin user seeded in Firestore on first run:
- **Email**: `gr4hita@gmail.com`  
- **Password**: `tenangajadakenV45`
- **Role**: `admin`

**To log in as admin**: Select the 👑 **Admin** tab → enter `gr4hita@gmail.com` as username/email → enter your password → click Login.

### 🔥 Firebase Reconfiguration

[firebase.json](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/firebase.json) — Cleaned up to use default Firestore database

[firestore.rules](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/firestore.rules) — Updated security rules:
- Admin detected by email `gr4hita@gmail.com`
- Role-based access for students, counselors, parents
- Default catch-all requires authentication

### 🚀 Vercel Deployment Config

[vercel.json](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/vercel.json) — Vite SPA config with rewrites

[api/chat.ts](file:///c:/Users/Atilla/OneDrive/Documents/Grahita-Space-Project-main/api/chat.ts) — Vercel serverless function replacing the Express `/api/chat` endpoint (Gemini Graphite AI assistant)

### ✅ Build Verification Results
```
tsc --noEmit     → ✅ 0 TypeScript errors
vite build       → ✅ Built in 3.70s, 0 errors
npm install      → ✅ 285 packages, 0 vulnerabilities
```

---

## 🚀 Deploying to Vercel (GitHub)

### Step 1 — Push to GitHub

Make sure your project is in a GitHub repository:
```bash
cd "c:\Users\Atilla\OneDrive\Documents\Grahita-Space-Project-main"
git init
git add .
git commit -m "Initial commit: Grahita Space v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grahita-space.git
git push -u origin main
```

> [!IMPORTANT]
> The `.gitignore` is configured to **exclude `.env` files** — make sure you never commit your passwords or API keys.

### Step 2 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** → select your `grahita-space` repo
3. Vercel auto-detects **Vite** from `vercel.json`
4. Leave all settings as default — Vercel reads `vercel.json`
5. Click **Deploy**

### Step 3 — Add Environment Variables in Vercel

After the first deploy, go to your project → **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey) |

> [!NOTE]
> Firebase config is already hardcoded in `src/lib/firebase.ts` so no Firebase env vars are needed for the frontend. Only the Gemini key is needed as a server-side secret.

### Step 4 — Add Your Vercel Domain to Firebase

After deploy, copy your Vercel URL (e.g., `grahita-space.vercel.app`) and:
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel URL

### Step 5 — Set Up Firebase (if not done yet)

See the **Firebase Setup Guide** artifact for detailed instructions:
- Enable Firestore Database (default, not named)
- Deploy `firestore.rules`  
- Enable Authentication (Email/Password + Google)
- Manually add admin user to Firestore `users` collection

---

## 🔐 Login Credentials Summary

| Role | Username/Email | Password |
|------|---------------|----------|
| 👑 Admin | `gr4hita@gmail.com` | `tenangajadakenV45` |
| 📚 Student (demo) | `siswa` | `siswa` |
| 👩‍💼 Counselor (demo) | `guru` | `guru` |
| 👨‍👩‍👦 Parent (demo) | `orangtua` | `orangtua` |

> [!WARNING]
> The demo accounts use simple passwords and are fine for testing. For real production users, you should enforce stronger password requirements.
