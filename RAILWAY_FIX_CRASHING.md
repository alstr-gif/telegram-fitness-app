# 🚨 Fix Railway Deployment Crash

Your app is crashing because environment variables are missing or incorrect. Here's how to fix each error:

---

## ❌ Errors Found in Logs

1. ❌ `DB_TYPE` is SQLite (must be `postgres`)
2. ❌ `DB_PASSWORD` is too short (must be 8+ characters)
3. ❌ `JWT_SECRET` is missing, too short, or using default value
4. ❌ `OPENAI_API_KEY` is missing or invalid format
5. ❌ `TELEGRAM_BOT_TOKEN` is missing
6. ❌ `API_URL` is localhost (must be production HTTPS URL)

---

## ✅ Step-by-Step Fix

### Step 1: Go to Railway Variables

1. **In Railway dashboard:**
   - Click on your **main app service** (not PostgreSQL)
   - Click **"Variables"** tab

### Step 2: Fix Each Variable

Add or update these variables one by one:

#### 1. Fix Database Type
```
Variable: DB_TYPE
Value: postgres
```
**Important:** Must be exactly `postgres` (not `sqlite`)

#### 2. Fix Database Password
If you're using Railway's PostgreSQL, the password should be long enough. But verify:
- Go to **PostgreSQL service** → **Variables** tab
- Copy the `PGPASSWORD` value
- Make sure it's at least 8 characters

Then in your main app:
```
Variable: DB_PASSWORD
Value: <paste the exact PGPASSWORD from PostgreSQL service>
```

#### 3. Fix JWT Secret
```
Variable: JWT_SECRET
Value: ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
```

**Or generate a new one:**
```bash
openssl rand -base64 32
```

#### 4. Fix OpenAI API Key
```
Variable: OPENAI_API_KEY
Value: sk-your-actual-openai-key-here
```

**Important:** 
- Must start with `sk-`
- Must be your actual OpenAI API key (not a placeholder)
- Get it from: https://platform.openai.com/api-keys

#### 5. Fix Telegram Bot Token
```
Variable: TELEGRAM_BOT_TOKEN
Value: your-actual-telegram-bot-token-here
```

**Important:**
- Must be your actual bot token from @BotFather
- Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- Get it from: https://t.me/botfather

#### 6. Fix API URL
First, get your Railway URL:
1. Go to your main app service → **Settings** tab
2. Scroll to **"Domains"** section
3. Copy the URL (e.g., `https://your-app.railway.app`)

Then set:
```
Variable: API_URL
Value: https://your-actual-railway-url.railway.app
```

**Important:**
- Must start with `https://`
- Must NOT be `localhost`
- Use your actual Railway domain

### Step 3: Verify All Database Variables

Make sure you have ALL database variables set correctly:

1. **Go to PostgreSQL service** → **Variables** tab
2. **Copy these exact values:**
   - `PGHOST` → Use as `DB_HOST`
   - `PGPORT` → Use as `DB_PORT`
   - `PGUSER` → Use as `DB_USERNAME`
   - `PGPASSWORD` → Use as `DB_PASSWORD`
   - `PGDATABASE` → Use as `DB_DATABASE`

3. **In your main app service** → **Variables** tab, set:
```
Variable: DB_HOST
Value: <paste PGHOST>

Variable: DB_PORT
Value: <paste PGPORT>

Variable: DB_USERNAME
Value: <paste PGUSER>

Variable: DB_PASSWORD
Value: <paste PGPASSWORD>

Variable: DB_DATABASE
Value: <paste PGDATABASE>
```

### Step 4: Complete Variable List

Make sure you have ALL of these variables set:

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
OPENAI_API_KEY=sk-your-actual-key
OPENAI_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=your-actual-bot-token
API_URL=https://your-actual-railway-url.railway.app
CORS_ORIGIN=https://your-frontend-url.com
```

---

## 🔍 Quick Check: Use Raw Editor

1. **In Variables tab, click "Raw Editor"**
2. **You should see all variables listed**
3. **Verify each one matches the list above**

---

## ✅ After Fixing Variables

1. **Railway will auto-redeploy** when you save variables
2. **Watch the deployment:**
   - Go to **"Deployments"** tab
   - Click latest deployment
   - Watch the logs

3. **Look for success messages:**
   - ✅ `Production environment validation passed`
   - ✅ `Database connection established successfully`
   - ✅ `Server is running`

4. **If it still crashes:**
   - Check the new error messages
   - Verify all variables are set correctly
   - Make sure no typos in variable names

---

## 🆘 Common Mistakes

### ❌ Wrong Variable Names
- `DB_TYPE` not `DATABASE_TYPE`
- `JWT_SECRET` not `JWT_SECRET_KEY`
- `OPENAI_API_KEY` not `OPENAI_KEY`

### ❌ Wrong Values
- `DB_TYPE=sqlite` → Should be `postgres`
- `API_URL=http://localhost:3000` → Should be `https://your-app.railway.app`
- `JWT_SECRET=change_this_secret` → Should be a long random string

### ❌ Missing Variables
- Make sure ALL variables from the list above are set
- Check for typos in variable names
- Verify values are not empty

---

## 📋 Checklist

Before redeploying, verify:

- [ ] `NODE_ENV=production`
- [ ] `DB_TYPE=postgres` (NOT sqlite)
- [ ] All database variables set (DB_HOST, DB_PORT, etc.)
- [ ] `DB_PASSWORD` is from PostgreSQL service (8+ chars)
- [ ] `JWT_SECRET` is 32+ characters (not default)
- [ ] `OPENAI_API_KEY` starts with `sk-` (real key)
- [ ] `TELEGRAM_BOT_TOKEN` is set (real token)
- [ ] `API_URL` is HTTPS URL (not localhost)
- [ ] All variables saved in Railway

---

## 🎯 Quick Fix Template

Copy this to Railway Raw Editor and fill in your values:

```env
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=<get from PostgreSQL service>
DB_PORT=<get from PostgreSQL service>
DB_USERNAME=<get from PostgreSQL service>
DB_PASSWORD=<get from PostgreSQL service>
DB_DATABASE=<get from PostgreSQL service>
JWT_SECRET=ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-<YOUR_REAL_KEY_HERE>
OPENAI_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=<YOUR_REAL_TOKEN_HERE>
API_URL=https://<YOUR_RAILWAY_URL>.railway.app
CORS_ORIGIN=https://your-frontend-url.com
```

**Replace:**
- `<get from PostgreSQL service>` → Copy from PostgreSQL service variables
- `<YOUR_REAL_KEY_HERE>` → Your actual OpenAI API key
- `<YOUR_REAL_TOKEN_HERE>` → Your actual Telegram bot token
- `<YOUR_RAILWAY_URL>` → Your Railway domain

---

**After fixing all variables, Railway will redeploy automatically. Watch the logs to see if it starts successfully!**


