# 🚂 Railway Configuration - Exact Steps

Follow these steps exactly. I'll guide you through each click.

---

## 📝 Before You Start

**You'll need:**
- ✅ Telegram Bot Token (from @BotFather)
- ✅ OpenAI API Key (from https://platform.openai.com/api-keys)
- ✅ JWT Secret (I generated one for you below)

**Your JWT Secret (copy this):**
```
ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
```

---

## 🎯 Step-by-Step Instructions

### STEP 1: Login & Create Project

1. **Go to:** https://railway.app
2. **Click:** "Login" or "Start a New Project"
3. **Click:** "Login with GitHub" (authorize if asked)
4. **Click:** "New Project" button (top right)
5. **Click:** "Deploy from GitHub repo"
6. **Click:** Your repository name (`telegram-fitness-app`)
7. ✅ **Done!** Railway is now setting up your project

---

### STEP 2: Add PostgreSQL Database

1. **In your Railway project dashboard:**
   - Look for a **"+ New"** button (usually at the bottom)
   - **Click:** "+ New"
2. **Click:** "Database" from the menu
3. **Click:** "PostgreSQL"
4. ✅ **Wait** for database to provision (you'll see a green status)
5. **Click:** On the **PostgreSQL** service (the new database service)

---

### STEP 3: Copy Database Credentials

1. **In the PostgreSQL service:**
   - **Click:** "Variables" tab (at the top)
2. **You'll see these variables - COPY THEM:**
   - `PGHOST` → Copy this value
   - `PGPORT` → Copy this value  
   - `PGUSER` → Copy this value
   - `PGPASSWORD` → Copy this value
   - `PGDATABASE` → Copy this value

**Write them down here:**
```
PGHOST = _______________________
PGPORT = _______________________
PGUSER = _______________________
PGPASSWORD = _______________________
PGDATABASE = _______________________
```

3. **Keep this tab open** - you'll need these values in the next step

---

### STEP 4: Configure Your App Service

1. **Go back to your main project dashboard**
2. **Click:** On your **main app service** (usually has your repo name, NOT the PostgreSQL service)
3. **Click:** "Variables" tab (at the top)

---

### STEP 5: Add Environment Variables

You have two options:

#### Option A: Add One by One (Easier for First Time)

**For each variable below:**
1. Click "New Variable" button
2. Enter the Variable Name
3. Enter the Value
4. Click "Add" or "Save"

**Add these variables:**

**1. Basic Settings:**
```
Variable: NODE_ENV
Value: production
```

```
Variable: PORT
Value: 3000
```

```
Variable: DB_TYPE
Value: postgres
```

**2. Database Settings (use values from Step 3):**
```
Variable: DB_HOST
Value: <paste PGHOST value from Step 3>
```

```
Variable: DB_PORT
Value: <paste PGPORT value from Step 3>
```

```
Variable: DB_USERNAME
Value: <paste PGUSER value from Step 3>
```

```
Variable: DB_PASSWORD
Value: <paste PGPASSWORD value from Step 3>
```

```
Variable: DB_DATABASE
Value: <paste PGDATABASE value from Step 3>
```

**3. JWT Settings:**
```
Variable: JWT_SECRET
Value: ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
```

```
Variable: JWT_EXPIRES_IN
Value: 7d
```

**4. OpenAI Settings:**
```
Variable: OPENAI_API_KEY
Value: <paste your OpenAI API key>
```

```
Variable: OPENAI_MODEL
Value: gpt-4
```

**5. Telegram Settings:**
```
Variable: TELEGRAM_BOT_TOKEN
Value: <paste your Telegram bot token>
```

**6. URLs (we'll update these later):**
```
Variable: API_URL
Value: https://placeholder.railway.app
```

```
Variable: CORS_ORIGIN
Value: https://your-frontend-url.com
```

#### Option B: Use Raw Editor (Faster)

1. **Click:** "Raw Editor" button (in Variables tab)
2. **Paste this template:**
```env
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=<paste PGHOST>
DB_PORT=<paste PGPORT>
DB_USERNAME=<paste PGUSER>
DB_PASSWORD=<paste PGPASSWORD>
DB_DATABASE=<paste PGDATABASE>
JWT_SECRET=ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=<paste your OpenAI key>
OPENAI_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=<paste your Telegram bot token>
API_URL=https://placeholder.railway.app
CORS_ORIGIN=https://your-frontend-url.com
```

3. **Replace** all `<paste ...>` with actual values
4. **Click:** "Save" or "Update"

---

### STEP 6: Verify Build Settings

1. **In your main app service:**
   - **Click:** "Settings" tab
   - Scroll to "Build & Deploy" section
2. **Verify:**
   - Build Command: (should be empty or `npm install`)
   - Start Command: (should be empty or `npm start`)
   - Root Directory: `/`
3. **If wrong, fix and save**

---

### STEP 7: Deploy

1. **Railway should auto-deploy** when you connected the repo
2. **If not:**
   - Click "Deploy" button
3. **Watch deployment:**
   - **Click:** "Deployments" tab
   - **Click:** Latest deployment
   - Watch the logs
4. **Look for:**
   - ✅ Build successful
   - ✅ `npm install` completed
   - ✅ `npm run build` completed
   - ✅ `npm start` completed
   - ✅ `Server is running`

---

### STEP 8: Get Your API URL

1. **In your main app service:**
   - **Click:** "Settings" tab
   - Scroll to "Domains" section
2. **You'll see a URL like:**
   - `https://your-app-name.railway.app`
   - Or: `https://your-project-production.up.railway.app`
3. **Copy this URL**
4. **Go back to "Variables" tab**
5. **Find `API_URL` variable**
6. **Click to edit**
7. **Replace** `https://placeholder.railway.app` with your actual Railway URL
8. **Save**

**Example:**
```
API_URL=https://telegram-fitness-app-production.up.railway.app
```

---

### STEP 9: Test Your Deployment

1. **Open terminal** (on your computer)
2. **Run:**
   ```bash
   curl https://your-actual-railway-url.railway.app/api/health
   ```
   (Replace with your actual Railway URL)

3. **Expected response:**
   ```json
   {
     "status": "ok",
     "message": "Telegram Fitness App API is running",
     "timestamp": "..."
   }
   ```

4. **Check Railway logs:**
   - Go to "Deployments" tab
   - Click latest deployment
   - Click "View Logs"
   - Look for: `✅ Database connection established successfully`

---

## ✅ You're Done!

If you see:
- ✅ Health check returns `{"status":"ok"}`
- ✅ Logs show "Server is running"
- ✅ No errors in logs

**Then your app is live! 🎉**

---

## 🆘 Common Issues

### "Build failed"
- Check build logs for errors
- Make sure all environment variables are set
- Try building locally: `npm run build`

### "App won't start"
- Check runtime logs
- Verify all environment variables are set correctly
- Check database variables match PostgreSQL service

### "Database connection failed"
- Verify PostgreSQL service is running (green status)
- Check database variables are exactly as shown in PostgreSQL service
- Ensure `DB_TYPE=postgres` is set

### "Health check returns error"
- Check Railway logs for startup errors
- Verify server started successfully
- Check if all required variables are set

---

## 📋 Quick Reference

**All Variables You Need:**
```env
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=<from PostgreSQL service>
DB_PORT=<from PostgreSQL service>
DB_USERNAME=<from PostgreSQL service>
DB_PASSWORD=<from PostgreSQL service>
DB_DATABASE=<from PostgreSQL service>
JWT_SECRET=ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=<your key>
OPENAI_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=<your token>
API_URL=<update after deployment>
CORS_ORIGIN=<update after frontend deployment>
```

---

**Need more help?** Check `RAILWAY_CONFIGURATION_GUIDE.md` for detailed explanations.


