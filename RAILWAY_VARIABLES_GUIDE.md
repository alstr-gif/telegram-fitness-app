# 🔧 Railway: Where to Set Environment Variables

Step-by-step guide to find and set environment variables in Railway.

---

## 📍 Step-by-Step Navigation

### Step 1: Open Your Railway Project

1. **Go to:** https://railway.app
2. **You should see your project dashboard**
3. **You'll see two services:**
   - Your app service (Node.js/your app name)
   - PostgreSQL service (database)

---

### Step 2: Click on Your App Service

**Important:** Click on the **APP service**, NOT the database!

**How to identify:**
- Your app service usually has your project name or "web" or "api"
- It might show "Node.js" or your app name
- The database service says "PostgreSQL" or "Database"

**Visual guide:**
```
Railway Dashboard
├── 📦 Your Project Name
    ├── 🟢 [Your App Service] ← CLICK THIS ONE
    └── 🗄️  [PostgreSQL] ← NOT THIS ONE
```

---

### Step 3: Find the Variables Tab

After clicking your app service, you'll see a page with tabs at the top:

**Tabs you'll see:**
- **Deployments** (shows build history)
- **Variables** ← **CLICK THIS TAB**
- **Settings**
- **Metrics**
- **Logs**

**The "Variables" tab is usually the 2nd or 3rd tab from the left.**

---

### Step 4: Add Variables

Once you're in the "Variables" tab, you'll see:

**Two options:**
1. **"New Variable"** button - Click to add one variable at a time
2. **"Raw Editor"** button - Click to add multiple variables at once (easier!)

**Recommended: Use "Raw Editor"**

Click **"Raw Editor"** and you'll see a text box where you can paste:

```
NODE_ENV=production
PORT=3000
DB_TYPE=postgres
DB_HOST=your-db-host
...
```

---

## 🎯 Visual Guide

```
Railway Dashboard
│
├── [Your Project]
│   │
│   ├── Click: [Your App Service] ← START HERE
│   │   │
│   │   └── Tabs at top:
│   │       ├── Deployments
│   │       ├── Variables ← CLICK THIS
│   │       ├── Settings
│   │       └── Logs
│   │
│   └── [PostgreSQL] ← DON'T CLICK THIS
```

---

## 🔍 If You Can't Find It

### Option A: Check Service Type

Make sure you clicked the **correct service**:
- ✅ Your app service (shows "Node.js" or your app name)
- ❌ NOT the PostgreSQL/database service

### Option B: Look for "Environment" or "Env"

Some Railway interfaces show:
- "Environment Variables"
- "Env"
- "Config"

All of these are the same as "Variables"

### Option C: Check Settings Tab

Sometimes variables are under:
- Settings → Environment Variables
- Settings → Variables

---

## 📝 Quick Checklist

- [ ] I'm in Railway dashboard
- [ ] I see my project with 2 services
- [ ] I clicked the APP service (not database)
- [ ] I see tabs at the top
- [ ] I clicked "Variables" tab
- [ ] I see "New Variable" or "Raw Editor" button

---

## 💡 Pro Tip

**Use "Raw Editor"** - It's much faster!
- Click "Raw Editor"
- Paste all your variables at once
- Format: `KEY=value` (one per line)
- Click "Save"

---

## 🆘 Still Can't Find It?

**Take a screenshot** of your Railway dashboard and I can help you locate it!

Or describe what you see:
- What services do you see?
- What tabs are visible?
- What does the page look like?

---

**The Variables tab should be visible once you click on your app service!**



