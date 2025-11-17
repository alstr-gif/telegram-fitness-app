# 🚂 Railway Quick Start - Step by Step

Walkthrough for deploying to Railway.app

---

## 📋 Before You Start

Make sure you have:
- ✅ Railway account (you have this!)
- ✅ GitHub account
- ✅ Your code ready

---

## Step 1: Push Code to GitHub (If Needed)

**If your code is already on GitHub, skip to Step 2.**

### Option A: Create New GitHub Repository

1. **Go to GitHub:**
   - Visit https://github.com
   - Click "+" → "New repository"

2. **Create repository:**
   - Name: `telegram-fitness-app` (or your choice)
   - Description: "Telegram Fitness App"
   - Choose: **Public** or **Private**
   - **Don't** initialize with README (you already have code)
   - Click "Create repository"

3. **Push your code:**
   ```bash
   cd /Users/aleksandrsstramkals/telegram-fitness-app
   
   # Initialize git (if not done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - ready for Railway deployment"
   
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/telegram-fitness-app.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

**Important:** Make sure `.env` is in `.gitignore` (it should be by default).

---

## Step 2: Connect Railway to GitHub

1. **Go to Railway:**
   - Visit https://railway.app
   - Click "Login" or "Dashboard"

2. **Authorize GitHub:**
   - If prompted, click "Authorize Railway" or "Connect GitHub"
   - This allows Railway to access your repositories
   - Grant necessary permissions

---

## Step 3: Create New Project

1. **In Railway Dashboard:**
   - Look for **"New Project"** button
   - Usually at top right or center of dashboard
   - Click it

2. **Select "Deploy from GitHub repo":**
   - You'll see options:
     - ✅ **"Deploy from GitHub repo"** ← Click this
     - "Empty Project"
     - "Deploy a Template"

3. **Select Your Repository:**
   - Railway shows your GitHub repositories
   - Find `telegram-fitness-app` (or whatever you named it)
   - **Click on the repository name**

---

## Step 4: Railway Auto-Detects Your Project

Railway will:
- ✅ Detect it's a Node.js project (from `package.json`)
- ✅ Show project structure
- ✅ Start preparing deployment

**What you'll see:**
- Project name (you can edit it)
- Repository link
- "Deploying..." or build starting

---

## Step 5: Add PostgreSQL Database

**This is important!** Your app needs PostgreSQL.

1. **In your Railway project:**
   - You'll see your app service
   - Click **"+ New"** button (usually top right)
   - Or click **"+ Add Service"**

2. **Select Database:**
   - Choose **"Database"** from the menu
   - Select **"PostgreSQL"**

3. **Railway creates database:**
   - A new PostgreSQL service appears
   - Railway automatically sets it up
   - Wait for it to be "Active" (green status)

---

## Step 6: Get Database Connection Info

1. **Click on PostgreSQL service:**
   - In your Railway project
   - Click on the **PostgreSQL** service (not your app)

2. **Go to Variables tab:**
   - Click **"Variables"** tab
   - You'll see:
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

3. **Note these values down** (you'll need them next)

---

## Step 7: Set Environment Variables for Your App

1. **Click on your app service:**
   - Go back to your main app service (not database)
   - Click on it

2. **Go to Variables tab:**
   - Click **"Variables"** tab
   - Click **"New Variable"** or **"Raw Editor"**

3. **Add these variables:**

   **Basic Configuration:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_TYPE=postgres
   ```

   **Database (from Step 6):**
   ```
   DB_HOST=<value from PGHOST>
   DB_PORT=<value from PGPORT>
   DB_USERNAME=<value from PGUSER>
   DB_PASSWORD=<value from PGPASSWORD>
   DB_DATABASE=<value from PGDATABASE>
   ```

   **JWT (generate first):**
   ```bash
   # Run this locally to generate:
   npm run generate:jwt-secret
   ```
   Then add:
   ```
   JWT_SECRET=<paste the generated secret>
   JWT_EXPIRES_IN=7d
   ```

   **API Keys:**
   ```
   OPENAI_API_KEY=sk-your-openai-key-here
   OPENAI_MODEL=gpt-4
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
   ```

   **API URL (we'll update this after deployment):**
   ```
   API_URL=https://placeholder.railway.app
   ```

   **CORS (update after frontend deployment):**
   ```
   CORS_ORIGIN=https://your-frontend-url.com
   ```

4. **Save variables:**
   - Click "Save" or "Add"
   - Railway will automatically redeploy with new variables

---

## Step 8: Watch Deployment

1. **Railway starts deploying automatically:**
   - After you connect the repo, deployment begins
   - You'll see build logs

2. **Monitor progress:**
   - Click on your app service
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Watch the build logs

3. **What to expect:**
   ```
   Installing dependencies...
   npm install
   Building...
   npm run build
   Starting...
   npm start
   ```

---

## Step 9: Get Your API_URL

1. **After deployment succeeds:**
   - Click on your app service
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section

2. **Railway provides a domain:**
   - Format: `https://your-app-name.railway.app`
   - Or: `https://your-project-production.up.railway.app`
   - **Copy this URL!**

3. **Update API_URL variable:**
   - Go back to **"Variables"** tab
   - Find `API_URL`
   - Update it with the actual Railway URL
   - Save

---

## Step 10: Test Your Deployment

1. **Test health endpoint:**
   ```bash
   # Replace with your actual Railway URL
   curl https://your-app.railway.app/api/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "ok",
     "message": "Telegram Fitness App API is running"
   }
   ```

3. **Check logs:**
   - In Railway dashboard
   - App service → Deployments → Latest → View Logs
   - Look for: `✅ Server is running`

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] API_URL obtained
- [ ] Health check passes

---

## 🎯 What's Next?

1. **Update your local `.env.production`:**
   - Copy the Railway API_URL
   - Update database credentials
   - Save for reference

2. **Deploy frontend:**
   - Deploy to Vercel/Netlify
   - Update `CORS_ORIGIN` in Railway

3. **Configure Telegram bot:**
   - Update menu button with frontend URL

---

## 🆘 Troubleshooting

**Build fails?**
- Check deployment logs
- Ensure `package.json` has `build` and `start` scripts
- Verify TypeScript compiles locally

**App won't start?**
- Check environment variables are set
- Verify database connection variables
- Check logs for error messages

**Database connection fails?**
- Ensure PostgreSQL service is running
- Verify DB_* variables match PostgreSQL service variables
- Check database service is "Active"

---

**🎉 You're all set!**

Follow these steps and your app will be live on Railway!

