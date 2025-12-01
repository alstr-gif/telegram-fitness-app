# 🚀 TON Integration Setup Guide

This document tracks the setup and implementation of TON Blockchain integration for Telegram App Center submission.

## ✅ Completed Setup

### 1. Feature Branch Created
- Branch: `feature/ton-integration`
- Status: ✅ Created and ready for development

### 2. TON Connect SDK Installed
- Packages installed:
  - `@tonconnect/ui` - UI components for wallet connection
  - `@tonconnect/sdk` - Core SDK for TON Connect
- Location: `fitness-frontend/package.json`

### 3. TON Connect Manifest File
- File: `fitness-frontend/public/tonconnect-manifest.json`
- Status: ✅ Created (needs URL update)
- **Action Required:** Update the `url` field with your actual Vercel deployment URL

### 4. TON Connect Hook
- File: `fitness-frontend/src/hooks/useTonConnect.ts`
- Features:
  - Wallet connection/disconnection
  - Transaction sending
  - Connection state management
  - Error handling

### 5. Wallet Connect Component
- File: `fitness-frontend/src/components/WalletConnect.tsx`
- Features:
  - Connect wallet button
  - Display connected wallet address
  - Disconnect functionality
  - Error display

### 6. Analytics SDK Structure
- File: `fitness-frontend/src/utils/analytics.ts`
- Features:
  - Analytics initialization
  - Event tracking functions
  - Integration with Telegram Mini Apps Analytics SDK
- Status: ✅ Structure created (needs API key)

### 7. Analytics Initialization
- File: `fitness-frontend/src/main.tsx`
- Status: ✅ Analytics initialization added

---

## 📋 Next Steps

### Immediate Actions Required

1. **Update TON Connect Manifest**
   - Edit: `fitness-frontend/public/tonconnect-manifest.json`
   - Update `url` with your Vercel deployment URL
   - Update `iconUrl` with your app icon URL
   - Add `termsOfUseUrl` and `privacyPolicyUrl` (optional)

2. **Get Analytics API Key**
   - Go to: https://builders.ton.org
   - Register your project
   - Navigate to Analytics tab
   - Copy your API key
   - Add to environment variables: `VITE_TON_ANALYTICS_API_KEY`

3. **Set Environment Variables**
   - Vercel: Add `VITE_TON_ANALYTICS_API_KEY`
   - Local: Add to `fitness-frontend/.env`

### Implementation Tasks

- [ ] Integrate WalletConnect component into App.tsx
- [ ] Replace Telegram Stars payment with TON payments
- [ ] Update PaymentController to handle TON transactions
- [ ] Add TON transaction verification (backend)
- [ ] Test wallet connection in Telegram Mini App
- [ ] Test transaction sending
- [ ] Verify Analytics SDK events are tracked
- [ ] Update manifest URL with production URL

---

## 🔧 Configuration

### Environment Variables

**Frontend (Vercel/Local):**
```env
VITE_TON_ANALYTICS_API_KEY=your-api-key-here
VITE_API_URL=https://your-railway-url.up.railway.app
```

**Backend (Railway - Optional):**
```env
TON_RPC_URL=https://mainnet.toncenter.com
# Or for testing:
TON_RPC_URL=https://testnet.toncenter.com
```

### Manifest File Configuration

Update `fitness-frontend/public/tonconnect-manifest.json`:

```json
{
  "url": "https://your-actual-app.vercel.app",
  "name": "Telegram Fitness App",
  "iconUrl": "https://your-actual-app.vercel.app/icon.png",
  "termsOfUseUrl": "https://your-actual-app.vercel.app/terms",
  "privacyPolicyUrl": "https://your-actual-app.vercel.app/privacy"
}
```

---

## 📚 Usage Examples

### Using WalletConnect Component

```tsx
import { WalletConnect } from './components/WalletConnect';
import { useTelegram } from './hooks/useTelegram';

function App() {
  const { themeParams } = useTelegram();
  
  return (
    <WalletConnect 
      themeParams={themeParams}
      onConnect={(address) => {
        console.log('Wallet connected:', address);
        // Track analytics event
        trackWalletConnection(address);
      }}
      onDisconnect={() => {
        console.log('Wallet disconnected');
      }}
    />
  );
}
```

### Using TON Connect Hook Directly

```tsx
import { useTonConnect } from './hooks/useTonConnect';

function MyComponent() {
  const { 
    connected, 
    walletAddress, 
    connectWallet, 
    sendTransaction 
  } = useTonConnect();

  const handlePayment = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }

    try {
      const result = await sendTransaction(
        '0:recipient-address',
        '1000000000', // Amount in nanoTON (1 TON = 1,000,000,000 nanoTON)
        'Payment for workout plan'
      );
      console.log('Transaction sent:', result);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={handlePayment}>
      {connected ? 'Send Payment' : 'Connect Wallet'}
    </button>
  );
}
```

### Using Analytics

```tsx
import { 
  trackEvent, 
  trackWorkoutGeneration, 
  trackWalletConnection 
} from './utils/analytics';

// Track custom event
trackEvent('custom_event', { data: 'value' });

// Track workout generation
trackWorkoutGeneration('workout-123');

// Track wallet connection
trackWalletConnection('0:wallet-address');
```

---

## 🧪 Testing Checklist

### Local Testing
- [ ] App builds without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] WalletConnect component renders
- [ ] Analytics initializes (check console)

### Production Testing (After Deployment)
- [ ] Manifest file accessible at `/tonconnect-manifest.json`
- [ ] Wallet connection works in Telegram Mini App
- [ ] Transaction sending works
- [ ] Analytics events are tracked
- [ ] Existing features still work

---

## 📖 Resources

- **TON Connect Docs:** https://docs.ton.org/v3/guidelines/ton-connect/overview
- **TON Connect SDK:** https://ton-connect.github.io/sdk/
- **Analytics Setup:** https://docs.ton.org/ecosystem/tma/analytics/preparation
- **TON Builders:** https://builders.ton.org
- **App Center Guidelines:** https://core.telegram.org/bots/blockchain-guidelines

---

## 🚨 Important Notes

1. **Manifest URL:** Must be publicly accessible and match your deployment URL exactly
2. **Analytics API Key:** Required from TON Builders before submission
3. **Testing:** TON Connect requires Telegram Mini App environment (not just browser)
4. **Transaction Amounts:** Use nanoTON (1 TON = 1,000,000,000 nanoTON)
5. **Network:** Use testnet for initial testing, mainnet for production

---

## 📝 Development Workflow

1. **Develop on feature branch:**
   ```bash
   git checkout feature/ton-integration
   # Make changes
   git commit -m "feat: description"
   git push
   ```

2. **Test locally:**
   ```bash
   npm run dev  # Backend
   cd fitness-frontend && npm run dev  # Frontend
   ```

3. **When ready:**
   ```bash
   git checkout main
   git merge feature/ton-integration
   git push origin main
   # Railway/Vercel auto-deploy
   ```

4. **Test in production:**
   - Open Telegram Mini App
   - Test TON Connect
   - Test Analytics
   - Verify existing features

---

**Status:** ✅ Initial setup complete. Ready for implementation and testing.



