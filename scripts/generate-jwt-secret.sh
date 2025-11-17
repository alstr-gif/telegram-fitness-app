#!/bin/bash
# Generate a secure JWT secret for production use
# Usage: ./scripts/generate-jwt-secret.sh

echo "🔐 Generating secure JWT secret..."
echo ""

# Generate 32-byte random secret (base64 encoded = 44 characters)
SECRET=$(openssl rand -base64 32)

echo "✅ Generated JWT secret:"
echo ""
echo "JWT_SECRET=$SECRET"
echo ""
echo "📋 Copy this value to your .env file"
echo "⚠️  Keep this secret secure and never commit it to version control!"
echo ""

