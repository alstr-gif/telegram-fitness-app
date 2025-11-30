# 🚀 Deploy Frontend to Production

Step-by-step guide to deploy your Telegram Mini App frontend.

---

## 📋 Prerequisites

- ✅ Frontend code ready
- ✅ Backend API deployed on Railway
- ✅ Railway API URL: `https://telegram-fitness-app-production.up.railway.app`

---

## Step 1: Configure API URL

Before deploying, update the frontend to use your Railway API URL.

### Option A: Create `.env.production` file

Create `fitness-frontend/.env.production`:

```env
VITE_API_URL=https://telegram-fitness-app-production.up.railway.app
```

### Option B: Update `src/config/api.ts`

The current code uses:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

This is fine - just make sure to set `VITE_API_URL` in your deployment platform.

---

## Step 2: Choose Deployment Platform

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Perfect for Vite/React apps
- ✅ Fast deployment

**Steps:**

1. **Go to:** https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click:** "Add New Project"
4. **Import** your GitHub repository
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `fitness-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://telegram-fitness-app-production.up.railway.app
     ```
7. **Deploy**

**After deployment:**
- Vercel will give you a URL like: `https://your-app.vercel.app`
- Copy this URL - you'll need it for Step 3

---

### Option 2: Netlify

**Steps:**

1. **Go to:** https://netlify.com
2. **Sign up/Login** with GitHub
3. **Click:** "Add new site" → "Import an existing project"
4. **Select** your GitHub repository
5. **Configure:**
   - **Base directory:** `fitness-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://telegram-fitness-app-production.up.railway.app
     ```
7. **Deploy**

**After deployment:**
- Netlify will give you a URL like: `https://your-app.netlify.app`
- Copy this URL

---

### Option 3: Cloudflare Pages

**Steps:**

1. **Go to:** https://pages.cloudflare.com
2. **Sign up/Login** with GitHub
3. **Create a project**
4. **Connect** your GitHub repository
5. **Configure:**
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. **Environment Variables:**
   - Add:
     ```
     VITE_API_URL=https://telegram-fitness-app-production.up.railway.app
     ```
7. **Deploy**

---

## Step 3: Update Railway CORS

After frontend is deployed, update Railway CORS to allow your frontend URL.

1. **Get your frontend URL** (from Vercel/Netlify/etc.)
2. **Go to Railway:**
   - Your service → Variables tab
3. **Update `CORS_ORIGIN`:**
   - Current: `https://placeholder.com`
   - New: `https://your-frontend-url.vercel.app` (or netlify.app, etc.)
4. **Save** - Railway will redeploy automatically

**If you have multiple origins:**
```
CORS_ORIGIN=https://your-app.vercel.app,https://your-telegram-miniapp-url.com
```

---

## Step 4: Configure Telegram Bot Menu Button

1. **Open Telegram**
2. **Search for @BotFather**
3. **Send:** `/setmenubutton`
4. **Select your bot**
5. **Enter URL:** Your frontend URL (e.g., `https://your-app.vercel.app`)
6. **Enter button text:** `Open App` (or your preferred text)
7. **Done!**

Now users can click the menu button in your bot to open the Mini App.

---

## Step 5: Test the Mini App

1. **Open Telegram**
2. **Find your bot**
3. **Click the menu button** (bottom of chat)
4. **Mini App should open**
5. **Test functionality:**
   - Authentication
   - Profile setup
   - Workout generation
   - Viewing workouts

---

## 🔧 Quick Deployment Checklist

### Before Deploying:
- [ ] Frontend builds successfully: `npm run build`
- [ ] API URL configured: `VITE_API_URL` set to Railway URL
- [ ] No build errors

### After Deploying:
- [ ] Frontend URL obtained (e.g., `https://your-app.vercel.app`)
- [ ] `CORS_ORIGIN` updated in Railway with frontend URL
- [ ] Telegram bot menu button configured
- [ ] Mini App opens in Telegram
- [ ] API calls work (check browser console)

---

## 🆘 Troubleshooting

### CORS Errors
- **Issue:** Frontend can't call backend API
- **Fix:** Update `CORS_ORIGIN` in Railway with frontend URL

### API Connection Failed
- **Issue:** Frontend can't reach backend
- **Fix:** Check `VITE_API_URL` is set correctly in deployment platform

### Mini App Doesn't Open
- **Issue:** Menu button doesn't work
- **Fix:** Verify menu button URL in @BotFather matches frontend URL

### Build Fails
- **Issue:** Deployment fails
- **Fix:** 
  - Check build logs
  - Verify `npm run build` works locally
  - Check for TypeScript errors

---

## 📊 Deployment Platforms Comparison

| Platform | Free Tier | Ease | Speed | Best For |
|----------|-----------|------|-------|----------|
| **Vercel** | ✅ Generous | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | React/Vite apps |
| **Netlify** | ✅ Good | ⭐⭐⭐⭐ | ⚡⚡⚡ | Static sites |
| **Cloudflare Pages** | ✅ Unlimited | ⭐⭐⭐ | ⚡⚡⚡⚡ | Fast global CDN |

**Recommendation:** Start with **Vercel** - easiest setup for React apps.

---

## 🎯 Next Steps After Deployment

1. ✅ Test Mini App in Telegram
2. ✅ Verify all features work
3. ✅ Monitor for errors
4. ✅ Set up custom domain (optional)
5. ✅ Configure analytics (optional)

---

**Ready to deploy!** Choose Vercel for the easiest experience. 🚀


