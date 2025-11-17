# 🔧 Quick Fix: "not a git repository" Error

You're getting this error because you're not in the project directory.

---

## ✅ Solution

**You're currently in:** `~` (home directory)  
**You need to be in:** `/Users/aleksandrsstramkals/telegram-fitness-app`

---

## 📝 Run This Command First

In your Terminal, type this and press Enter:

```bash
cd /Users/aleksandrsstramkals/telegram-fitness-app
```

**What this does:** Changes to your project directory

**Expected output:** Your prompt should change to show the project path

---

## ✅ Then Continue with Git Commands

After navigating to the project directory, run:

```bash
git init
```

This should work now!

---

## 🎯 Complete Sequence

Run these commands **one at a time**:

```bash
# 1. Navigate to project (DO THIS FIRST!)
cd /Users/aleksandrsstramkals/telegram-fitness-app

# 2. Now initialize git
git init

# 3. Add files
git add .

# 4. Commit
git commit -m "Initial commit"
```

---

## 💡 How to Know You're in the Right Directory

After running `cd /Users/aleksandrsstramkals/telegram-fitness-app`, your Terminal prompt should show something like:

```
Aleksandrss-MacBook-Air:telegram-fitness-app aleksandrsstramkals$
```

Notice it says `telegram-fitness-app` instead of just `~`.

---

**Try the `cd` command first, then run `git init` again!**

