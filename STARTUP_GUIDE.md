# 🚀 Startup Guide

Complete guide to get your Telegram Fitness App running locally with backend, frontend, and ngrok for Telegram testing.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **Git** (for cloning if needed)
- ✅ **Telegram Bot Token** (from [@BotFather](https://t.me/botfather))
- ✅ **OpenAI API Key** (from [OpenAI Platform](https://platform.openai.com/api-keys))
- ✅ **ngrok** (for local Telegram testing) - [Download](https://ngrok.com/download) or install via npm

---

## 🔧 Part 1: Backend Setup

### Step 1.1: Navigate to Backend Directory

```bash
cd telegram-fitness-app
```

### Step 1.2: Install Dependencies

```bash
npm install
```

### Step 1.3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# If .env.example exists, copy it
cp .env.example .env

# Or create new .env file
touch .env
```

Edit `.env` and add your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database (SQLite for development - no setup needed!)
DB_TYPE=sqlite
DB_FILE=telegram_fitness.db

# For PostgreSQL (optional - uncomment if using PostgreSQL)
# DB_TYPE=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=telegram_fitness_db

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# JWT Configuration
JWT_SECRET=your_secure_random_secret_key_min_32_characters
JWT_EXPIRES_IN=7d

# CORS (for frontend)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**How to get API keys:**

1. **Telegram Bot Token:**
   - Open Telegram and search for [@BotFather](https://t.me/botfather)
   - Send `/newbot` command
   - Follow instructions to create your bot
   - Copy the token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - Make sure you have credits/billing set up

3. **JWT Secret:**
   - Generate a random string (minimum 32 characters)
   - Or use: `openssl rand -base64 32`

### Step 1.4: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
🔄 Initializing database...
✅ Database connection established successfully
📊 Database type: sqlite
🗄️  SQLite: telegram_fitness.db
✅ Server is running
📡 Port: 3000
🌍 Environment: development
🔗 API URL: http://localhost:3000
📖 API Documentation: http://localhost:3000/api/health
🤖 Starting Telegram bot...
✅ Telegram bot is running...
```

**✅ Backend is now running!** Keep this terminal open.

**Test Backend:**
```bash
# In a new terminal
curl http://localhost:3000/api/health
```

You should see a JSON response with server status.

---

## 🎨 Part 2: Frontend Setup

### Step 2.1: Navigate to Frontend Directory

Open a **new terminal** (keep backend running) and navigate to frontend:

```bash
cd fitness-frontend
```

### Step 2.2: Install Dependencies

```bash
npm install
```

### Step 2.3: Configure Frontend (Optional)

The frontend is already configured, but you can check/update `vite.config.ts`:

```typescript
// fitness-frontend/vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allows external connections (needed for ngrok)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend API
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### Step 2.4: Start Frontend Dev Server

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**✅ Frontend is now running!** Keep this terminal open.

**Test Frontend:**
- Open browser: `http://localhost:5173/`
- You should see the app interface

---

## 🌐 Part 3: Ngrok Setup (For Telegram Testing)

Ngrok creates a public URL that tunnels to your local server, allowing Telegram to access your local frontend.

### Step 3.1: Install Ngrok

**Option A: Via npm (recommended for quick setup)**
```bash
npm install -g ngrok
```

**Option B: Download from website**
- Visit [ngrok.com/download](https://ngrok.com/download)
- Download for your OS
- Extract and add to PATH

**Option C: Via Homebrew (macOS)**
```bash
brew install ngrok/ngrok/ngrok
```

### Step 3.2: Sign Up for Ngrok (Free)

1. Go to [ngrok.com](https://ngrok.com/)
2. Sign up for a free account
3. Get your authtoken from the dashboard
4. Authenticate ngrok:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Step 3.3: Start Ngrok Tunnel

Open a **new terminal** (keep backend and frontend running) and run:

```bash
ngrok http 5173
```

**Expected Output:**
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important:** Copy the `Forwarding` URL (e.g., `https://xxxx-xxxx-xxxx.ngrok-free.app`)

**✅ Ngrok is now running!** Keep this terminal open.

**Ngrok Web Interface:**
- Visit `http://127.0.0.1:4040` to see request logs and inspect traffic

---

## 🤖 Part 4: Configure Telegram Bot

### Step 4.1: Set Bot Menu Button

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send: `/setmenubutton`
3. Select your bot
4. When asked for URL, paste your **ngrok URL**:
   ```
   https://xxxx-xxxx-xxxx.ngrok-free.app
   ```
5. When asked for button text, enter:
   ```
   Open App
   ```

### Step 4.2: Test in Telegram

1. Open Telegram
2. Search for your bot (the username you created)
3. Click "Open App" button (or send `/start` and look for menu button)
4. The app should open in Telegram's Mini App interface!

---

## 📊 Complete Setup Summary

You should now have **3 terminals running**:

### Terminal 1: Backend
```bash
cd telegram-fitness-app
npm run dev
```
- ✅ Running on `http://localhost:3000`
- ✅ Database connected
- ✅ Telegram bot active

### Terminal 2: Frontend
```bash
cd fitness-frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
- ✅ Running on `http://localhost:5173`
- ✅ Proxying API calls to backend

### Terminal 3: Ngrok
```bash
ngrok http 5173
```
- ✅ Public URL: `https://xxxx-xxxx-xxxx.ngrok-free.app`
- ✅ Tunneling to localhost:5173

---

## 🧪 Testing Checklist

### Backend Tests

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","message":"Telegram Fitness App API is running",...}
```

### Frontend Tests

1. **Browser Test:**
   - Open `http://localhost:5173/`
   - App should load
   - Check browser console for errors

2. **API Connection Test:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try an action that calls API
   - Verify requests go to `http://localhost:3000/api/...`

### Telegram Test

1. **Open bot in Telegram**
2. **Click "Open App" button**
3. **Verify:**
   - ✅ App loads in Telegram Mini App
   - ✅ No console errors
   - ✅ Can interact with UI
   - ✅ API calls work (check Network tab in Telegram DevTools)

---

## 🐛 Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**Database connection failed:**
```bash
# For SQLite - check file permissions
ls -la telegram_fitness.db

# For PostgreSQL - check if running
pg_isready
psql -U postgres -d telegram_fitness_db
```

**Telegram bot not responding:**
- Check bot token in `.env`
- Verify token is correct (no extra spaces)
- Restart backend server

**OpenAI API errors:**
- Verify API key is correct
- Check you have credits in OpenAI account
- Try changing model to `gpt-3.5-turbo` in `.env`

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.ts
```

**CORS errors:**
- Verify backend has `CORS_ORIGIN=http://localhost:5173` in `.env`
- Check backend is running
- Restart backend after changing CORS settings

**API connection failed:**
- Check backend is running on port 3000
- Verify proxy configuration in `vite.config.ts`
- Check browser console for specific error

### Ngrok Issues

**"ngrok: command not found":**
```bash
# Install globally
npm install -g ngrok

# Or use npx
npx ngrok http 5173
```

**"Your account is limited":**
- Sign up for free ngrok account
- Add authtoken: `ngrok config add-authtoken YOUR_TOKEN`

**URL changes on restart:**
- Free ngrok URLs change each time you restart
- Update bot menu button URL in @BotFather
- Or upgrade to paid plan for static domain

**Connection timeout:**
- Check frontend is running on port 5173
- Verify ngrok is pointing to correct port
- Check firewall isn't blocking connections

### Telegram Issues

**App doesn't open:**
- Verify ngrok URL is correct in @BotFather
- Check ngrok is running
- Try restarting ngrok and updating URL

**App opens but shows errors:**
- Check browser console (Telegram DevTools)
- Verify backend is running
- Check API endpoints are accessible
- Verify CORS is configured correctly

**"Failed to load" error:**
- Check ngrok tunnel is active
- Verify frontend is running
- Check ngrok web interface (`http://127.0.0.1:4040`) for errors

---

## 🔄 Daily Startup Sequence

Once everything is set up, here's the quick startup sequence:

### 1. Start Backend
```bash
cd telegram-fitness-app
npm run dev
```

### 2. Start Frontend
```bash
cd fitness-frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

### 3. Start Ngrok
```bash
ngrok http 5173
```

### 4. Update Bot URL (if ngrok URL changed)
- Copy new ngrok URL
- Update in @BotFather: `/setmenubutton`

---

## 📝 Quick Reference

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migration:run # Run database migrations
```

### Frontend Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

### Ngrok Commands
```bash
ngrok http 5173                    # Start tunnel
ngrok http 5173 --domain=your.ngrok.io  # Use custom domain (paid)
ngrok config add-authtoken TOKEN  # Authenticate
```

### Useful URLs
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Ngrok Web Interface: `http://127.0.0.1:4040`
- Backend Health Check: `http://localhost:3000/api/health`

---

## 🎯 Next Steps

Once everything is running:

1. ✅ **Test the app in Telegram**
2. ✅ **Complete user profile setup**
3. ✅ **Generate your first workout**
4. ✅ **Explore the API endpoints**
5. ✅ **Start developing new features!**

---

## 📚 Additional Resources

- [Backend README](./README.md)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Frontend Setup Guide](./fitness-frontend/FRONTEND_SETUP.md)
- [Quick Start Guide](./QUICK_START.md)
- [Telegram Bot Guide](./TELEGRAM_BOT_GUIDE.md)

---

## 💡 Pro Tips

1. **Keep terminals organized:** Use terminal tabs or split panes
2. **Monitor logs:** Watch all three terminals for errors
3. **Use ngrok web interface:** Great for debugging API calls
4. **Save ngrok URL:** If using free plan, save URL to update bot quickly
5. **Check Telegram DevTools:** Use Telegram's built-in debugging tools

---

**🎉 You're all set! Happy coding!**

