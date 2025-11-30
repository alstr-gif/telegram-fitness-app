# ➕ Add CORS_ORIGIN Variable in Railway

Since CORS_ORIGIN doesn't exist yet, you need to **add it as a new variable**.

---

## 📋 Step-by-Step: Add New Variable

### Step 1: Go to Variables Tab

1. **Railway Dashboard** → Your Project
2. **Click your app service** (not PostgreSQL)
3. **Click "Variables" tab**

### Step 2: Add New Variable

You should see one of these:

**Option A: "New Variable" button**
- Click **"New Variable"** button
- A form will appear

**Option B: "Raw Editor" button**
- Click **"Raw Editor"** button
- You'll see a text box

**Option C: "+" or "Add" button**
- Click the **"+"** or **"Add"** button
- A form will appear

---

## 🎯 Method 1: Using "New Variable" Button

1. **Click "New Variable"**
2. **In the form:**
   - **Name/Key:** `CORS_ORIGIN`
   - **Value:** `https://placeholder.com`
3. **Click "Save"** or "Add"

---

## 🎯 Method 2: Using "Raw Editor" (Easier!)

1. **Click "Raw Editor"** button
2. **You'll see existing variables** (like NODE_ENV, PORT, etc.)
3. **Add a new line at the end:**
   ```
   CORS_ORIGIN=https://placeholder.com
   ```
4. **Click "Save"**

---

## 📝 What You Should See

After adding, you should see in the Variables list:

```
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
...
CORS_ORIGIN=https://placeholder.com  ← NEW!
```

---

## 🔍 If You Don't See Any Buttons

**Check:**
1. Are you in the **Variables tab**? (not Deployments or Settings)
2. Are you on the **app service**? (not the database service)
3. Scroll down - buttons might be at the bottom

---

## ✅ After Adding

1. **Railway will automatically redeploy**
2. **Watch the Deployments tab**
3. **Check logs** - error should be gone!

---

## 🎯 Quick Copy-Paste

**In Raw Editor, add this line:**

```
CORS_ORIGIN=https://placeholder.com
```

**Or in New Variable form:**
- Key: `CORS_ORIGIN`
- Value: `https://placeholder.com`

---

**Add the variable and Railway will redeploy automatically!**



