# 🚂 Railway.app Deployment Guide

Step-by-step guide to deploy your Telegram Fitness App to Railway.

---

## 📋 Prerequisites

- ✅ Railway account created (you have this!)
- ✅ GitHub account
- ✅ Your code pushed to GitHub repository
- ✅ Node.js project ready

---

## 🚀 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub (If Not Already Done)

**If your code is already on GitHub, skip to Step 2.**

If not, push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Telegram Fitness App"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Important:** Make sure your `.env` file is in `.gitignore` (it should be by default).

---

### Step 2: Connect Railway to GitHub

1. **Login to Railway:**
   - Go to https://railway.app
   - Click "Login" or "Dashboard"

2. **Authorize GitHub (if not done):**
   - Railway will ask to connect to GitHub
   - Click "Authorize" or "Connect GitHub"
   - This allows Railway to access your repositories

---

### Step 3: Create New Project

1. **In Railway Dashboard:**
   - Click the **"New Project"** button (usually top right or center)
   - You'll see options:
     - "Deploy from GitHub repo" ← **Choose this one**
     - "Empty Project"
     - "Deploy a Template"

2. **Select "Deploy from GitHub repo":**
   - Railway will show your GitHub repositories
   - Find your `telegram-fitness-app` repository
   - Click on it

---

### Step 4: Railway Detects Your Project

Railway will automatically:
- ✅ Detect it's a Node.js project (from `package.json`)
- ✅ Show you the project structure
- ✅ Prepare for deployment

**What you'll see:**
- Project name (you can change it)
- Repository link
- Build settings (usually auto-detected)

---

### Step 5: Configure Build Settings (If Needed)

Railway usually auto-detects everything, but verify:

1. **Build Command:**
   - Should be: `npm install` (automatic)
   - Or: `npm ci` (for production)

2. **Start Command:**
   - Should be: `npm start`
   - Railway will use: `node dist/index.js` (from your package.json)

3. **Root Directory:**
   - Usually: `/` (root of repo)
   - If your backend is in a subfolder, specify it

**Your package.json already has:**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

So Railway should detect this automatically!

---

### Step 6: Add PostgreSQL Database

**Important:** Your app needs PostgreSQL in production!

1. **In your Railway project:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**

2. **Railway will:**
   - Create a PostgreSQL database
   - Show you connection details
   - Automatically set environment variables

**You'll see:**
- `PGHOST`
- `PGPORT`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`

**Note these down!** You'll need them for your `.env` file.

---

### Step 7: Set Environment Variables

1. **In Railway project:**
   - Click on your **service** (the main app, not the database)
   - Go to **"Variables"** tab
   - Click **"New Variable"**

2. **Add these variables one by one:**

   ```env
   NODE_ENV=production
   PORT=3000
   DB_TYPE=postgres
   ```

3. **Database Variables:**
   Railway automatically provides these from the PostgreSQL service:
   - `PGHOST` → Use as `DB_HOST`
   - `PGPORT` → Use as `DB_PORT`
   - `PGUSER` → Use as `DB_USERNAME`
   - `PGPASSWORD` → Use as `DB_PASSWORD`
   - `PGDATABASE` → Use as `DB_DATABASE`

   **How to get them:**
   - Click on your **PostgreSQL service**
   - Go to **"Variables"** tab
   - Copy the values
   - Add them to your main service as:
     - `DB_HOST` = value from `PGHOST`
     - `DB_PORT` = value from `PGPORT`
     - `DB_USERNAME` = value from `PGUSER`
     - `DB_PASSWORD` = value from `PGPASSWORD`
     - `DB_DATABASE` = value from `PGDATABASE`

4. **Add remaining variables:**
   ```env
   # Generate JWT secret first
   # Run: npm run generate:jwt-secret
   JWT_SECRET=your-generated-jwt-secret-here
   JWT_EXPIRES_IN=7d
   
   # Your API keys
   OPENAI_API_KEY=sk-your-openai-key
   OPENAI_MODEL=gpt-4
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   
   # API URL (Railway will provide this after deployment)
   # For now, you can set a placeholder or wait
   API_URL=https://your-app.railway.app
   
   # CORS (update after you deploy frontend)
   CORS_ORIGIN=https://your-frontend-url.com
   ```

**Tip:** You can add variables one by one, or use Railway's "Raw Editor" to paste multiple at once.

---

### Step 8: Deploy

1. **Railway will automatically start deploying:**
   - When you connect the repo, Railway starts deployment
   - Or click **"Deploy"** button if needed

2. **Watch the build logs:**
   - Click on your service
   - Go to **"Deployments"** tab
   - Watch the build process

3. **What happens:**
   - Railway installs dependencies: `npm install`
   - Builds your app: `npm run build` (runs `tsc`)
   - Starts your app: `npm start` (runs `node dist/index.js`)

---

### Step 9: Get Your API_URL

1. **After deployment succeeds:**
   - Click on your service
   - Go to **"Settings"** tab
   - Find **"Domains"** section

2. **Railway provides a default domain:**
   - Format: `https://your-app-name.railway.app`
   - Or: `https://your-project-name-production.up.railway.app`

3. **Copy this URL:**
   - This is your **API_URL**!
   - Update it in Railway variables:
     - Go to **"Variables"** tab
     - Update `API_URL` with the actual Railway URL

---

### Step 10: Verify Deployment

1. **Test your API:**
   ```bash
   # Replace with your actual Railway URL
   curl https://your-app.railway.app/api/health
   ```

2. **Expected response:**
   ```json
   {
     "status": "ok",
     "message": "Telegram Fitness App API is running",
     ...
   }
   ```

3. **Check logs:**
   - In Railway dashboard
   - Click on your service
   - Go to **"Deployments"** → Click latest deployment → **"View Logs"**
   - Look for: `✅ Server is running`

---

## 🔧 Troubleshooting

### Build Fails

**Check:**
- Build logs in Railway dashboard
- Ensure `package.json` has `build` and `start` scripts
- Verify TypeScript compiles: `npm run build` locally

**Common issues:**
- Missing dependencies → Check `package.json`
- TypeScript errors → Fix in code, commit, redeploy
- Build timeout → Railway free tier has limits

### App Won't Start

**Check:**
- Environment variables are set correctly
- Database connection works
- Port is set correctly (Railway uses PORT env var automatically)

**Common issues:**
- Missing environment variables → Add them in Railway
- Database not connected → Check database service is running
- Wrong start command → Verify `package.json` has `start` script

### Database Connection Fails

**Check:**
- Database service is running (green status)
- Environment variables match database service
- Use Railway's provided database variables

**Fix:**
- Copy exact values from PostgreSQL service variables
- Ensure `DB_TYPE=postgres` is set
- Verify all DB_* variables are correct

---

## 📋 Railway Dashboard Overview

### Main Sections:

1. **Services:**
   - Your app (Node.js service)
   - Your database (PostgreSQL service)

2. **Variables:**
   - Environment variables for each service
   - Can be shared between services

3. **Deployments:**
   - History of all deployments
   - Build logs
   - Runtime logs

4. **Settings:**
   - Service configuration
   - Domains/URLs
   - Resource limits

---

## 🎯 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] API_URL obtained from Railway
- [ ] Health check passes: `curl https://your-app.railway.app/api/health`

---

## 💡 Pro Tips

1. **Use Railway's variable reference:**
   - You can reference database variables: `${{Postgres.PGHOST}}`
   - Makes it easier to connect services

2. **Monitor logs:**
   - Railway shows real-time logs
   - Great for debugging

3. **Automatic deployments:**
   - Railway auto-deploys on git push
   - Push to main branch = production deploy

4. **Free tier limits:**
   - 500 hours/month free
   - $5 credit monthly
   - Perfect for getting started

---

## 🚀 Next Steps After Deployment

1. **Update API_URL:**
   - Get your Railway URL
   - Update `API_URL` variable in Railway
   - Update your local `.env.production` file

2. **Deploy frontend:**
   - Deploy frontend to Vercel/Netlify
   - Update `CORS_ORIGIN` in Railway with frontend URL

3. **Configure Telegram bot:**
   - Update bot menu button with frontend URL
   - Test bot commands

4. **Run database migrations:**
   ```bash
   # Connect to Railway database and run migrations
   # Or add migration script to Railway
   ```

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Check deployment logs** in Railway dashboard

---

**🎉 You're ready to deploy!**

Follow the steps above, and your app will be live on Railway in minutes!

