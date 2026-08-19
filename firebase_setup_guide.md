# 🔥 Firebase Console Setup Guide — Grahita Space

Follow these steps to configure your Firebase project (`grahita-space-4638f`) correctly.

---

## Step 1 — Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com) → Select **grahita-space-4638f**
2. In the left sidebar → **Build** → **Firestore Database**
3. Click **Create database**
4. Choose **Start in production mode** (we'll deploy our custom rules)
5. Select a location (e.g., `asia-southeast1` for Indonesia/Singapore)
6. Click **Enable**

> [!IMPORTANT]
> Make sure to use the **default** database, NOT a named database. The AI Studio version used a named database `ai-studio-grahitaspace-...` which has been removed from the config.

---

## Step 2 — Deploy Firestore Security Rules

After setting up Firestore, deploy the updated rules.

**Option A — via Firebase Console (easiest):**
1. In Firestore → **Rules** tab
2. Copy the entire contents of your `firestore.rules` file
3. Paste it into the editor
4. Click **Publish**

**Option B — via Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase use grahita-space-4638f
firebase deploy --only firestore:rules
```

---

## Step 3 — Enable Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** (for the Graphite login form)
5. Enable **Google** (for the Google login button)
   - For Google Sign-in, make sure to add your OAuth consent screen in Google Cloud Console

> [!NOTE]
> The app currently uses a **custom Firestore-based auth** (stores passwords in Firestore) rather than Firebase Auth's email/password system. Firebase Auth is used only for Google OAuth login. This is by design from the original AI Studio build.

---

## Step 4 — Add Authorized Domains

For Google Sign-in to work on your Vercel domain:
1. Authentication → **Settings** tab → **Authorized domains**
2. Add your Vercel domain: `your-app-name.vercel.app`
3. Also add any custom domain if you have one

---

## Step 5 — Seed Admin User in Firestore

The admin account is automatically seeded when the Firestore `users` collection is empty. However, to manually add/verify it:

1. In Firestore → **Data** tab
2. Go to **users** collection (create it if it doesn't exist)
3. Add a document with ID: `admin`
4. Add these fields:

| Field | Type | Value |
|-------|------|-------|
| `username` | string | `admin` |
| `email` | string | `<your-admin-email>` |
| `fullName` | string | `Administrator Grahita` |
| `password` | string | `<your-admin-password>` |
| `role` | string | `admin` |
| `createdAt` | string | `2026-07-08T00:00:00.000Z` |

---

## Step 6 — Verify Firebase Configuration

Check that your Firebase project settings match what's in `src/lib/firebase.ts`:

1. Firebase Console → ⚙️ **Project Settings** → **Your apps** → Web app
2. Confirm these match the values in your `.env` file:
   - `apiKey`: *(from `VITE_FIREBASE_API_KEY` in your `.env`)*
   - `projectId`: *(from `VITE_FIREBASE_PROJECT_ID` in your `.env`)*
   - `authDomain`: `grahita-space-4638f.firebaseapp.com`

---

## ✅ Firebase Setup Checklist

- [ ] Firestore Database created (default, not named)
- [ ] Firestore Rules published from `firestore.rules`
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Authorized domains include your Vercel URL
- [ ] Admin user document created in Firestore `users` collection
- [ ] Firebase project settings match `src/lib/firebase.ts`
