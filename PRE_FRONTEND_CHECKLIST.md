# ✅ Pre-Frontend Checklist

## Before Building the Frontend - Make Sure Backend Works!

---

## Step 1: Environment Setup (5 minutes)

### Check Your .env File

```bash
# You already have .env, verify it has:
cat .env
```

**Required variables:**
```env
✅ DB_TYPE=sqlite (or postgres)
✅ TELEGRAM_BOT_TOKEN=your_token
✅ OPENAI_API_KEY=sk-your_key
✅ JWT_SECRET=your_secret (at least 32 chars)
```

**Generate JWT secret if missing:**
```bash
openssl rand -base64 32
```

---

## Step 2: Test Backend Server (10 minutes)

### Start the Server

```bash
npm run dev
```

**Expected output:**
```
✅ Database connection established successfully
📊 Database type: sqlite
✅ Server is running
📡 Port: 3000
```

**If server starts successfully → Proceed to Step 3**

---

## Step 3: Test REST API (10 minutes)

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected:** `{"status":"ok",...}`

### 2. Test User Creation

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected:** JSON with `token` and `user` object

### 3. Test Authentication

```bash
# Save the token from previous response
TOKEN="paste_your_token_here"

curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** User profile JSON

### 4. Test User Profile Update

```bash
curl -X PUT http://localhost:3000/api/users/123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 45,
    "availableEquipment": ["dumbbells", "bench"]
  }'
```

**Expected:** Updated user object

### 5. Test Workout Generation

```bash
curl -X POST http://localhost:3000/api/workouts/123456789/generate \
  -H "Content-Type: application/json" \
  -d '{"weeksCount": 2}'
```

**Expected:** Complete workout plan with exercises (may take 5-10 seconds)

**✅ If all API tests pass → Proceed to Step 4**

---

## Step 4: Test Telegram Bot (15 minutes)

### 1. Find Your Bot

- Open Telegram
- Search for your bot (username from @BotFather)

### 2. Test Basic Commands

```
Send: /start
Expected: Welcome message with buttons
```

```
Send: /help
Expected: List of commands
```

### 3. Test Profile Setup Wizard

```
Send: /setup
Expected: Step 1/6 - Select fitness level
```

**Complete all 6 steps:**
1. Select fitness level (click a button)
2. Select primary goal (click a button)
3. Select workout days (click multiple, then Done)
4. Select duration (click a button)
5. Select equipment (click multiple, then Done)
6. Injuries (type text or click button)

**Expected:** Profile summary with all your selections

### 4. Test Workout Generation

```
Send: /generate
Expected: AI generates workout plan (takes ~10 seconds)
```

```
Send: /workouts
Expected: List of upcoming workouts
```

**✅ If bot works end-to-end → Backend is fully verified!**

---

## Step 5: Optional Production Prep (Before Deployment)

### If Deploying Soon, Consider:

#### 1. Switch to PostgreSQL

**Why:** SQLite is file-based, not ideal for production

**How:**
```env
# In .env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=telegram_fitness_db
```

**Setup:**
```bash
# Create PostgreSQL database
createdb telegram_fitness_db

# Restart server
npm run dev
```

See: [DATABASE_SETUP.md](DATABASE_SETUP.md)

#### 2. Add Tests (Recommended but not required)

**Why:** Catch bugs before deployment

**Options:**
- Jest for unit tests
- Supertest for API tests

**Later priority:** You can add tests after frontend

#### 3. Set Up Logging (Optional)

**Why:** Better debugging in production

**Options:**
- Winston for structured logging
- Morgan for HTTP logging

**Add to package.json:**
```bash
npm install winston morgan
```

#### 4. Add Rate Limiting (Recommended)

**Why:** Prevent API abuse

**Install:**
```bash
npm install express-rate-limit
```

**Add to src/app.ts:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

---

## ✅ Backend Verification Checklist

Mark each as you complete:

### Environment
- [ ] `.env` file exists and configured
- [ ] All required API keys added
- [ ] JWT_SECRET generated (32+ characters)
- [ ] Database type selected (sqlite/postgres)

### Server
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Server running on port 3000
- [ ] Database connection successful

### REST API
- [ ] `/api/health` returns OK
- [ ] `POST /api/auth/login` works
- [ ] `GET /api/auth/verify` works with token
- [ ] `PUT /api/users/:id` updates profile
- [ ] `POST /api/workouts/:id/generate` creates plan
- [ ] `GET /api/workouts/:id/upcoming` returns workouts

### Telegram Bot
- [ ] Bot responds to `/start`
- [ ] `/setup` wizard works (all 6 steps)
- [ ] Profile saves correctly
- [ ] `/generate` creates workout plan
- [ ] `/workouts` shows upcoming workouts

### Documentation
- [ ] Read [WHATS_NEW.md](WHATS_NEW.md)
- [ ] Understand authentication system
- [ ] Know how to switch databases
- [ ] Familiar with API endpoints

---

## 🚦 Decision Point: What's Next?

### ✅ All Checks Pass → Ready for Frontend!

**Proceed to:** Frontend Development (see below)

### ⚠️ Some Checks Fail → Debug First

**Common issues:**

1. **Server won't start**
   - Check `.env` has all required variables
   - Verify API keys are valid
   - Check port 3000 isn't in use: `lsof -ti:3000`

2. **Bot not responding**
   - Verify `TELEGRAM_BOT_TOKEN` in `.env`
   - Check bot is running (server started)
   - Restart server: Ctrl+C, then `npm run dev`

3. **Workout generation fails**
   - Verify `OPENAI_API_KEY` is valid
   - Check you have credits in OpenAI account
   - Try `gpt-3.5-turbo` instead of `gpt-4`

4. **Database errors**
   - SQLite: Check write permissions in folder
   - PostgreSQL: Verify database exists: `psql -l`

**See:** Troubleshooting sections in:
- [AUTHENTICATION.md](AUTHENTICATION.md)
- [DATABASE_SETUP.md](DATABASE_SETUP.md)
- [TELEGRAM_BOT_GUIDE.md](TELEGRAM_BOT_GUIDE.md)

---

## 🎯 Ready for Frontend? Here's the Plan

### Frontend Options

#### Option 1: Telegram Mini App (Recommended)

**Why:**
- Native Telegram integration
- Users already on Telegram
- No separate app needed
- Quick setup

**Tech Stack:**
- React + Vite (or Next.js)
- Telegram WebApp SDK
- TailwindCSS (or your choice)
- React Query for API calls

**Start with:**
```bash
npm create vite@latest fitness-frontend -- --template react-ts
cd fitness-frontend
npm install
```

#### Option 2: Web App

**Why:**
- Works outside Telegram
- More flexibility
- Wider audience

**Tech Stack:**
- React + TypeScript
- React Router
- Axios for API
- UI library (MUI, Chakra, etc.)

#### Option 3: Mobile App

**Why:**
- Native mobile experience
- Push notifications
- Offline support

**Tech Stack:**
- React Native
- Expo (easier setup)
- Native modules

---

## 📋 Frontend Development Checklist

### Phase 1: Setup (Day 1)

- [ ] Choose tech stack (Telegram Mini App recommended)
- [ ] Create frontend project
- [ ] Install dependencies
- [ ] Set up project structure
- [ ] Configure API baseURL

### Phase 2: Core Features (Week 1)

- [ ] Authentication flow
  - [ ] Telegram login
  - [ ] Token management
  - [ ] Protected routes

- [ ] Profile Setup
  - [ ] Fitness level selection
  - [ ] Goal selection
  - [ ] Workout preferences
  - [ ] Equipment selection

- [ ] Workout Display
  - [ ] List upcoming workouts
  - [ ] Show workout details
  - [ ] Display exercises

### Phase 3: Advanced Features (Week 2)

- [ ] Workout Generation
  - [ ] Generate new plans
  - [ ] Customize preferences
  - [ ] View plan details

- [ ] Workout Tracking
  - [ ] Mark exercises complete
  - [ ] Track progress
  - [ ] Add notes

- [ ] User Dashboard
  - [ ] Stats overview
  - [ ] Progress charts
  - [ ] Recent activity

### Phase 4: Polish (Week 3)

- [ ] UI/UX improvements
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design
- [ ] Performance optimization

---

## 📚 Resources for Frontend

### API Documentation

**Your endpoints:**
```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/telegram-webapp
  GET    /api/auth/verify

Users:
  GET    /api/users/:telegramId
  PUT    /api/users/:telegramId
  GET    /api/users/:telegramId/complete

Workouts:
  POST   /api/workouts/:telegramId/generate
  GET    /api/workouts/:telegramId/plans
  GET    /api/workouts/:telegramId/active
  GET    /api/workouts/:telegramId/upcoming
  POST   /api/workouts/workout/:workoutId/complete
```

**See:** [AUTHENTICATION.md](AUTHENTICATION.md) for details

### Telegram Mini App Setup

**Start here:**
1. https://core.telegram.org/bots/webapps
2. Install SDK: `npm install @twa-dev/sdk`
3. Use Telegram.WebApp API

**Example:**
```javascript
import WebApp from '@twa-dev/sdk'

// Get user data
const user = WebApp.initDataUnsafe.user

// Authenticate
fetch('/api/auth/telegram-webapp', {
  method: 'POST',
  headers: { 'x-telegram-init-data': WebApp.initData }
})
```

---

## 🎓 Recommended Learning Path

### If Building Telegram Mini App

1. **Day 1:** Set up React + Vite project
2. **Day 2:** Integrate Telegram WebApp SDK
3. **Day 3:** Implement authentication
4. **Day 4-5:** Build profile setup UI
5. **Day 6-7:** Add workout display
6. **Week 2:** Advanced features
7. **Week 3:** Polish & deploy

### If Building Web App

1. **Day 1:** Set up React project + routing
2. **Day 2:** Implement JWT auth flow
3. **Day 3:** Build login/register
4. **Day 4-5:** Profile management
5. **Day 6-7:** Workout interface
6. **Week 2:** Features & state management
7. **Week 3:** Testing & deployment

---

## 💡 Pro Tips

### Before Frontend Development

1. **Document your API**
   - Consider adding Swagger/OpenAPI
   - Makes frontend development easier
   - Auto-generates API docs

2. **Test with Postman**
   - Create collection of API requests
   - Test all endpoints thoroughly
   - Share with frontend team

3. **Set up CORS properly**
   - Already configured in backend
   - Update `CORS_ORIGIN` in `.env` for frontend URL

4. **Enable authentication (optional)**
   - Uncomment middleware in routes
   - Secure user data
   - See [AUTHENTICATION.md](AUTHENTICATION.md)

### During Frontend Development

1. **Use environment variables**
   ```javascript
   // Frontend .env
   VITE_API_URL=http://localhost:3000
   ```

2. **Add proper error handling**
   ```javascript
   try {
     const response = await fetch(...)
     if (!response.ok) throw new Error(...)
   } catch (error) {
     // Show user-friendly message
   }
   ```

3. **Manage tokens securely**
   ```javascript
   // Store in localStorage (for web)
   localStorage.setItem('authToken', token)
   
   // Add to requests
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

---

## 🚀 Quick Start Frontend (Telegram Mini App)

```bash
# 1. Create project
npm create vite@latest fitness-frontend -- --template react-ts
cd fitness-frontend

# 2. Install dependencies
npm install
npm install @twa-dev/sdk axios react-router-dom

# 3. Configure API
echo "VITE_API_URL=http://localhost:3000" > .env.local

# 4. Start development
npm run dev
```

**Then:**
- Connect to your backend API
- Implement Telegram auth
- Build UI components

---

## ✅ Final Checklist Before Frontend

- [ ] Backend verified and working
- [ ] All API endpoints tested
- [ ] Telegram bot functional
- [ ] Documentation reviewed
- [ ] Authentication understood
- [ ] Database configured
- [ ] Ready to code frontend!

---

## 🎉 You're Ready!

**Backend Status:** ✅ Production Ready  
**Next Step:** 🎨 Build Frontend  
**Estimated Time:** 2-3 weeks for MVP  

**Need help?** Check the documentation:
- [AUTHENTICATION.md](AUTHENTICATION.md) - API auth
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database
- [TELEGRAM_BOT_GUIDE.md](TELEGRAM_BOT_GUIDE.md) - Bot features
- [WHATS_NEW.md](WHATS_NEW.md) - Recent updates

---

**Happy Frontend Development! 🚀**



