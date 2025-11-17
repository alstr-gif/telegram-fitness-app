# 🚀 Production Setup Guide

Quick guide to set up your production environment for the Telegram Fitness App.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Production hosting provider selected (Railway, Heroku, DigitalOcean, etc.)
- ✅ PostgreSQL database provisioned
- ✅ Domain name registered (for HTTPS)
- ✅ SSL certificate configured
- ✅ Telegram bot created via @BotFather
- ✅ OpenAI API account with credits

---

## 🔧 Step 1: Generate JWT Secret

Generate a secure JWT secret for production:

```bash
# Option 1: Using the helper script
npm run generate:jwt-secret

# Option 2: Using OpenSSL directly
openssl rand -base64 32
```

**Save the generated secret** - you'll need it for your `.env` file.

---

## 📝 Step 2: Create Production Environment File

Create a `.env` file in the project root with the following configuration:

```env
# ============================================
# Application Configuration
# ============================================
NODE_ENV=production
PORT=3000
API_URL=https://your-production-api-domain.com

# ============================================
# Database Configuration (PostgreSQL Required)
# ============================================
DB_TYPE=postgres
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password-min-8-chars
DB_DATABASE=telegram_fitness_db

# ============================================
# JWT Authentication
# ============================================
# Use the secret generated in Step 1
JWT_SECRET=your-generated-secret-from-step-1-min-32-chars
JWT_EXPIRES_IN=7d

# ============================================
# OpenAI Configuration
# ============================================
OPENAI_API_KEY=sk-your-production-openai-api-key
OPENAI_MODEL=gpt-4

# ============================================
# Telegram Bot Configuration
# ============================================
TELEGRAM_BOT_TOKEN=your-production-telegram-bot-token

# ============================================
# CORS Configuration
# ============================================
# Include your frontend URL and Telegram Mini App URL
CORS_ORIGIN=https://your-frontend-domain.com,https://your-telegram-miniapp-url.com
```

**Important:** Replace all placeholder values with your actual production values!

---

## 🔍 Step 3: Validate Configuration

Run the production readiness checks:

```bash
# Quick check (shell script)
npm run check:production

# Full validation (TypeScript - more comprehensive)
npm run validate:production
```

Fix any errors before proceeding.

---

## 🗄️ Step 4: Database Setup

### Create Database

If using a managed PostgreSQL service, the database is usually created automatically. If you need to create it manually:

```bash
# Connect to your PostgreSQL server
psql -h your-db-host -U your-db-username

# Create database
CREATE DATABASE telegram_fitness_db;

# Exit
\q
```

### Run Migrations

```bash
npm run migration:run
```

---

## 🏗️ Step 5: Build Application

Build the application for production:

```bash
# Build TypeScript
npm run build

# Verify build succeeded
ls -la dist/
```

---

## 🧪 Step 6: Test Locally (Optional)

Before deploying, test the production build locally:

```bash
# Set production environment
export NODE_ENV=production

# Start production server
npm start

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 🚀 Step 7: Deploy

Follow your hosting provider's deployment instructions:

### Railway.app
```bash
railway login
railway link
railway up
```

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### DigitalOcean App Platform
- Use web interface to connect repository
- Set environment variables in dashboard
- Deploy

---

## ✅ Step 8: Post-Deployment Verification

After deployment, verify everything works:

1. **Health Check**
   ```bash
   curl https://your-api-domain.com/api/health
   ```

2. **Telegram Bot**
   - Open Telegram
   - Search for your bot
   - Send `/start` command
   - Verify bot responds

3. **Frontend**
   - Open frontend URL in browser
   - Verify it loads correctly
   - Test API connectivity

4. **Menu Button**
   - In Telegram, check bot menu button
   - Click "Open App"
   - Verify frontend opens in Telegram Mini App

---

## 🔐 Security Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] No default/placeholder values remain
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database password is strong (8+ characters)
- [ ] HTTPS is enabled for API and frontend
- [ ] CORS is configured correctly
- [ ] `.env` file is NOT committed to version control
- [ ] Production secrets are different from development

---

## 🛠️ Helper Scripts

### Generate JWT Secret
```bash
npm run generate:jwt-secret
```

### Check Production Readiness
```bash
npm run check:production
```

### Validate Production Config
```bash
npm run validate:production
```

---

## 📚 Additional Resources

- [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Complete deployment checklist
- [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) - Production readiness assessment
- [CRITICAL_FIXES_APPLIED.md](./CRITICAL_FIXES_APPLIED.md) - Security fixes documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration guide

---

## 🆘 Troubleshooting

### Application won't start
- Check environment variables: `npm run validate:production`
- Verify database connection
- Check logs for specific errors

### Database connection fails
- Verify database credentials
- Check network/firewall rules
- Ensure database is accessible from server

### CORS errors
- Verify CORS_ORIGIN includes frontend URL
- Ensure URLs use HTTPS
- Check browser console for specific errors

### Telegram bot not responding
- Verify TELEGRAM_BOT_TOKEN is correct
- Check bot is not running elsewhere
- Review server logs for errors

---

## 📞 Support

If you encounter issues:

1. Check the logs: `tail -f your-log-file`
2. Run validation: `npm run validate:production`
3. Review [PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
4. Check error messages for specific guidance

---

**🎉 You're ready to deploy!**

Follow the steps above, and your Telegram Fitness App will be production-ready.

