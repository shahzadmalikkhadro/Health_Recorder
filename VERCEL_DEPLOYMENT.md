# Vercel Deployment Guide

## ✅ What I Fixed

Your website had sensitive credentials **hardcoded** in the source files, which causes issues when deploying to Vercel. I've updated your configuration to use **environment variables** instead.

### Changes Made:
1. ✅ Created `.env` file with your credentials
2. ✅ Created `.env.example` as a template for others
3. ✅ Updated `supabase.js` to read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. ✅ Updated `firebase.js` to read all credentials from environment variables
5. ✅ Created `.gitignore` to prevent `.env` from being committed

---

## 🚀 How to Deploy on Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix: Move credentials to environment variables"
git push origin main
```

### Step 2: Add Environment Variables in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (copy from your local `.env` file):

| Variable Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://glnuukcfwjivrgclteec.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBaevXaLci3AAAz1cA...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `shahzad-ba1e7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `shahzad-ba1e7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `shahzad-ba1e7.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `403635896395` |
| `VITE_FIREBASE_APP_ID` | `1:403635896395:web:3848988b9c1c8061c94dce` |

### Step 3: Deploy
1. Click **Deploy** in Vercel Dashboard
2. Or wait for automatic deployment when you push to GitHub
3. Vercel will use the environment variables automatically

---

## 🔒 Security Best Practices

✅ **Local Development**: Use the `.env` file (never commit it)
✅ **Vercel Production**: Use Environment Variables in dashboard (not in code)
✅ **GitHub**: `.gitignore` prevents accidental credential leaks
✅ **Testing**: Use `.env.example` to share setup instructions without exposing secrets

---

## ✨ Note on Your Stack

You're using **both Supabase and Firebase**. Consider:
- If you're primarily using **Supabase for auth/database** → Remove Firebase config
- If you're primarily using **Firebase** → Remove Supabase config

Using both adds unnecessary complexity. Pick one and remove the other for better maintainability.

---

## 🧪 Verify It Works

After deploying:
1. Go to your Vercel URL
2. Try to Login/Register - should work now
3. Check Dashboard, Reports, etc.
4. If still having issues, check Vercel logs: **Settings** → **Functions** → View logs

**Common issue**: If you get "Missing Supabase environment variables", it means Vercel hasn't loaded the environment variables yet. Redeploy the project to refresh.
