# 🚀 Deploy Frontend to Vercel - Step by Step

Complete guide to deploy your Telegram Mini App frontend to Vercel.

---

## ✅ Prerequisites

- ✅ Frontend builds successfully (`npm run build` works)
- ✅ Backend API is live on Railway
- ✅ Railway API URL: `https://telegram-fitness-app-production.up.railway.app`

---

## Step 1: Prepare for Deployment

### 1.1 Commit Frontend Changes

Make sure all frontend changes are committed:

```bash
cd fitness-frontend
git add .
git commit -m "Prepare frontend for production deployment"
git push
```

---

## Step 2: Deploy to Vercel

### 2.1 Create Vercel Account

1. **Go to:** https://vercel.com
2. **Click:** "Sign Up" or "Login"
3. **Choose:** "Continue with GitHub"
4. **Authorize** Vercel to access your GitHub

### 2.2 Import Your Project

1. **In Vercel Dashboard:**
   - Click **"Add New Project"** or **"Import Project"**

2. **Select Repository:**
   - Find your `telegram-fitness-app` repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `fitness-frontend` ← **Important!**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Click:** "Deploy" (don't deploy yet - we need to set env vars first)

---

## Step 3: Configure Environment Variables

**Before deploying, set the API URL:**

1. **In Vercel project setup:**
   - Scroll to **"Environment Variables"** section
   - Click **"Add"** or **"Add Variable"**

2. **Add this variable:**
   ```
   Name: VITE_API_URL
   Value: https://telegram-fitness-app-production.up.railway.app
   ```

3. **Select environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Click:** "Save"

---

## Step 4: Deploy

1. **Click:** "Deploy" button
2. **Wait** for deployment (usually 1-2 minutes)
3. **Watch** the build logs
4. **Success!** You'll get a URL like: `https://your-app.vercel.app`

---

## Step 5: Update Railway CORS

After getting your Vercel URL:

1. **Go to Railway:**
   - Your service → Variables tab

2. **Update `CORS_ORIGIN`:**
   - Find `CORS_ORIGIN` variable
   - Edit it
   - Set to: `https://your-app.vercel.app`
   - Save

3. **Railway will auto-redeploy**

---

## Step 6: Configure Telegram Bot Menu Button

1. **Open Telegram**
2. **Search for @BotFather**
3. **Send:** `/setmenubutton`
4. **Select your bot**
5. **Enter URL:** `https://your-app.vercel.app` (your Vercel URL)
6. **Enter button text:** `Open App`
7. **Done!**

---

## Step 7: Test the Mini App

1. **Open Telegram**
2. **Find your bot**
3. **Click the menu button** (bottom of chat)
4. **Mini App should open!**
5. **Test:**
   - Authentication works
   - API calls work
   - Features function correctly

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] Frontend builds successfully locally
- [ ] All changes committed to GitHub
- [ ] Vercel account created

### During Deployment:
- [ ] Root directory set to `fitness-frontend`
- [ ] `VITE_API_URL` environment variable added
- [ ] Deployment successful

### After Deployment:
- [ ] Got Vercel URL
- [ ] Updated `CORS_ORIGIN` in Railway
- [ ] Configured Telegram bot menu button
- [ ] Tested Mini App in Telegram

---

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel
- Verify `npm run build` works locally
- Check for TypeScript errors

### CORS Errors
- Verify `CORS_ORIGIN` in Railway includes your Vercel URL
- Check Railway logs for CORS errors
- Make sure URL is exact match (including https://)

### Mini App Doesn't Open
- Verify menu button URL in @BotFather
- Check URL is accessible (open in browser)
- Make sure URL uses HTTPS

### API Calls Fail
- Check `VITE_API_URL` is set in Vercel
- Verify Railway API is accessible
- Check browser console for errors

---

## 📊 Quick Reference

**Your URLs:**
- **Backend API:** `https://telegram-fitness-app-production.up.railway.app`
- **Frontend:** `https://your-app.vercel.app` (after deployment)

**Environment Variables:**
- **Vercel:** `VITE_API_URL=https://telegram-fitness-app-production.up.railway.app`
- **Railway:** `CORS_ORIGIN=https://your-app.vercel.app`

---

**Ready to deploy!** Follow the steps above and your Mini App will be live! 🎉


