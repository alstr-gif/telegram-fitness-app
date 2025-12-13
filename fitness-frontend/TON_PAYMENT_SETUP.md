# 💎 TON Payment Integration - Setup Guide

## ✅ Phase 1 Implementation Complete

The TON Connect payment integration has been successfully implemented, replacing Telegram Stars payments.

---

## 🔧 Configuration Required

### 1. Set Donation Wallet Address

**Important:** You must set your TON wallet address for receiving donations.

**Option A: Environment Variable (Recommended)**
```env
# In fitness-frontend/.env or Vercel environment variables
VITE_TON_DONATION_WALLET=EQD__________________________________________0vo
```

**Option B: Direct Code Update**
Update the `DONATION_WALLET_ADDRESS` constant in `src/App.tsx`:
```typescript
const DONATION_WALLET_ADDRESS = 'YOUR_TON_WALLET_ADDRESS_HERE';
```

**How to get your TON wallet address:**
1. Install a TON wallet (Tonkeeper, MyTonWallet, etc.)
2. Create a new wallet or use an existing one
3. Copy the wallet address (starts with `EQ` or `UQ`)

---

## 💰 Payment Amount

**Current Configuration:**
- Amount: **0.1 TON** (100,000,000 nanoTON)
- This is the default donation amount

**To change the amount:**
Update the `amountNanoTON` variable in the payment button handler in `App.tsx`:
```typescript
// 0.1 TON = 100,000,000 nanoTON
// 1 TON = 1,000,000,000 nanoTON
const amountNanoTON = '100000000'; // Change this value
```

---

## 🔄 How It Works

1. **User clicks "Support Us" button**
2. **If wallet not connected:**
   - TON Connect modal opens
   - User connects their wallet (Tonkeeper, etc.)
   - Button text changes to "Send 0.1 TON Support"
3. **If wallet connected:**
   - TON Connect transaction modal opens
   - User confirms transaction
   - Payment is sent to your wallet address
   - Success message is shown

---

## 📊 Analytics

Payment events are automatically tracked via the Telegram Analytics SDK:
- Payment amount
- Transaction hash/ID
- Tracked via `trackPayment()` function

---

## ⚠️ Important Notes

1. **TON Connect requires Telegram Mini App environment**
   - Won't work in regular browser
   - Must be tested inside Telegram

2. **Wallet address must be valid**
   - Format: `EQ...` or `UQ...`
   - Invalid addresses will cause transaction failures

3. **Network:**
   - Uses mainnet by default
   - For testing, use testnet wallets

4. **Transaction fees:**
   - Users pay transaction fees (typically ~0.01-0.02 TON)
   - These are separate from the donation amount

---

## 🧪 Testing

### Before Testing:
1. ✅ Set `VITE_TON_DONATION_WALLET` environment variable
2. ✅ Deploy frontend to Vercel (HTTPS required)
3. ✅ Update TON Connect manifest URL

### Test Flow:
1. Open app in Telegram Mini App
2. Click "Support Us" button
3. Connect wallet (Tonkeeper recommended)
4. Approve transaction
5. Verify payment received in your wallet
6. Check analytics events

---

## 🔒 Security

- **Never commit wallet addresses to git**
- Use environment variables for production
- Use different wallets for testnet/mainnet
- Verify transaction on TON blockchain explorer

---

## 📝 Migration from Telegram Stars

The old Telegram Stars payment system has been removed:
- ❌ Removed: `paymentService.createInvoice()`
- ❌ Removed: `WebApp.openInvoice()`
- ✅ Added: TON Connect integration
- ✅ Added: Direct TON transactions

**Backend Changes:**
- Payment controller still exists (for backward compatibility)
- Can be removed if no longer needed
- No breaking changes to other APIs

---

## 🚀 Next Steps

After Phase 1 implementation:
1. ✅ Set donation wallet address
2. ✅ Deploy to production
3. ✅ Test in Telegram Mini App
4. ✅ Verify payments received
5. ✅ Monitor analytics

---

**Status:** ✅ **Phase 1 Complete** - Ready for wallet address configuration and testing

