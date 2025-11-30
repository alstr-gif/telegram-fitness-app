# 🚂 Railway Configuration - Step-by-Step Guide

Complete walkthrough for configuring your Telegram Fitness App on Railway.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Railway account (create at https://railway.app if needed)
- ✅ GitHub account
- ✅ Your code pushed to GitHub
- ✅ Telegram Bot Token (from @BotFather)
- ✅ OpenAI API Key (from https://platform.openai.com/api-keys)

---

## Step 1: Login to Railway

1. **Go to Railway:**
   - Open https://railway.app in your browser
   - Click **"Login"** or **"Start a New Project"**

2. **Sign in with GitHub:**
   - Railway will ask you to authorize GitHub access
   - Click **"Authorize Railway"** or **"Connect GitHub"**
   - This allows Railway to access your repositories

---

## Step 2: Create New Project

1. **In Railway Dashboard:**
   - Click the **"New Project"** button (usually top right or center)
   - You'll see options:
     - **"Deploy from GitHub repo"** ← **Choose this one**
     - "Empty Project"
     - "Deploy a Template"

2. **Select Your Repository:**
   - Railway will show your GitHub repositories
   - Find and click on **`telegram-fitness-app`** (or your repo name)
   - Railway will start setting up the project

3. **Project Created:**
   - Railway will create a new project
   - You'll see your repository connected
   - Railway will automatically detect it's a Node.js project

---

## Step 3: Add PostgreSQL Database

**Important:** Your app needs PostgreSQL in production!

1. **In your Railway project dashboard:**
   - Click the **"+ New"** button (usually at the bottom or top)
   - A menu will appear

2. **Select Database:**
   - Click **"Database"** from the menu
   - Select **"PostgreSQL"**

3. **Database Created:**
   - Railway will create a PostgreSQL database
   - You'll see a new service appear (usually named "Postgres" or "PostgreSQL")
   - Wait for it to finish provisioning (green status)

4. **Note the Database Service:**
   - You'll need to get connection details from this service
   - Keep this tab/page open - you'll come back to it

---

## Step 4: Get Database Connection Details

1. **Click on the PostgreSQL service:**
   - In your Railway project, click on the **PostgreSQL** service (not the main app service)

2. **Go to Variables Tab:**
   - Click on the **"Variables"** tab
   - You'll see these variables:
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

3. **Copy These Values:**
   - You'll need to copy these values to your main app service
   - **Don't close this tab** - you'll reference it in the next step

**Example of what you'll see:**
```
PGHOST=containers-us-west-123.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=abc123xyz456...
PGDATABASE=railway
```

---

## Step 5: Configure Main App Service

1. **Click on Your Main Service:**
   - In Railway project, click on your **main app service** (usually has your repo name)
   - This is NOT the PostgreSQL service

2. **Go to Variables Tab:**
   - Click on the **"Variables"** tab
   - You'll see an empty list or some default variables

3. **Add Environment Variables:**
   - Click **"New Variable"** button
   - Add variables one by one, OR use "Raw Editor" to paste multiple

---

## Step 6: Add Required Environment Variables

Add these variables to your main app service. You can add them one by one, or use the "Raw Editor" for bulk entry.

### Option A: Add One by One (Recommended for First Time)

Click "New Variable" for each:

#### 1. Basic Configuration
```
Variable Name: NODE_ENV
Value: production
```

```
Variable Name: PORT
Value: 3000
```

```
Variable Name: DB_TYPE
Value: postgres
```

#### 2. Database Configuration
Use the values from your PostgreSQL service:

```
Variable Name: DB_HOST
Value: <paste value from PGHOST>
```

```
Variable Name: DB_PORT
Value: <paste value from PGPORT>
```

```
Variable Name: DB_USERNAME
Value: <paste value from PGUSER>
```

```
Variable Name: DB_PASSWORD
Value: <paste value from PGPASSWORD>
```

```
Variable Name: DB_DATABASE
Value: <paste value from PGDATABASE>
```

#### 3. JWT Secret
Generate a strong secret first:

**On your local machine, run:**
```bash
npm run generate:jwt-secret
```

Or generate manually:
```bash
openssl rand -base64 32
```

Then add:
```
Variable Name: JWT_SECRET
Value: <paste the generated secret>
```

```
Variable Name: JWT_EXPIRES_IN
Value: 7d
```

#### 4. OpenAI Configuration
```
Variable Name: OPENAI_API_KEY
Value: sk-your-actual-openai-api-key-here
```

```
Variable Name: OPENAI_MODEL
Value: gpt-4
```

#### 5. Telegram Bot Configuration
```
Variable Name: TELEGRAM_BOT_TOKEN
Value: your-actual-telegram-bot-token-here
```

#### 6. API URL (Set After Deployment)
For now, you can set a placeholder:
```
Variable Name: API_URL
Value: https://placeholder.railway.app
```

**Important:** After deployment, Railway will give you a real URL. You'll need to update this variable with the actual URL.

#### 7. CORS Origin (Set After Frontend Deployment)
For now, you can leave this empty or set a placeholder:
```
Variable Name: CORS_ORIGIN
Value: https://your-frontend-url.com
```

**Note:** Update this after you deploy your frontend.

### Option B: Use Raw Editor (Faster)

1. Click **"Raw Editor"** button in Variables tab
2. Paste this template and fill in the values:

```env
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=<paste from PGHOST>
DB_PORT=<paste from PGPORT>
DB_USERNAME=<paste from PGUSER>
DB_PASSWORD=<paste from PGPASSWORD>
DB_DATABASE=<paste from PGDATABASE>
JWT_SECRET=<generate with: npm run generate:jwt-secret>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=your-actual-bot-token-here
API_URL=https://placeholder.railway.app
CORS_ORIGIN=https://your-frontend-url.com
```

3. Replace all `<...>` placeholders with actual values
4. Click **"Save"** or **"Update"**

---

## Step 7: Verify Build Settings

Railway usually auto-detects Node.js projects, but let's verify:

1. **In your main app service:**
   - Go to **"Settings"** tab
   - Scroll to **"Build & Deploy"** section

2. **Verify these settings:**
   - **Build Command:** Should be empty (auto-detects `npm install`) OR `npm install`
   - **Start Command:** Should be empty (auto-detects `npm start`) OR `npm start`
   - **Root Directory:** Should be `/` (root of repo)

3. **If settings are wrong:**
   - Update them to match above
   - Click **"Save"**

---

## Step 8: Deploy

1. **Railway will auto-deploy:**
   - When you connected the GitHub repo, Railway started deploying
   - If not, click **"Deploy"** button

2. **Watch the deployment:**
   - Go to **"Deployments"** tab
   - Click on the latest deployment
   - Watch the build logs

3. **What to expect:**
   - Railway will run `npm install`
   - Then run `npm run build` (TypeScript compilation)
   - Then run `npm start`
   - You should see: `✅ Server is running`

4. **If deployment fails:**
   - Check the build logs for errors
   - Common issues:
     - Missing environment variables → Add them
     - Build errors → Check TypeScript compilation locally
     - Start errors → Check Railway runtime logs

---

## Step 9: Get Your API URL

After successful deployment:

1. **In your main app service:**
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section

2. **Railway provides a default domain:**
   - Format: `https://your-app-name.railway.app`
   - Or: `https://your-project-name-production.up.railway.app`
   - Copy this URL

3. **Update API_URL variable:**
   - Go back to **"Variables"** tab
   - Find `API_URL` variable
   - Click to edit
   - Replace placeholder with the actual Railway URL
   - Save

**Example:**
```
API_URL=https://telegram-fitness-app-production.up.railway.app
```

---

## Step 10: Verify Deployment

1. **Test Health Endpoint:**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

   **Expected response:**
   ```json
   {
     "status": "ok",
     "message": "Telegram Fitness App API is running",
     "timestamp": "2025-01-XX..."
   }
   ```

2. **Check Railway Logs:**
   - Go to **"Deployments"** tab
   - Click latest deployment
   - Click **"View Logs"**
   - Look for:
     - `✅ Database connection established successfully`
     - `✅ Server is running`
     - `📡 Port: 3000`
     - No error messages

3. **Test Database Connection:**
   - Check logs for: `✅ Database connection established successfully`
   - If you see database errors, verify:
     - Database service is running (green status)
     - Database variables match PostgreSQL service exactly
     - `DB_TYPE=postgres` is set

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
- Railway build logs for specific errors
- Verify `package.json` has `build` and `start` scripts
- Try building locally: `npm run build`

**Common fixes:**
- Missing dependencies → Check `package.json`
- TypeScript errors → Fix in code, commit, push
- Build timeout → Railway free tier has limits

### Issue: App Won't Start

**Check:**
- Railway runtime logs
- Verify all environment variables are set
- Check database connection variables

**Common fixes:**
- Missing environment variables → Add them
- Database not connected → Check database service is running
- Wrong start command → Verify `package.json` has `start` script

### Issue: Database Connection Fails

**Check:**
- Database service is running (green status)
- Environment variables match database service exactly
- `DB_TYPE=postgres` is set

**Fix:**
- Copy exact values from PostgreSQL service variables
- Ensure all DB_* variables are correct
- Check Railway logs for specific error messages

### Issue: Health Check Returns Error

**Check:**
- Railway logs for startup errors
- Verify server started successfully
- Check if port is correct (Railway sets `PORT` automatically)

---

## 📋 Quick Reference: All Variables

Here's a complete list of all variables you need:

```env
# Basic
NODE_ENV=production
PORT=3000

# Database (from Railway PostgreSQL service)
DB_TYPE=postgres
DB_HOST=<from PGHOST>
DB_PORT=<from PGPORT>
DB_USERNAME=<from PGUSER>
DB_PASSWORD=<from PGPASSWORD>
DB_DATABASE=<from PGDATABASE>

# JWT
JWT_SECRET=<generate with: npm run generate:jwt-secret>
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4

# Telegram
TELEGRAM_BOT_TOKEN=your-token

# URLs (update after deployment)
API_URL=https://your-app.railway.app
CORS_ORIGIN=https://your-frontend-url.com
```

---

## ✅ Checklist

Use this checklist to ensure everything is configured:

### Railway Setup
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] Project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Database service is running (green)

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DB_TYPE=postgres`
- [ ] Database variables (DB_HOST, DB_PORT, etc.) from PostgreSQL service
- [ ] `JWT_SECRET` generated and set (32+ characters)
- [ ] `OPENAI_API_KEY` set
- [ ] `TELEGRAM_BOT_TOKEN` set
- [ ] `API_URL` set (after deployment)

### Deployment
- [ ] Build successful (check logs)
- [ ] App started successfully (check logs)
- [ ] Health check works: `/api/health`
- [ ] Database connection successful (check logs)
- [ ] `API_URL` updated with Railway domain

---

## 🎯 Next Steps

After Railway is configured:

1. **Deploy Frontend** (if ready)
   - Deploy to Vercel/Netlify
   - Update `CORS_ORIGIN` in Railway with frontend URL

2. **Configure Telegram Bot**
   - Update bot menu button with frontend URL
   - Test bot commands

3. **Monitor**
   - Watch Railway logs for first 24 hours
   - Set up monitoring/uptime checks

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Check deployment logs** in Railway dashboard

---

**🎉 You're all set! Follow these steps and your app will be live on Railway!**


