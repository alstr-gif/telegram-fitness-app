# 🔧 Fix: Repository Rule Violations

The error "push declined due to repository rule violations" means GitHub has branch protection rules enabled.

---

## ✅ Solution: Disable Branch Protection (Temporarily)

### Step 1: Go to Repository Settings

1. **Visit:** https://github.com/alstr-gif/telegram-fitness-app/settings
2. **Click:** "Branches" in the left sidebar
3. **Look for:** "Branch protection rules"

### Step 2: Disable Protection

1. **If you see a rule for `main` branch:**
   - Click on it
   - Scroll down
   - Click **"Delete"** or **"Disable"**

2. **Or create a new rule:**
   - If no rule exists, you might need to check "Rules" tab
   - Look for any rules blocking pushes

### Step 3: Try Push Again

After disabling protection:

```bash
git push -u origin main
```

### Step 4: Re-enable Protection (Optional)

After successful push, you can re-enable branch protection if you want.

---

## 🔄 Alternative: Use Different Branch Name

If you can't disable protection, try pushing to a different branch:

```bash
# Create and push to a new branch
git checkout -b deploy
git push -u origin deploy
```

Then in GitHub, you can merge this branch to main.

---

## 🎯 Quick Fix: Check Repository Rules

1. **Go to:** https://github.com/alstr-gif/telegram-fitness-app/settings/rules
2. **Check if there are any rules:**
   - Branch protection rules
   - Required status checks
   - Required reviews

3. **Temporarily disable them** for the initial push

---

## 💡 Most Likely Issue

GitHub might have:
- Required status checks (CI/CD)
- Required pull request reviews
- Required branches to be up to date

**Solution:** Disable these temporarily, push, then re-enable if needed.

---

**Try disabling branch protection rules first, then push again!**

