# 🔧 Fix: CORS_ORIGIN Error in Railway

**Error:** `❌ CRITICAL: CORS_ORIGIN must not include localhost in production`

This means your `CORS_ORIGIN` variable in Railway has `localhost` in it, which is not allowed in production.

---

## ✅ Solution: Update CORS_ORIGIN in Railway

### Step 1: Go to Railway Variables

1. **Railway Dashboard** → Your Project
2. **Click your app service** (not database)
3. **Click "Variables" tab**

### Step 2: Find CORS_ORIGIN

Look for the `CORS_ORIGIN` variable in your list.

### Step 3: Update the Value

**Current (wrong):**
```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```
or
```
CORS_ORIGIN=https://your-frontend.com,http://localhost:5173
```

**Fixed (correct):**
```
CORS_ORIGIN=https://your-frontend-domain.com
```

**Important:**
- ✅ Must use **HTTPS** (not HTTP)
- ✅ Must **NOT** include `localhost`
- ✅ Must **NOT** include `127.0.0.1`
- ✅ Use your actual frontend URL (when you deploy it)

---

## 🎯 Temporary Fix (For Testing)

If you haven't deployed your frontend yet, you can use a placeholder:

```
CORS_ORIGIN=https://placeholder.com
```

**Or** use your Railway frontend URL if you've deployed it there.

---

## 📝 Correct Format

**Single URL:**
```
CORS_ORIGIN=https://your-frontend.com
```

**Multiple URLs (comma-separated, no spaces):**
```
CORS_ORIGIN=https://your-frontend.com,https://your-telegram-miniapp.com
```

---

## 🔍 How to Check Current Value

In Railway:
1. Go to Variables tab
2. Find `CORS_ORIGIN`
3. Check if it contains:
   - `localhost`
   - `127.0.0.1`
   - `http://` (should be `https://`)

If any of these are present, remove them!

---

## ✅ Quick Fix Steps

1. **Railway** → Your App → Variables tab
2. **Find:** `CORS_ORIGIN`
3. **Edit:** Remove any `localhost` or `127.0.0.1`
4. **Ensure:** All URLs use `https://`
5. **Save**
6. **Railway will automatically redeploy**

---

## 🎯 Example Values

**If frontend not deployed yet:**
```
CORS_ORIGIN=https://placeholder.com
```

**If frontend deployed to Vercel:**
```
CORS_ORIGIN=https://your-app.vercel.app
```

**If frontend deployed to Netlify:**
```
CORS_ORIGIN=https://your-app.netlify.app
```

**If frontend deployed to Railway:**
```
CORS_ORIGIN=https://your-frontend.railway.app
```

---

## ⚠️ Important Notes

- **No localhost** in production
- **HTTPS only** (not HTTP)
- **Comma-separated** if multiple URLs (no spaces)
- **Update after frontend deployment** with actual URL

---

**Update CORS_ORIGIN in Railway Variables and the error will be fixed!**



