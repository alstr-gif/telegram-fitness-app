# 🎨 Frontend Setup Guide

## Telegram Fitness App - Mini App Frontend

---

## ✅ **Current Status:**

- ✅ Vite + React + TypeScript project created
- ✅ Dev server running on `http://localhost:5173/`
- ✅ Backend API running on `http://localhost:3000/`

---

## 📦 **Step 1: Install Dependencies**

Open a **new terminal** (keep dev server running) and run:

```bash
cd ~/fitness-frontend

# Core dependencies
npm install @twa-dev/sdk axios react-router-dom

# UI Framework (choose one)
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

---

## 🔧 **Step 2: Configure Tailwind CSS**

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🌐 **Step 3: Configure API Connection**

**Create `src/config/api.ts`:**

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Create `.env.local`:**

```env
VITE_API_URL=http://localhost:3000
```

---

## 📱 **Step 4: Initialize Telegram WebApp**

**Create `src/hooks/useTelegram.ts`:**

```typescript
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export const useTelegram = () => {
  const [user, setUser] = useState(WebApp.initDataUnsafe.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    setIsReady(true);
  }, []);

  return {
    user,
    isReady,
    WebApp,
    initData: WebApp.initData,
    initDataUnsafe: WebApp.initDataUnsafe,
  };
};
```

---

## 🔐 **Step 5: Create Authentication Service**

**Create `src/services/auth.ts`:**

```typescript
import api from '../config/api';

export interface LoginData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authService = {
  // Login with Telegram credentials
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Authenticate via Telegram WebApp
  telegramWebAppAuth: async (initData: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/telegram-webapp', {}, {
      headers: {
        'x-telegram-init-data': initData,
      },
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (): Promise<any> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Save token
  saveToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Remove token
  logout: () => {
    localStorage.removeItem('authToken');
  },
};
```

---

## 🏗️ **Step 6: Create Basic Components**

### **Create `src/App.tsx`:**

```typescript
import { useEffect, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { authService } from './services/auth';
import './App.css';

function App() {
  const { user, isReady, initData } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      if (!isReady) return;

      try {
        // Check if we have a token
        const token = authService.getToken();
        
        if (token) {
          // Verify existing token
          await authService.verifyToken();
          setIsAuthenticated(true);
        } else if (user) {
          // Login with Telegram user data
          const response = await authService.login({
            telegramId: user.id.toString(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url,
          });
          
          authService.saveToken(response.token);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [isReady, user, initData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">🏋️ Fitness App</h1>
          <p className="mt-4 text-gray-600">Authentication failed. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">🏋️ Fitness Coach</h1>
          <p className="text-blue-100 mt-1">
            Welcome, {user?.first_name || 'User'}!
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Get Started
            </h2>
            
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                📝 Set Up Profile
              </button>
              
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition">
                💪 Generate Workout Plan
              </button>
              
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition">
                📅 View Workouts
              </button>
            </div>
          </div>

          {/* Debug Info (remove in production) */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
            <p className="font-semibold text-gray-700">Debug Info:</p>
            <p className="text-gray-600">User ID: {user?.id}</p>
            <p className="text-gray-600">Username: {user?.username || 'N/A'}</p>
            <p className="text-gray-600">Authenticated: ✅</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## 🚀 **Step 7: Test the App**

### **In Development:**

1. **Make sure backend is running:**
   ```bash
   cd ~/telegram-fitness-app
   npm run dev
   ```

2. **Frontend should already be running at:**
   ```
   http://localhost:5173/
   ```

3. **Open in browser:**
   - Visit `http://localhost:5173/`
   - You should see the app (without Telegram data in browser)

### **Test in Telegram:**

To test as a Telegram Mini App, you need to:

1. **Update bot settings with @BotFather:**
   ```
   /setmenubutton
   [Select your bot]
   URL: https://your-deployed-url.com
   Text: Open App
   ```

2. **For local testing, use ngrok:**
   ```bash
   npx ngrok http 5173
   ```
   Then use the ngrok URL with @BotFather

---

## 📁 **Project Structure:**

```
fitness-frontend/
├── src/
│   ├── components/          # React components
│   ├── hooks/              
│   │   └── useTelegram.ts  # Telegram WebApp hook
│   ├── services/
│   │   ├── auth.ts         # Authentication
│   │   ├── user.ts         # User API calls
│   │   └── workout.ts      # Workout API calls
│   ├── config/
│   │   └── api.ts          # Axios configuration
│   ├── pages/              # Page components
│   ├── App.tsx
│   └── main.tsx
├── .env.local              # Environment variables
└── package.json
```

---

## 🎯 **Next Features to Build:**

### Phase 1 (Today/Tomorrow):
1. ✅ Basic authentication
2. ⏳ Profile setup form
3. ⏳ User profile display

### Phase 2 (This Week):
4. Generate workout plan
5. Display workout list
6. Show workout details

### Phase 3 (Next Week):
7. Mark workouts complete
8. Progress tracking
9. Edit profile

---

## 💡 **Pro Tips:**

1. **Hot Reload:** Changes auto-refresh in browser
2. **Console:** Check browser console for errors
3. **Network Tab:** Monitor API calls
4. **Telegram DevTools:** Use Telegram's debug mode

---

## 🐛 **Troubleshooting:**

### CORS Errors:
Backend should have CORS enabled for `localhost:5173`

### API Connection Failed:
- Check backend is running on port 3000
- Verify `.env.local` has correct API URL

### Telegram Data Missing:
- Normal in browser (no Telegram context)
- Test in actual Telegram Mini App for full features

---

## 📚 **Resources:**

- **Telegram Mini Apps:** https://core.telegram.org/bots/webapps
- **Vite Docs:** https://vitejs.dev/
- **React Router:** https://reactrouter.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

**Ready to build amazing features!** 🚀



