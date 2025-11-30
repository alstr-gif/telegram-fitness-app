# 🚂 Deploy to Railway - Step by Step

Your code is on GitHub! Now let's deploy it to Railway.

---

## 🎯 Step 1: Go to Railway

1. **Visit:** https://railway.app
2. **Login** (if not already logged in)
3. **Click:** "New Project" button (usually top right)

---

## 🎯 Step 2: Connect GitHub Repository

1. **Select:** "Deploy from GitHub repo"
2. **Find your repository:** `alstr-gif/telegram-fitness-app`
3. **Click on it**

Railway will start detecting your project automatically.

---

## 🎯 Step 3: Add PostgreSQL Database

**Important:** Your app needs PostgreSQL!

1. **In your Railway project dashboard:**
   - Click **"+ New"** or **"+ Add Service"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**

2. **Wait for it to be "Active"** (green status)

---

## 🎯 Step 4: Get Database Connection Info

1. **Click on the PostgreSQL service** (not your app)
2. **Go to "Variables" tab**
3. **Copy these values:**
   - `PGHOST` → You'll use as `DB_HOST`
   - `PGPORT` → You'll use as `DB_PORT`
   - `PGUSER` → You'll use as `DB_USERNAME`
   - `PGPASSWORD` → You'll use as `DB_PASSWORD`
   - `PGDATABASE` → You'll use as `DB_DATABASE`

**Keep these handy!** You'll need them in the next step.

---

## 🎯 Step 5: Set Environment Variables

1. **Click on your app service** (the main one, not database)
2. **Go to "Variables" tab**
3. **Click "New Variable"** or **"Raw Editor"**

4. **Add these variables one by one:**

   **Basic Configuration:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_TYPE=postgres
   ```

   **Database (from Step 4):**
   ```
   DB_HOST=<paste PGHOST value>
   DB_PORT=<paste PGPORT value>
   DB_USERNAME=<paste PGUSER value>
   DB_PASSWORD=<paste PGPASSWORD value>
   DB_DATABASE=<paste PGDATABASE value>
   ```

   **JWT Secret (generate locally first):**
   ```bash
   # Run this in your terminal:
   npm run generate:jwt-secret
   ```
   Then add:
   ```
   JWT_SECRET=<paste the generated secret>
   JWT_EXPIRES_IN=7d
   ```

   **API Keys (from your .env.production file):**
   ```
   OPENAI_API_KEY=sk-your-openai-key
   OPENAI_MODEL=gpt-4
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ```

   **API URL (we'll update this after deployment):**
   ```
   API_URL=https://placeholder.railway.app
   ```

   **CORS (update after frontend deployment):**
   ```
   CORS_ORIGIN=https://your-frontend-url.com
   ```

5. **Save all variables**

---

## 🎯 Step 6: Watch Deployment

1. **Railway will automatically start deploying**
2. **Click on your app service**
3. **Go to "Deployments" tab**
4. **Watch the build logs**

**What to expect:**
- Installing dependencies...
- Building TypeScript...
- Starting application...

---

## 🎯 Step 7: Get Your API_URL

1. **After deployment succeeds:**
   - Click on your app service
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section

2. **Railway provides a domain:**
   - Format: `https://your-app-name.railway.app`
   - **Copy this URL!**

3. **Update API_URL variable:**
   - Go back to **"Variables"** tab
   - Find `API_URL`
   - Update it with the actual Railway URL
   - Save

---

## 🎯 Step 8: Test Your Deployment

1. **Test health endpoint:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "ok",
     "message": "Telegram Fitness App API is running"
   }
   ```

---

## ✅ Success Checklist

- [ ] Code deployed to Railway
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful (green status)
- [ ] API_URL obtained
- [ ] Health check passes

---

## 🎉 Next Steps After Deployment

1. **Update your local `.env.production`:**
   - Add the Railway API_URL
   - Add database credentials

2. **Deploy frontend:**
   - Deploy to Vercel/Netlify
   - Update `CORS_ORIGIN` in Railway

3. **Configure Telegram bot:**
   - Update menu button with frontend URL

---

**🚀 Ready to deploy! Start with Step 1 above!**



