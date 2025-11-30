# 🚂 Railway Configuration - Quick Checklist

Print this page and check off items as you complete them.

---

## Step 1: Railway Setup ✅

- [ ] Login to Railway (https://railway.app)
- [ ] Authorize GitHub access
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your `telegram-fitness-app` repository
- [ ] Project created successfully

---

## Step 2: Add PostgreSQL Database ✅

- [ ] Click "+ New" → "Database" → "PostgreSQL"
- [ ] Wait for database to provision (green status)
- [ ] Click on PostgreSQL service
- [ ] Go to "Variables" tab
- [ ] **Copy these values** (you'll need them):
  - [ ] `PGHOST` = _______________________
  - [ ] `PGPORT` = _______________________
  - [ ] `PGUSER` = _______________________
  - [ ] `PGPASSWORD` = _______________________
  - [ ] `PGDATABASE` = _______________________

---

## Step 3: Generate JWT Secret ✅

**On your local machine, run one of these:**

```bash
# Option 1: Use the script
npm run generate:jwt-secret

# Option 2: Manual generation
openssl rand -base64 32
```

- [ ] JWT Secret generated: _______________________
- [ ] Secret is 32+ characters long

---

## Step 4: Configure Main App Service ✅

- [ ] Click on your main app service (not PostgreSQL)
- [ ] Go to "Variables" tab
- [ ] Click "New Variable" or "Raw Editor"

---

## Step 5: Add Environment Variables ✅

Add these variables (use values from Step 2 for database):

### Basic Configuration
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `DB_TYPE` = `postgres`

### Database Configuration (from Step 2)
- [ ] `DB_HOST` = `<PGHOST value>`
- [ ] `DB_PORT` = `<PGPORT value>`
- [ ] `DB_USERNAME` = `<PGUSER value>`
- [ ] `DB_PASSWORD` = `<PGPASSWORD value>`
- [ ] `DB_DATABASE` = `<PGDATABASE value>`

### JWT Configuration
- [ ] `JWT_SECRET` = `<from Step 3>`
- [ ] `JWT_EXPIRES_IN` = `7d`

### OpenAI Configuration
- [ ] `OPENAI_API_KEY` = `sk-_______________________`
- [ ] `OPENAI_MODEL` = `gpt-4`

### Telegram Configuration
- [ ] `TELEGRAM_BOT_TOKEN` = `_______________________`

### URLs (Update After Deployment)
- [ ] `API_URL` = `https://placeholder.railway.app` (update later)
- [ ] `CORS_ORIGIN` = `https://your-frontend-url.com` (update after frontend deploy)

---

## Step 6: Verify Build Settings ✅

- [ ] Go to main app service → "Settings" tab
- [ ] Check "Build & Deploy" section:
  - [ ] Build Command: empty or `npm install`
  - [ ] Start Command: empty or `npm start`
  - [ ] Root Directory: `/`

---

## Step 7: Deploy ✅

- [ ] Railway auto-deployed (or click "Deploy")
- [ ] Go to "Deployments" tab
- [ ] Watch build logs
- [ ] Build successful ✅
- [ ] App started successfully ✅
- [ ] See "✅ Server is running" in logs

---

## Step 8: Get API URL ✅

- [ ] Go to main app service → "Settings" tab
- [ ] Scroll to "Domains" section
- [ ] Copy Railway URL: `https://_______________________.railway.app`
- [ ] Go back to "Variables" tab
- [ ] Update `API_URL` with actual Railway URL
- [ ] Save

---

## Step 9: Verify Deployment ✅

- [ ] Test health endpoint:
  ```bash
  curl https://your-app.railway.app/api/health
  ```
- [ ] Response shows: `{"status":"ok",...}`
- [ ] Check Railway logs:
  - [ ] `✅ Database connection established successfully`
  - [ ] `✅ Server is running`
  - [ ] No error messages

---

## ✅ All Done!

Your app should now be live on Railway!

**Next Steps:**
- [ ] Deploy frontend (if ready)
- [ ] Update `CORS_ORIGIN` with frontend URL
- [ ] Configure Telegram bot menu button
- [ ] Test end-to-end functionality

---

## 🆘 Troubleshooting

**Build fails?**
- Check build logs for errors
- Verify `package.json` has `build` and `start` scripts

**App won't start?**
- Check runtime logs
- Verify all environment variables are set
- Check database variables match PostgreSQL service

**Database connection fails?**
- Verify database service is running (green)
- Check database variables are correct
- Ensure `DB_TYPE=postgres` is set

**Health check fails?**
- Check Railway logs for startup errors
- Verify server started successfully

---

**📚 Full Guide:** See `RAILWAY_CONFIGURATION_GUIDE.md` for detailed instructions.


