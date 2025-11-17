# 🔐 Authentication Guide

## Overview

The Telegram Fitness App now supports JWT-based authentication with multiple authentication strategies:

1. **Standard Login** - Login with Telegram credentials
2. **Telegram WebApp** - Authenticate using Telegram Mini App init data
3. **Optional Auth** - Routes that work with or without authentication

---

## Authentication Endpoints

### POST `/api/auth/login`

Login with Telegram credentials and receive a JWT token.

**Request Body:**
```json
{
  "telegramId": "123456789",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "photoUrl": "https://..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "https://..."
  }
}
```

### POST `/api/auth/telegram-webapp`

Authenticate using Telegram Mini App init data.

**Headers:**
```
x-telegram-init-data: query_id=xxx&user={"id":123...}&auth_date=...
```

**OR Request Body:**
```json
{
  "initData": "query_id=xxx&user={\"id\":123...}&auth_date=..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "telegramId": "123456789",
    ...
  }
}
```

### GET `/api/auth/verify`

Verify JWT token and get user information.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "https://...",
    "fitnessLevel": "intermediate",
    "primaryGoal": "build_muscle"
  }
}
```

---

## Using Authentication Middleware

### Protect a Route

To require authentication on a route:

```typescript
import { authenticateToken, authorizeUser } from '../middlewares/auth';

// User must be authenticated AND accessing their own data
router.get('/:telegramId/profile', authenticateToken, authorizeUser, controller.getProfile);
```

### Optional Authentication

To make authentication optional (enhance features for logged-in users):

```typescript
import { optionalAuth } from '../middlewares/auth';

router.get('/public-data', optionalAuth, controller.getData);
```

### Accessing User Data in Controllers

```typescript
import { AuthRequest } from '../middlewares/auth';

async getProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id; // Available after authenticateToken
  const telegramId = req.user?.telegramId;
  // ...
}
```

---

## Authentication Middleware Functions

### `authenticateToken`

Verifies JWT token and attaches user info to request.

**Errors:**
- `401` - No token provided
- `401` - Token expired
- `403` - Invalid token

### `authorizeUser`

Ensures authenticated user can only access their own data.

**Errors:**
- `401` - Not authenticated
- `403` - Trying to access another user's data

### `optionalAuth`

Attempts to authenticate but continues even if no token or invalid token.

### `authenticateTelegramWebApp`

Validates Telegram WebApp init data and creates/finds user.

**Errors:**
- `401` - No init data provided
- `401` - Invalid init data

---

## Generating Tokens

### In Code

```typescript
import { generateToken } from '../middlewares/auth';

const token = generateToken(user.id, user.telegramId);
```

### Token Payload

```json
{
  "userId": "uuid-here",
  "telegramId": "123456789",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Frontend Integration

### Using with Fetch

```javascript
// 1. Login and get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telegramId: Telegram.WebApp.initDataUnsafe.user.id,
    username: Telegram.WebApp.initDataUnsafe.user.username,
    firstName: Telegram.WebApp.initDataUnsafe.user.first_name,
    lastName: Telegram.WebApp.initDataUnsafe.user.last_name,
  })
});

const { token } = await loginResponse.json();

// 2. Store token
localStorage.setItem('authToken', token);

// 3. Use token in subsequent requests
const response = await fetch('/api/users/123456789', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Using with Telegram Mini App

```javascript
// Get init data from Telegram
const initData = Telegram.WebApp.initData;

// Authenticate
const response = await fetch('/api/auth/telegram-webapp', {
  method: 'POST',
  headers: {
    'x-telegram-init-data': initData
  }
});

const { token, user } = await response.json();
```

---

## Environment Configuration

### Required Environment Variables

```env
JWT_SECRET=your_super_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
```

**Security Notes:**
- Use a strong, random secret (at least 32 characters)
- Generate with: `openssl rand -base64 32`
- Never commit the actual secret to version control
- Use different secrets for development and production

---

## Security Best Practices

### 1. Token Storage

**Frontend:**
- Store in `localStorage` for web apps
- Store in secure storage for mobile apps
- Never store in cookies without `httpOnly` flag

### 2. Token Expiration

- Default: 7 days
- Adjust in `.env` with `JWT_EXPIRES_IN`
- Implement token refresh for longer sessions

### 3. HTTPS Required

- Always use HTTPS in production
- JWT tokens are vulnerable if transmitted over HTTP

### 4. Validate Telegram Data

For production, implement proper Telegram WebApp data validation:

```typescript
import crypto from 'crypto';

function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

---

## Current Status

### ✅ Implemented

- JWT token generation
- Token verification middleware
- User authorization middleware
- Optional authentication
- Telegram WebApp authentication
- Login endpoint
- Token verification endpoint
- Auth routes integrated

### 🔒 Optional (Currently Disabled)

Authentication is **implemented but not enforced** on user and workout routes.

**To Enable:**
Uncomment the middleware imports in route files:

```typescript
// In userRoutes.ts
import { authenticateToken, authorizeUser } from '../middlewares/auth';

router.get('/:telegramId', authenticateToken, authorizeUser, userController.getProfile);
```

**Why Disabled by Default:**
- Maintains backward compatibility
- Allows testing without authentication
- Telegram bot can still function
- Easy to enable when needed

---

## Testing Authentication

### 1. Login

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

### 2. Use Token

```bash
# Save token from login response
TOKEN="your-token-here"

# Use in authenticated request
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Protected Route (after enabling auth)

```bash
curl http://localhost:3000/api/users/123456789 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### "Access token required"

- Ensure you're sending the `Authorization` header
- Format: `Bearer <token>`

### "Token expired"

- Token has exceeded `JWT_EXPIRES_IN` duration
- Login again to get a new token
- Consider implementing refresh tokens

### "Invalid token"

- Token is malformed or tampered with
- `JWT_SECRET` may have changed
- Login again to get a valid token

### "Forbidden: Cannot access other user's data"

- Trying to access another user's resources
- Ensure telegramId in URL matches authenticated user

---

## Next Steps

1. **Enable Authentication**: Uncomment middleware in routes when ready
2. **Implement Refresh Tokens**: For longer sessions
3. **Add Rate Limiting**: Protect auth endpoints
4. **Admin Roles**: Add role-based access control
5. **Audit Logging**: Log authentication events

---

**Security is ready when you are! 🔐**



