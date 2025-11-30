#!/bin/bash

# API Testing Script for Railway Deployment
# Replace YOUR_RAILWAY_URL with your actual Railway domain

API_URL="${RAILWAY_URL:-https://telegram-fitness-app-production.up.railway.app}"

echo "🧪 Testing Telegram Fitness App API"
echo "📍 API URL: $API_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAIL${NC} - Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Root Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Root Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/")
ROOT_HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
ROOT_BODY=$(echo "$ROOT_RESPONSE" | sed '$d')

if [ "$ROOT_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $ROOT_HTTP_CODE"
    echo "Response: $ROOT_BODY" | head -c 200
    echo "..."
else
    echo -e "${RED}❌ FAIL${NC} - Status: $ROOT_HTTP_CODE"
fi
echo ""

# Test 3: User Login (Create User)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: User Login (Create User)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "999999999",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }')

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_HTTP_CODE" -eq 200 ] || [ "$LOGIN_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $LOGIN_HTTP_CODE"
    echo "Response: $LOGIN_BODY"
    
    # Extract token if present
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Token received${NC}"
        export TEST_TOKEN="$TOKEN"
    fi
else
    echo -e "${RED}❌ FAIL${NC} - Status: $LOGIN_HTTP_CODE"
    echo "Response: $LOGIN_BODY"
fi
echo ""

# Test 4: Verify Token (if we got one)
if [ -n "$TEST_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Test 4: Verify Token"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/verify" \
      -H "Authorization: Bearer $TEST_TOKEN")
    
    VERIFY_HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
    VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')
    
    if [ "$VERIFY_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $VERIFY_HTTP_CODE"
        echo "Response: $VERIFY_BODY" | head -c 300
        echo "..."
    else
        echo -e "${RED}❌ FAIL${NC} - Status: $VERIFY_HTTP_CODE"
        echo "Response: $VERIFY_BODY"
    fi
    echo ""
fi

# Test 5: Get User Profile
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Get User Profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
USER_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/users/999999999")
USER_HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
USER_BODY=$(echo "$USER_RESPONSE" | sed '$d')

if [ "$USER_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $USER_HTTP_CODE"
    echo "Response: $USER_BODY" | head -c 300
    echo "..."
else
    echo -e "${YELLOW}⚠️  Status: $USER_HTTP_CODE${NC} (User might not exist yet)"
    echo "Response: $USER_BODY"
fi
echo ""

# Test 6: Update User Profile
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Update User Profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/api/users/999999999" \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 45
  }')

UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$UPDATE_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $UPDATE_HTTP_CODE"
    echo "Response: $UPDATE_BODY" | head -c 300
    echo "..."
else
    echo -e "${YELLOW}⚠️  Status: $UPDATE_HTTP_CODE${NC}"
    echo "Response: $UPDATE_BODY"
fi
echo ""

# Test 7: Get Upcoming Workouts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Get Upcoming Workouts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
WORKOUTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/workouts/999999999/upcoming")
WORKOUTS_HTTP_CODE=$(echo "$WORKOUTS_RESPONSE" | tail -n1)
WORKOUTS_BODY=$(echo "$WORKOUTS_RESPONSE" | sed '$d')

if [ "$WORKOUTS_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $WORKOUTS_HTTP_CODE"
    echo "Response: $WORKOUTS_BODY" | head -c 300
    echo "..."
else
    echo -e "${YELLOW}⚠️  Status: $WORKOUTS_HTTP_CODE${NC} (No workouts yet - this is normal)"
    echo "Response: $WORKOUTS_BODY"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To test with your actual Railway URL, run:"
echo "  RAILWAY_URL=https://your-app.railway.app ./test-api.sh"
echo ""


