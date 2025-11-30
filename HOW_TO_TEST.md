# 🧪 How to Test Your Deployed API

## Step 1: Get Your Railway URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your project (`focused-blessing`)
3. Click on your service (`telegram-fitness-app`)
4. Click **"Settings"** tab
5. Scroll to **"Domains"** section
6. Copy the URL (e.g., `https://telegram-fitness-app-production.up.railway.app`)

## Step 2: Run the Test Script

Once you have your Railway URL, run:

```bash
./test-production-api.sh https://your-actual-railway-url.railway.app
```

**Replace** `https://your-actual-railway-url.railway.app` with your actual URL from Step 1.

## Step 3: Manual Testing (Alternative)

If you prefer to test manually, here are the commands:

### 1. Health Check
```bash
curl https://your-railway-url.railway.app/api/health
```

**Expected:** `{"status":"ok","message":"Telegram Fitness App API is running",...}`

### 2. Create User (Login)
```bash
curl -X POST https://your-railway-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected:** JSON with `token` and `user` object

### 3. Verify Token
```bash
# Replace YOUR_TOKEN with the token from step 2
curl https://your-railway-url.railway.app/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get User Profile
```bash
curl https://your-railway-url.railway.app/api/users/123456789
```

### 5. Update User Profile
```bash
curl -X PUT https://your-railway-url.railway.app/api/users/123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 45
  }'
```

### 6. Get Upcoming Workouts
```bash
curl https://your-railway-url.railway.app/api/workouts/123456789/upcoming
```

## Step 4: Test in Browser

You can also test some endpoints directly in your browser:

1. **Health Check:**
   ```
   https://your-railway-url.railway.app/api/health
   ```

2. **Root Endpoint:**
   ```
   https://your-railway-url.railway.app/
   ```

## What to Look For

✅ **Success Indicators:**
- HTTP 200 status codes
- JSON responses with data
- No error messages
- Token received from login

❌ **If Tests Fail:**
- Check Railway logs for errors
- Verify all environment variables are set
- Make sure the app is actually running (check Railway dashboard)
- Check if the URL is correct

## Quick Test Checklist

- [ ] Health check returns `{"status":"ok"}`
- [ ] Can create user (login endpoint works)
- [ ] Can verify token
- [ ] Can get user profile
- [ ] Can update user profile
- [ ] Can get upcoming workouts (may be empty, that's OK)

---

**Need help?** Share your Railway URL and I can help test it!


