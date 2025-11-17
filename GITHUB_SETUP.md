# 📦 GitHub Setup - Step by Step

How to push your code to GitHub so Railway can deploy it.

---

## 🖥️ Where to Run These Commands

**Run these commands in your Terminal (command line).**

### On macOS:
- Open **Terminal** app (Applications → Utilities → Terminal)
- Or press `Cmd + Space`, type "Terminal", press Enter

### On Windows:
- Open **Command Prompt** or **PowerShell**
- Or use **Git Bash** (if you have Git installed)

---

## 📋 Step-by-Step Instructions

### Step 1: Open Terminal

1. **Open Terminal app** on your Mac
2. You'll see a command prompt like: `$` or `%`

### Step 2: Navigate to Your Project

Type this command and press Enter:

```bash
cd /Users/aleksandrsstramkals/telegram-fitness-app
```

**What this does:** Changes directory to your project folder

**Expected output:** Your prompt should show you're in the project directory

---

### Step 3: Check if Git is Installed

Type this and press Enter:

```bash
git --version
```

**Expected output:** Something like `git version 2.x.x`

**If you get an error:** Install Git first:
- macOS: `xcode-select --install`
- Or download from: https://git-scm.com/downloads

---

### Step 4: Initialize Git Repository

Type this and press Enter:

```bash
git init
```

**Expected output:** `Initialized empty Git repository in /Users/aleksandrsstramkals/telegram-fitness-app/.git`

---

### Step 5: Add All Files

Type this and press Enter:

```bash
git add .
```

**What this does:** Stages all files for commit

**Expected output:** (No output is normal - it means success)

---

### Step 6: Create First Commit

Type this and press Enter:

```bash
git commit -m "Initial commit"
```

**Expected output:** 
```
[main (or master) <commit-hash>] Initial commit
 X files changed, Y insertions(+)
```

---

### Step 7: Create GitHub Repository First

**Before running the next commands, you need to create the repository on GitHub:**

1. **Go to GitHub:**
   - Visit https://github.com
   - Make sure you're logged in

2. **Create new repository:**
   - Click the **"+"** icon (top right)
   - Select **"New repository"**

3. **Fill in details:**
   - **Repository name:** `telegram-fitness-app`
   - **Description:** (optional) "Telegram Fitness App"
   - **Visibility:** Choose **Public** or **Private**
   - **⚠️ IMPORTANT:** Do NOT check "Initialize with README"
   - **⚠️ IMPORTANT:** Do NOT add .gitignore or license
   - Click **"Create repository"**

4. **GitHub will show you setup instructions**
   - You'll see a page with commands
   - **Don't use those** - use the commands below instead

---

### Step 8: Connect to GitHub

**Replace `YOUR_USERNAME` with your actual GitHub username!**

For example, if your GitHub username is `johnsmith`, the URL would be:
`https://github.com/johnsmith/telegram-fitness-app.git`

**Type this (replace YOUR_USERNAME):**

```bash
git remote add origin https://github.com/YOUR_USERNAME/telegram-fitness-app.git
```

**Example (if username is johnsmith):**
```bash
git remote add origin https://github.com/johnsmith/telegram-fitness-app.git
```

**Expected output:** (No output means success)

---

### Step 9: Set Main Branch

Type this and press Enter:

```bash
git branch -M main
```

**Expected output:** (No output is normal)

---

### Step 10: Push to GitHub

Type this and press Enter:

```bash
git push -u origin main
```

**What happens:**
- GitHub will ask for your credentials
- **Username:** Your GitHub username
- **Password:** You'll need a **Personal Access Token** (not your GitHub password)

**If you get authentication error:**
- GitHub no longer accepts passwords
- You need a Personal Access Token

---

### Step 11: Create Personal Access Token (If Needed)

If GitHub asks for authentication:

1. **Go to GitHub Settings:**
   - Visit https://github.com/settings/tokens
   - Or: GitHub → Your profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate new token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - **Note:** Give it a name like "Railway Deployment"
   - **Expiration:** Choose duration (90 days recommended)
   - **Scopes:** Check **`repo`** (full control of private repositories)
   - Click **"Generate token"**

3. **Copy the token:**
   - ⚠️ **IMPORTANT:** Copy it immediately - you won't see it again!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Use token as password:**
   - When `git push` asks for password
   - **Username:** Your GitHub username
   - **Password:** Paste the Personal Access Token

---

## ✅ Complete Command Sequence

Here's the complete sequence (run one at a time):

```bash
# 1. Navigate to project
cd /Users/aleksandrsstramkals/telegram-fitness-app

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. Create commit
git commit -m "Initial commit"

# 5. Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/telegram-fitness-app.git

# 6. Set main branch
git branch -M main

# 7. Push to GitHub (will ask for credentials)
git push -u origin main
```

---

## 🎯 Quick Checklist

- [ ] Terminal opened
- [ ] Navigated to project directory
- [ ] Git installed (`git --version` works)
- [ ] GitHub repository created (on github.com)
- [ ] Know your GitHub username
- [ ] Personal Access Token ready (if needed)
- [ ] Ready to run commands

---

## 🆘 Troubleshooting

### "fatal: not a git repository"
- You're not in the project directory
- Run: `cd /Users/aleksandrsstramkals/telegram-fitness-app`

### "git: command not found"
- Git is not installed
- Install: `xcode-select --install` (macOS)

### "remote origin already exists"
- You already added the remote
- Skip the `git remote add` step
- Or remove it first: `git remote remove origin`

### "Authentication failed"
- You need a Personal Access Token
- Follow Step 11 above

### "repository not found"
- Check your GitHub username is correct
- Verify repository exists on GitHub
- Make sure repository name matches

---

## 📝 Example Session

Here's what a successful session looks like:

```bash
$ cd /Users/aleksandrsstramkals/telegram-fitness-app
$ git init
Initialized empty Git repository in /Users/aleksandrsstramkals/telegram-fitness-app/.git

$ git add .
$ git commit -m "Initial commit"
[main abc1234] Initial commit
 150 files changed, 5000 insertions(+)

$ git remote add origin https://github.com/johnsmith/telegram-fitness-app.git
$ git branch -M main
$ git push -u origin main
Username for 'https://github.com': johnsmith
Password for 'https://johnsmith@github.com': [paste token]
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Writing objects: 100% (150/150), done.
To https://github.com/johnsmith/telegram-fitness-app.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ Success!

When you see:
```
To https://github.com/YOUR_USERNAME/telegram-fitness-app.git
 * [new branch]      main -> main
```

**🎉 Your code is now on GitHub!**

**Next step:** Go back to Railway and deploy from GitHub repo!

---

**Need help?** Let me know which step you're on and what error you're seeing!

