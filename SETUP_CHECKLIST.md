# ✅ Setup Checklist

Follow this checklist to get your Telegram Fitness App up and running!

## Prerequisites ✓

- [ ] Node.js v18+ installed
- [ ] PostgreSQL v14+ installed and running
- [ ] Code editor (VS Code recommended)
- [ ] Terminal access

---

## Step 1: Database Setup 🗄️

- [ ] PostgreSQL is running
  ```bash
  # Check with:
  pg_isready
  ```

- [ ] Create database
  ```bash
  createdb telegram_fitness_db
  ```

- [ ] Test connection
  ```bash
  psql -U postgres -d telegram_fitness_db
  # Type \q to exit
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 2: Get API Credentials 🔑

### Telegram Bot Token

- [ ] Open Telegram
- [ ] Search for `@BotFather`
- [ ] Send `/newbot`
- [ ] Follow instructions
- [ ] Copy bot token (format: `123456789:ABC-DEF...`)
- [ ] Save token somewhere safe

### OpenAI API Key

- [ ] Go to https://platform.openai.com/api-keys
- [ ] Sign in / Create account
- [ ] Click "Create new secret key"
- [ ] Copy key (starts with `sk-`)
- [ ] Save key somewhere safe
- [ ] Verify you have credits/billing set up

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 3: Project Setup 📦

- [ ] Navigate to project directory
  ```bash
  cd telegram-fitness-app
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Wait for installation to complete (may take 2-3 minutes)

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 4: Environment Configuration ⚙️

- [ ] Copy example env file
  ```bash
  cp .env.example .env
  ```

- [ ] Open `.env` in editor
  ```bash
  code .env
  # or
  nano .env
  ```

- [ ] Fill in the following values:

### Database Settings
```env
DB_HOST=localhost              # ✓ Usually localhost
DB_PORT=5432                   # ✓ Default PostgreSQL port
DB_USERNAME=postgres           # ✓ Your PostgreSQL username
DB_PASSWORD=                   # ⚠️ ADD YOUR PASSWORD
DB_DATABASE=telegram_fitness_db # ✓ Already created
```

### OpenAI Settings
```env
OPENAI_API_KEY=               # ⚠️ ADD YOUR KEY (sk-...)
OPENAI_MODEL=gpt-4            # ✓ Or use gpt-3.5-turbo
```

### Telegram Settings
```env
TELEGRAM_BOT_TOKEN=           # ⚠️ ADD YOUR TOKEN
```

### JWT Settings
```env
JWT_SECRET=                   # ⚠️ ADD RANDOM STRING (32+ chars)
JWT_EXPIRES_IN=7d             # ✓ Default is fine
```

- [ ] Save the `.env` file

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 5: Start the Application 🚀

- [ ] Start development server
  ```bash
  npm run dev
  ```

- [ ] Look for success messages:
  - [ ] ✅ Database connection established
  - [ ] ✅ Server is running
  - [ ] ✅ Telegram bot is running

- [ ] Note the server URL (default: http://localhost:3000)

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 6: Test the Setup 🧪

### Test 1: API Health Check
- [ ] Open new terminal
- [ ] Run:
  ```bash
  curl http://localhost:3000/api/health
  ```
- [ ] Should see: `{"status":"ok",...}`

### Test 2: Telegram Bot
- [ ] Open Telegram app
- [ ] Search for your bot (username from BotFather)
- [ ] Click "START" or send `/start`
- [ ] Should see welcome message

### Test 3: Bot Commands
- [ ] Send `/help` - should see commands list
- [ ] Send `/setup` - should see profile setup

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Step 7: Complete User Flow 👤

- [ ] In Telegram, send `/start`
- [ ] Set up your fitness profile
- [ ] Generate a workout plan
- [ ] View your workouts

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Common Issues & Solutions 🔧

### Issue: Database Connection Failed
**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Verify it's running
pg_isready
```

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port in .env
PORT=3001
```

### Issue: Bot Not Responding
**Solution:**
- Check bot token in `.env`
- Restart server (Ctrl+C, then `npm run dev`)
- Make sure bot token doesn't have extra spaces

### Issue: OpenAI API Error
**Solution:**
- Verify API key is correct
- Check OpenAI account has credits
- Try using `gpt-3.5-turbo` if you don't have GPT-4 access

### Issue: npm install Fails
**Solution:**
```bash
# Clear cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Reference 📚

### Useful Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check database
psql -U postgres -d telegram_fitness_db

# View logs in real-time
npm run dev | grep -v node_modules
```

### Important Files
- `.env` - Your configuration
- `src/index.ts` - Entry point
- `src/config/database.ts` - Database setup
- `src/services/TelegramBotService.ts` - Bot logic

### Documentation
- `README.md` - Full documentation
- `QUICK_START.md` - Quick start guide
- `PROJECT_SUMMARY.md` - Project overview

---

## Final Checklist ✅

Before you start developing:

- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Telegram bot responds
- [ ] API endpoints work
- [ ] You can generate a workout plan
- [ ] All environment variables are set
- [ ] You've read the README.md

---

## Next Steps 🎯

Now that everything is set up:

1. **Explore the API**
   - Try different endpoints
   - Test with cURL or Postman
   - Read the API documentation

2. **Customize the Bot**
   - Modify bot commands
   - Add new features
   - Improve AI prompts

3. **Build the Frontend**
   - Create Telegram Mini App
   - Design beautiful UI
   - Connect to API

4. **Deploy to Production**
   - Set up hosting
   - Configure production environment
   - Set up monitoring

---

## 🎉 Congratulations!

Your Telegram Fitness App backend is now running!

**Need help?** Check the README.md or PROJECT_SUMMARY.md for more details.

**Found a bug?** Make a note and fix it later, or create an issue.

**Ready to build?** Start with the frontend or enhance the backend features!

---

**Happy Coding! 🚀**

