# 🧪 Backend Testing Session

## Status: Ready to Test

---

## ⚠️ BEFORE WE START - UPDATE API KEYS

Your `.env` currently has placeholder values. Update these first:

### 1. Telegram Bot Token (Required)

**Current:** `test-token-placeholder`  
**Need:** Real token from @BotFather

**How to get:**
```
1. Open Telegram
2. Search for @BotFather
3. Send: /newbot
4. Follow instructions
5. Copy the token (format: 123456789:ABCdefGHI...)
```

**Update .env:**
```env
TELEGRAM_BOT_TOKEN=your_real_token_here
```

### 2. OpenAI API Key (Required for workout generation)

**Current:** `sk-test-key-placeholder`  
**Need:** Real API key from OpenAI

**How to get:**
```
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with sk-)
5. Verify you have credits/billing set up
```

**Update .env:**
```env
OPENAI_API_KEY=sk-your_real_key_here
```

**Note:** If you don't have GPT-4 access, use:
```env
OPENAI_MODEL=gpt-3.5-turbo
```

### 3. JWT Secret (Optional - already set)

**Current:** `test_secret_key_for_development_only_change_in_production`  
**Status:** ✅ OK for testing (change for production)

**To generate stronger secret (optional):**
```bash
openssl rand -base64 32
```

---

## 📋 Testing Checklist

### Phase 1: Environment ✅

- [ ] TELEGRAM_BOT_TOKEN updated with real token
- [ ] OPENAI_API_KEY updated with real key
- [ ] JWT_SECRET is set (can use existing for testing)
- [ ] DB_TYPE=sqlite (good for testing)
- [ ] All other variables look correct

---

### Phase 2: Start Server 🚀

**Command:**
```bash
npm run dev
```

**Expected Output:**
```
✅ Database connection established successfully
📊 Database type: sqlite
🗄️  SQLite: telegram_fitness.db
✅ Server is running
📡 Port: 3000
🌍 Environment: development
🔗 API URL: http://localhost:3000
```

**Checklist:**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Port 3000 is accessible
- [ ] No error messages in console

**If server won't start:**
- Check if port 3000 is in use: `lsof -ti:3000 | xargs kill -9`
- Verify all dependencies: `npm install`
- Check for typos in .env file

---

### Phase 3: Test REST API 🔌

#### Test 1: Health Check

**Command:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Telegram Fitness App API is running",
  "timestamp": "2025-..."
}
```

**Checklist:**
- [ ] Returns 200 status
- [ ] JSON response received
- [ ] Status is "ok"

---

#### Test 2: Authentication - Login

**Command:**
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

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "some-uuid",
    "telegramId": "123456789",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

**Checklist:**
- [ ] Returns 200 status
- [ ] Token received
- [ ] User object includes telegramId
- [ ] **Copy the token for next tests!**

**Save token:**
```bash
# For Mac/Linux - save in terminal
export TOKEN="paste_your_token_here"
```

---

#### Test 3: Verify Token

**Command:**
```bash
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "telegramId": "123456789",
    "username": "testuser",
    ...
  }
}
```

**Checklist:**
- [ ] Returns 200 status
- [ ] User data received
- [ ] Authentication works!

---

#### Test 4: Update User Profile

**Command:**
```bash
curl -X PUT http://localhost:3000/api/users/123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 45,
    "availableEquipment": ["dumbbells", "bench", "barbell"]
  }'
```

**Expected Response:**
```json
{
  "id": "uuid",
  "telegramId": "123456789",
  "fitnessLevel": "intermediate",
  "primaryGoal": "build_muscle",
  "preferredWorkoutDays": ["monday", "wednesday", "friday"],
  ...
}
```

**Checklist:**
- [ ] Returns 200 status
- [ ] Profile updated
- [ ] All fields saved correctly

---

#### Test 5: Check Profile Completion

**Command:**
```bash
curl http://localhost:3000/api/users/123456789/complete
```

**Expected Response:**
```json
{
  "isComplete": true
}
```

**Checklist:**
- [ ] Returns isComplete: true
- [ ] Profile validation works

---

#### Test 6: Generate Workout Plan (AI Test)

**⚠️ This will use OpenAI API credits!**

**Command:**
```bash
curl -X POST http://localhost:3000/api/workouts/123456789/generate \
  -H "Content-Type: application/json" \
  -d '{"weeksCount": 2}'
```

**Expected:** (Takes 5-10 seconds)
```json
{
  "id": "plan-uuid",
  "name": "4-Week Muscle Building Program",
  "description": "...",
  "workouts": [
    {
      "name": "Upper Body Strength",
      "exercises": [...]
    }
  ],
  ...
}
```

**Checklist:**
- [ ] Request completes successfully
- [ ] Workout plan generated
- [ ] Exercises included
- [ ] AI integration works!

**If this fails:**
- Check OpenAI API key is correct
- Verify you have credits: https://platform.openai.com/usage
- Try gpt-3.5-turbo if no GPT-4 access

---

#### Test 7: Get Upcoming Workouts

**Command:**
```bash
curl http://localhost:3000/api/workouts/123456789/upcoming
```

**Expected Response:**
```json
[
  {
    "id": "workout-uuid",
    "name": "Upper Body Strength",
    "scheduledDate": "2025-...",
    "duration": 45,
    "exercises": [...]
  },
  ...
]
```

**Checklist:**
- [ ] Returns array of workouts
- [ ] Workouts have exercises
- [ ] Dates are scheduled

---

### Phase 4: Test Telegram Bot 🤖

**Pre-requisite:** Server must be running!

#### Test 1: Start Bot

**Steps:**
1. Open Telegram
2. Search for your bot (name from @BotFather)
3. Click START or send `/start`

**Expected:**
- Welcome message with emoji
- Three buttons:
  - ⚙️ Setup Profile
  - 💪 Generate Workout Plan
  - 📅 My Workouts

**Checklist:**
- [ ] Bot responds
- [ ] Welcome message shows
- [ ] Buttons are clickable

---

#### Test 2: Help Command

**Send:** `/help`

**Expected:**
```
📖 Available Commands:

/start - Start the bot
/setup - Configure your fitness profile
/generate - Generate a new workout plan
/workouts - View your upcoming workouts
/help - Show this help message
```

**Checklist:**
- [ ] Help message displays
- [ ] All commands listed

---

#### Test 3: Profile Setup Wizard (Most Important!)

**Send:** `/setup`

**Expected:** Step 1/6

---

**Step 1: Fitness Level**

**Expected:**
- "Step 1/6: Please select your fitness level"
- Three buttons:
  - 🟢 Beginner
  - 🟡 Intermediate
  - 🔴 Advanced

**Action:** Click **Intermediate**

**Expected:**
- Confirmation message
- Proceeds to Step 2

**Checklist:**
- [ ] Step 1 displays
- [ ] Button clicks work
- [ ] Proceeds to Step 2

---

**Step 2: Primary Goal**

**Expected:**
- "Step 2/6: What's your primary fitness goal?"
- Five buttons with goals

**Action:** Click **💪 Build Muscle**

**Expected:**
- Goal confirmed
- Proceeds to Step 3

**Checklist:**
- [ ] Step 2 displays
- [ ] Goal buttons work
- [ ] Proceeds to Step 3

---

**Step 3: Workout Days**

**Expected:**
- "Step 3/6: Which days would you like to work out?"
- Seven day buttons + Done button
- "Select all that apply"

**Action:** 
1. Click **Monday**
2. Click **Wednesday**
3. Click **Friday**
4. Click **✅ Done**

**Expected:**
- Each click shows "Selected days: monday, wednesday, friday"
- Done button proceeds to Step 4

**Checklist:**
- [ ] Step 3 displays
- [ ] Day toggle works
- [ ] Can select multiple days
- [ ] Live feedback shows selections
- [ ] Done proceeds to Step 4

---

**Step 4: Duration**

**Expected:**
- "Step 4/6: How long do you want each workout to be?"
- Five duration options

**Action:** Click **⏱️ 45 minutes**

**Expected:**
- Duration confirmed
- Proceeds to Step 5

**Checklist:**
- [ ] Step 4 displays
- [ ] Duration buttons work
- [ ] Proceeds to Step 5

---

**Step 5: Equipment**

**Expected:**
- "Step 5/6: What equipment do you have available?"
- Multiple equipment options + Done button

**Action:**
1. Click **🏋️ Dumbbells**
2. Click **💺 Bench**
3. Click **🏋️ Barbell**
4. Click **✅ Done**

**Expected:**
- Each click shows selected equipment
- Done proceeds to Step 6

**Checklist:**
- [ ] Step 5 displays
- [ ] Equipment toggle works
- [ ] Multiple selections possible
- [ ] Live feedback works
- [ ] Done proceeds to Step 6

---

**Step 6: Injuries**

**Expected:**
- "Step 6/6: Do you have any injuries or limitations?"
- Two buttons:
  - ✅ No injuries
  - ⏭️ Skip this step
- Or type text message

**Action:** Click **✅ No injuries**

**Expected:**
- Profile summary displayed:
  ```
  🎉 Profile setup complete!
  
  📋 Your Profile:
  • Fitness Level: intermediate
  • Goal: build_muscle
  • Workout Days: monday, wednesday, friday
  • Duration: 45 minutes
  • Equipment: dumbbells, bench, barbell
  • Injuries: None
  ```
- Button: "💪 Generate Workout Plan"

**Checklist:**
- [ ] Step 6 displays
- [ ] Options work (buttons or text)
- [ ] Profile summary shows all selections
- [ ] All data saved correctly
- [ ] Wizard completes successfully

---

#### Test 4: Generate Workout (End-to-End)

**Send:** `/generate` or click "Generate Workout Plan" button

**Expected:**
1. "🤖 Generating your personalized workout plan..."
2. Wait 5-15 seconds (AI generation)
3. Success message:
   ```
   ✅ Your workout plan is ready!
   
   📋 **4-Week Muscle Building Program**
   Progressive strength training...
   
   📅 Total Workouts: 12
   📆 Duration: 45 minutes per session
   
   Use /workouts to see your upcoming workouts!
   ```

**Checklist:**
- [ ] Generation starts
- [ ] AI creates plan (may take time)
- [ ] Success message received
- [ ] Plan details shown

**If this fails:**
- Profile must be complete (run /setup first)
- OpenAI API key must be valid
- Check server logs for errors

---

#### Test 5: View Workouts

**Send:** `/workouts`

**Expected:**
```
📅 **Your Upcoming Workouts:**

🏋️ **Upper Body Strength**
📆 Monday, Jan 15
⏱️ 45 minutes | 🎯 Chest & Back
💪 8 exercises

🏋️ **Lower Body Power**
📆 Wednesday, Jan 17
⏱️ 45 minutes | 🎯 Legs
💪 7 exercises

...
```

**Checklist:**
- [ ] Upcoming workouts listed
- [ ] Dates, durations shown
- [ ] Exercise counts displayed
- [ ] Scheduled for correct days

---

### Phase 5: Final Verification ✅

**Complete Checklist:**

#### Environment
- [ ] `.env` has real API keys
- [ ] JWT_SECRET is set
- [ ] Database type configured

#### Server
- [ ] Starts without errors
- [ ] Database connects
- [ ] No console errors
- [ ] Runs on port 3000

#### REST API (7 tests)
- [ ] Health check works
- [ ] Login returns token
- [ ] Token verification works
- [ ] Profile update saves
- [ ] Profile completion check works
- [ ] Workout generation creates plan
- [ ] Upcoming workouts returns data

#### Telegram Bot (5 tests)
- [ ] Bot responds to /start
- [ ] /help shows commands
- [ ] /setup wizard completes (all 6 steps)
- [ ] /generate creates workout plan
- [ ] /workouts shows upcoming workouts

#### Integration
- [ ] Profile from bot saves to database
- [ ] API and bot use same data
- [ ] Workout generation works both ways

---

## 🎉 Success Criteria

**Backend is fully verified when:**

✅ All REST API endpoints work  
✅ Authentication system functional  
✅ Telegram bot wizard completes end-to-end  
✅ AI workout generation successful  
✅ No errors in server logs  
✅ Profile data persists correctly  

---

## 🚦 Test Results

### Date: _____________
### Tester: _____________

**Overall Status:** [ ] ✅ All Pass  [ ] ⚠️ Some Issues  [ ] ❌ Blocked

**Issues Found:**
```
(List any problems or errors)
```

**Notes:**
```
(Any observations or improvements)
```

---

## ➡️ Next Step After Testing

**If all tests pass:**
→ Proceed to frontend development! 🎨
→ Backend is production-ready ✅

**If tests fail:**
→ Check troubleshooting sections
→ Review error messages
→ Fix issues before frontend

---

## 📚 Troubleshooting Resources

- **Authentication issues:** [AUTHENTICATION.md](AUTHENTICATION.md)
- **Database problems:** [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Bot not working:** [TELEGRAM_BOT_GUIDE.md](TELEGRAM_BOT_GUIDE.md)
- **API reference:** [README.md](README.md)

---

**Ready to start testing? Update your API keys first!** 🚀



