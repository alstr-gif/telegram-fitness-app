# 🚨 QUICK FIX - Railway Crash

## ⚡ Fast Fix (5 minutes)

### 1. Go to Railway → Your App Service → Variables Tab

### 2. Add/Update These Variables:

```
NODE_ENV = production
PORT = 3000
DB_TYPE = postgres          ← MUST be "postgres" not "sqlite"
```

### 3. Get Database Values:

**Go to PostgreSQL service → Variables tab, copy:**
- `PGHOST` → Use as `DB_HOST`
- `PGPORT` → Use as `DB_PORT`  
- `PGUSER` → Use as `DB_USERNAME`
- `PGPASSWORD` → Use as `DB_PASSWORD`
- `PGDATABASE` → Use as `DB_DATABASE`

### 4. Add These:

```
JWT_SECRET = ulQkAlbD8vk/GAFIDSQpVyodATYnEXEvNyIhTVBaDUY=
JWT_EXPIRES_IN = 7d
OPENAI_API_KEY = sk-YOUR_REAL_KEY_HERE
OPENAI_MODEL = gpt-4
TELEGRAM_BOT_TOKEN = YOUR_REAL_TOKEN_HERE
```

### 5. Get Your Railway URL:

**Go to Settings → Domains, copy the URL, then set:**
```
API_URL = https://your-actual-railway-url.railway.app
```

### 6. Save & Wait

Railway will auto-redeploy. Check logs for:
- ✅ `Production environment validation passed`
- ✅ `Server is running`

---

## ❌ Common Mistakes:

- ❌ `DB_TYPE=sqlite` → ✅ `DB_TYPE=postgres`
- ❌ `API_URL=http://localhost:3000` → ✅ `API_URL=https://your-app.railway.app`
- ❌ Missing `OPENAI_API_KEY` → ✅ Must start with `sk-`
- ❌ Missing `TELEGRAM_BOT_TOKEN` → ✅ Must be real token
- ❌ `JWT_SECRET=change_this_secret` → ✅ Use the long secret above

---

**See `RAILWAY_FIX_CRASHING.md` for detailed instructions.**


