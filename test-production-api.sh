#!/bin/bash

# Production API Testing Script
# Usage: ./test-production-api.sh YOUR_RAILWAY_URL

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway URL"
    echo ""
    echo "Usage: ./test-production-api.sh https://your-app.railway.app"
    echo ""
    echo "To find your Railway URL:"
    echo "  1. Go to Railway dashboard"
    echo "  2. Click on your service"
    echo "  3. Go to Settings → Domains"
    echo "  4. Copy the URL"
    exit 1
fi

API_URL="$1"

echo "🧪 Testing Telegram Fitness App API"
echo "📍 API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GET $API_URL/api/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $HTTP_CODE"
    echo "Response: $BODY"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - HTTP $HTTP_CODE"
    echo "Response: $BODY"
    ((FAILED++))
fi
echo ""

# Test 2: Root Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 2: Root Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GET $API_URL/"
ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/" 2>&1)
ROOT_HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -n1)
ROOT_BODY=$(echo "$ROOT_RESPONSE" | sed '$d')

if [ "$ROOT_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $ROOT_HTTP_CODE"
    echo "Response: $(echo "$ROOT_BODY" | head -c 200)..."
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  HTTP $ROOT_HTTP_CODE${NC}"
    echo "Response: $ROOT_BODY"
fi
echo ""

# Test 3: User Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 3: User Login (Create User)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "POST $API_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "999999999",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }' 2>&1)

LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_HTTP_CODE" -eq 200 ] || [ "$LOGIN_HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $LOGIN_HTTP_CODE"
    echo "Response: $LOGIN_BODY"
    
    # Extract token
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Token extracted successfully${NC}"
        export TEST_TOKEN="$TOKEN"
    fi
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - HTTP $LOGIN_HTTP_CODE"
    echo "Response: $LOGIN_BODY"
    ((FAILED++))
fi
echo ""

# Test 4: Verify Token
if [ -n "$TEST_TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}Test 4: Verify Token${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "GET $API_URL/api/auth/verify"
    VERIFY_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/auth/verify" \
      -H "Authorization: Bearer $TEST_TOKEN" 2>&1)
    
    VERIFY_HTTP_CODE=$(echo "$VERIFY_RESPONSE" | tail -n1)
    VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '$d')
    
    if [ "$VERIFY_HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ PASS${NC} - HTTP $VERIFY_HTTP_CODE"
        echo "Response: $(echo "$VERIFY_BODY" | head -c 200)..."
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - HTTP $VERIFY_HTTP_CODE"
        echo "Response: $VERIFY_BODY"
        ((FAILED++))
    fi
    echo ""
fi

# Test 5: Get User Profile
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 5: Get User Profile${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GET $API_URL/api/users/999999999"
USER_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/users/999999999" 2>&1)
USER_HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
USER_BODY=$(echo "$USER_RESPONSE" | sed '$d')

if [ "$USER_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $USER_HTTP_CODE"
    echo "Response: $(echo "$USER_BODY" | head -c 200)..."
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  HTTP $USER_HTTP_CODE${NC} (User might not exist)"
    echo "Response: $USER_BODY"
fi
echo ""

# Test 6: Update User Profile
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 6: Update User Profile${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PUT $API_URL/api/users/999999999"
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/api/users/999999999" \
  -H "Content-Type: application/json" \
  -d '{
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle",
    "preferredWorkoutDays": ["monday", "wednesday", "friday"],
    "preferredDuration": 45
  }' 2>&1)

UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$UPDATE_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $UPDATE_HTTP_CODE"
    echo "Response: $(echo "$UPDATE_BODY" | head -c 200)..."
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  HTTP $UPDATE_HTTP_CODE${NC}"
    echo "Response: $UPDATE_BODY"
fi
echo ""

# Test 7: Get Upcoming Workouts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Test 7: Get Upcoming Workouts${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GET $API_URL/api/workouts/999999999/upcoming"
WORKOUTS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/workouts/999999999/upcoming" 2>&1)
WORKOUTS_HTTP_CODE=$(echo "$WORKOUTS_RESPONSE" | tail -n1)
WORKOUTS_BODY=$(echo "$WORKOUTS_RESPONSE" | sed '$d')

if [ "$WORKOUTS_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - HTTP $WORKOUTS_HTTP_CODE"
    echo "Response: $(echo "$WORKOUTS_BODY" | head -c 200)..."
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  HTTP $WORKOUTS_HTTP_CODE${NC} (No workouts - this is normal)"
    echo "Response: $WORKOUTS_BODY"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the responses above.${NC}"
    exit 1
fi


