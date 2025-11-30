# 🔧 Railway CORS_ORIGIN Fix - Exact Steps

I can't access Railway directly, but here are the exact steps with the correct value.

---

## ✅ Exact Value to Use

**Copy this value:**

```
CORS_ORIGIN=https://placeholder.com
```

**Or if you have your frontend deployed:**

```
CORS_ORIGIN=https://your-actual-frontend-url.com
```

---

## 📋 Step-by-Step (Do This)

### Step 1: Open Railway
1. Go to: https://railway.app
2. Login
3. Click on your project

### Step 2: Open Variables
1. Click on your **app service** (not PostgreSQL)
2. Click **"Variables"** tab at the top

### Step 3: Find CORS_ORIGIN
1. Look for `CORS_ORIGIN` in the list
2. Click on it to edit

### Step 4: Update Value
1. **Delete the current value** (which probably has localhost)
2. **Paste this:**
   ```
   https://placeholder.com
   ```
3. **Click "Save"** or "Update"

### Step 5: Wait for Redeploy
- Railway will automatically redeploy
- Watch the "Deployments" tab
- Wait for it to finish (usually 1-2 minutes)

---

## 🎯 Alternative: Use Raw Editor

If you see a **"Raw Editor"** button:

1. Click **"Raw Editor"**
2. Find the line: `CORS_ORIGIN=...`
3. Change it to: `CORS_ORIGIN=https://placeholder.com`
4. Click **"Save"**

---

## ✅ Verify It Worked

After redeploy, check the logs:

1. Go to **"Deployments"** tab
2. Click the latest deployment
3. Click **"View Logs"**
4. You should see: `✅ Production environment validation passed`
5. No more CORS error!

---

## 🔍 What to Look For

**Wrong (will cause error):**
```
CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN=https://your-app.com,http://localhost:3000
CORS_ORIGIN=localhost
```

**Correct (will work):**
```
CORS_ORIGIN=https://placeholder.com
CORS_ORIGIN=https://your-frontend.com
CORS_ORIGIN=https://app1.com,https://app2.com
```

---

## 📝 Quick Copy-Paste

**For Railway Variables tab, set:**

```
CORS_ORIGIN=https://placeholder.com
```

That's it! Just this one line.

---

**After you update it, Railway will redeploy and the error should be gone!**



