# 🚀 Quick Start Guide

Get your Telegram Fitness App running in 5 minutes!

## Step 1: Create PostgreSQL Database

```bash
# Option 1: Using createdb command
createdb telegram_fitness_db

# Option 2: Using psql
psql -U postgres
# Then in psql:
CREATE DATABASE telegram_fitness_db;
\q
```

## Step 2: Get Your API Keys

### Telegram Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send: `/newbot`
3. Choose a name: `My Fitness Coach`
4. Choose a username: `my_fitness_coach_bot` (must end with 'bot')
5. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

## Step 3: Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your favorite editor
nano .env
# or
code .env
```

**Add your credentials to `.env`:**
```env
# Database (update if using different credentials)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_DATABASE=telegram_fitness_db

# OpenAI
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4

# Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE

# JWT (generate a random string)
JWT_SECRET=your_random_secret_key_min_32_characters_long
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
✅ Server is running
📡 Port: 3000
🌍 Environment: development
🔗 API URL: http://localhost:3000
🤖 Starting Telegram bot...
✅ Telegram bot is running...
```

## Step 6: Test Your Bot

1. Open Telegram
2. Search for your bot (username you created with BotFather)
3. Click "Start" or send `/start`
4. You should see the welcome message!

## Step 7: Test the API

Open a new terminal and run:

```bash
# Check health
curl http://localhost:3000/api/health

# You should see:
# {"status":"ok","message":"Telegram Fitness App API is running",...}
```

## 🎉 You're All Set!

### Try These Commands in Telegram:
- `/start` - Welcome message
- `/setup` - Set up your fitness profile
- `/generate` - Generate a workout plan (after profile setup)
- `/workouts` - View your upcoming workouts
- `/help` - See all commands

### Next Steps:
1. Complete your fitness profile in the bot
2. Generate your first AI-powered workout plan
3. Check the `README.md` for full API documentation
4. Start building your frontend!

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Check connection
psql -U postgres -d telegram_fitness_db
```

### Bot Not Responding
- Double-check bot token in `.env`
- Make sure no other instance is running
- Restart the server: `Ctrl+C` then `npm run dev`

### OpenAI Errors
- Verify API key is correct
- Check you have credits in your OpenAI account
- Ensure you have access to GPT-4 (or change to `gpt-3.5-turbo` in `.env`)

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

## 📖 Learn More

- [Full README](./README.md)
- [API Documentation](#) (coming soon)
- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**Need help?** Check the README.md or create an issue on GitHub.

