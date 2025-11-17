#!/bin/bash
# Production Readiness Check Script
# Checks if all production requirements are met before deployment

echo "🔍 Checking production readiness..."
echo ""

ERRORS=0
WARNINGS=0

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    echo "   Create .env file from .env.production.example"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ .env file exists"
fi

# Check if NODE_ENV is set to production
if grep -q "NODE_ENV=production" .env 2>/dev/null; then
    echo "✅ NODE_ENV is set to production"
else
    echo "⚠️  WARNING: NODE_ENV is not set to production"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if DB_TYPE is postgres
if grep -q "DB_TYPE=postgres" .env 2>/dev/null; then
    echo "✅ DB_TYPE is set to postgres"
else
    echo "❌ ERROR: DB_TYPE must be 'postgres' for production"
    ERRORS=$((ERRORS + 1))
fi

# Check if JWT_SECRET is set and not default
if grep -q "JWT_SECRET=" .env 2>/dev/null; then
    JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d '=' -f2)
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "change_this_secret" ] || [ "$JWT_SECRET" = "your-very-strong-random-secret-minimum-32-characters-long-change-this" ]; then
        echo "❌ ERROR: JWT_SECRET must be changed from default value"
        ERRORS=$((ERRORS + 1))
    elif [ ${#JWT_SECRET} -lt 32 ]; then
        echo "❌ ERROR: JWT_SECRET must be at least 32 characters (currently ${#JWT_SECRET})"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ JWT_SECRET is set and strong (${#JWT_SECRET} characters)"
    fi
else
    echo "❌ ERROR: JWT_SECRET is not set"
    ERRORS=$((ERRORS + 1))
fi

# Check if API_URL uses HTTPS
if grep -q "API_URL=https://" .env 2>/dev/null; then
    echo "✅ API_URL uses HTTPS"
else
    echo "❌ ERROR: API_URL must use HTTPS in production"
    ERRORS=$((ERRORS + 1))
fi

# Check if CORS_ORIGIN is set
if grep -q "CORS_ORIGIN=" .env 2>/dev/null; then
    CORS_ORIGIN=$(grep "CORS_ORIGIN=" .env | cut -d '=' -f2)
    if [ -z "$CORS_ORIGIN" ]; then
        echo "❌ ERROR: CORS_ORIGIN must be set"
        ERRORS=$((ERRORS + 1))
    elif echo "$CORS_ORIGIN" | grep -q "localhost"; then
        echo "❌ ERROR: CORS_ORIGIN must not include localhost in production"
        ERRORS=$((ERRORS + 1))
    elif echo "$CORS_ORIGIN" | grep -q "https://"; then
        echo "✅ CORS_ORIGIN is set and uses HTTPS"
    else
        echo "⚠️  WARNING: CORS_ORIGIN should use HTTPS"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ ERROR: CORS_ORIGIN is not set"
    ERRORS=$((ERRORS + 1))
fi

# Check if required API keys are set
if grep -q "TELEGRAM_BOT_TOKEN=" .env 2>/dev/null; then
    TOKEN=$(grep "TELEGRAM_BOT_TOKEN=" .env | cut -d '=' -f2)
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "your-production-telegram-bot-token-here" ]; then
        echo "❌ ERROR: TELEGRAM_BOT_TOKEN must be set to production token"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ TELEGRAM_BOT_TOKEN is set"
    fi
else
    echo "❌ ERROR: TELEGRAM_BOT_TOKEN is not set"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "OPENAI_API_KEY=" .env 2>/dev/null; then
    KEY=$(grep "OPENAI_API_KEY=" .env | cut -d '=' -f2)
    if [ -z "$KEY" ] || [ "$KEY" = "sk-your-production-openai-api-key-here" ]; then
        echo "❌ ERROR: OPENAI_API_KEY must be set to production key"
        ERRORS=$((ERRORS + 1))
    elif echo "$KEY" | grep -q "^sk-"; then
        echo "✅ OPENAI_API_KEY is set and has correct format"
    else
        echo "⚠️  WARNING: OPENAI_API_KEY format may be incorrect (should start with 'sk-')"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ ERROR: OPENAI_API_KEY is not set"
    ERRORS=$((ERRORS + 1))
fi

# Check database credentials
if grep -q "DB_PASSWORD=" .env 2>/dev/null; then
    DB_PASSWORD=$(grep "DB_PASSWORD=" .env | cut -d '=' -f2)
    if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "your-secure-db-password-min-8-chars" ]; then
        echo "❌ ERROR: DB_PASSWORD must be set"
        ERRORS=$((ERRORS + 1))
    elif [ ${#DB_PASSWORD} -lt 8 ]; then
        echo "❌ ERROR: DB_PASSWORD must be at least 8 characters (currently ${#DB_PASSWORD})"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ DB_PASSWORD is set and strong (${#DB_PASSWORD} characters)"
    fi
else
    echo "❌ ERROR: DB_PASSWORD is not set"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready for production deployment."
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run validate:production"
    echo "  2. Run: npm run build"
    echo "  3. Deploy following PRODUCTION_DEPLOYMENT_CHECKLIST.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Checks passed with $WARNINGS warning(s)"
    echo "   Review warnings above before deploying"
    exit 0
else
    echo "❌ Production readiness check failed!"
    echo "   Found $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "   Fix the errors above before deploying to production"
    exit 1
fi

