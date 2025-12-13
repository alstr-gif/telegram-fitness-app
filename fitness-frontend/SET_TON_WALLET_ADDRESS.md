# 💎 How to Set Your TON Wallet Address - Step by Step

## 🎯 Quick Summary

You need to set your TON wallet address so donations can be sent to you. Choose **Method 1** (Environment Variable) for production, or **Method 2** (Direct Code) for quick testing.

---

## 📋 Method 1: Environment Variable (Recommended for Production)

### Step 1: Get Your TON Wallet Address

1. **Install a TON wallet** (if you don't have one):
   - **Tonkeeper** (Recommended): https://tonkeeper.com
   - **MyTonWallet**: https://mytonwallet.io
   - **Telegram Wallet**: Built into Telegram

2. **Open your wallet** and copy your address:
   - It will look like: `EQD...` or `UQ...` (usually starts with `EQ`)
   - Example: `EQD__________________________________________0vo`
   - Copy the full address

### Step 2: Create `.env` File (Local Development)

1. **Navigate to the frontend directory:**
   ```bash
   cd fitness-frontend
   ```

2. **Create a `.env` file** (if it doesn't exist):
   ```bash
   touch .env
   ```

3. **Open the `.env` file** in your editor:
   ```bash
   code .env
   # or
   nano .env
   # or use any text editor
   ```

4. **Add your wallet address:**
   ```env
   VITE_TON_DONATION_WALLET=YOUR_WALLET_ADDRESS_HERE
   ```

   **Replace `YOUR_WALLET_ADDRESS_HERE` with your actual wallet address:**
   ```env
   VITE_TON_DONATION_WALLET=EQD__________________________________________0vo
   ```

5. **Save the file**

6. **Restart your development server** (if running):
   - Stop the server (Ctrl+C)
   - Start it again: `npm run dev`

### Step 3: Set Environment Variable in Vercel (Production)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com
   - Log in to your account

2. **Select your project:**
   - Click on your `fitness-frontend` project

3. **Go to Settings:**
   - Click "Settings" in the top navigation

4. **Go to Environment Variables:**
   - Click "Environment Variables" in the left sidebar

5. **Add new variable:**
   - Click "Add New" or "+ New"
   - **Key:** `VITE_TON_DONATION_WALLET`
   - **Value:** Your wallet address (e.g., `EQD__________________________________________0vo`)
   - **Environment:** Select "Production" (and optionally "Preview" and "Development")

6. **Save:**
   - Click "Save"

7. **Redeploy:**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger a new deployment

---

## 📝 Method 2: Direct Code Update (Quick Testing)

### Step 1: Get Your TON Wallet Address

Same as Method 1, Step 1 above.

### Step 2: Update the Code

1. **Open the file:**
   ```
   fitness-frontend/src/App.tsx
   ```

2. **Find line 63** (around line 63):
   ```typescript
   const DONATION_WALLET_ADDRESS = import.meta.env.VITE_TON_DONATION_WALLET || 'EQD__________________________________________0vo'; // Placeholder - update with your wallet address
   ```

3. **Replace the placeholder** with your wallet address:
   ```typescript
   const DONATION_WALLET_ADDRESS = import.meta.env.VITE_TON_DONATION_WALLET || 'YOUR_ACTUAL_WALLET_ADDRESS_HERE';
   ```

   **Example:**
   ```typescript
   const DONATION_WALLET_ADDRESS = import.meta.env.VITE_TON_DONATION_WALLET || 'EQD123456789012345678901234567890123456789012345678901234567890ABCD';
   ```

4. **Save the file**

5. **Restart development server** (if running):
   - Stop: Ctrl+C
   - Start: `npm run dev`

---

## ✅ Verify It's Working

### Local Testing:

1. **Check the console:**
   - Open browser dev tools (F12)
   - Look for any errors about the wallet address

2. **Test the payment button:**
   - Click "Support Us" button
   - Connect wallet
   - Try to send payment (you can cancel before confirming)
   - Check that the transaction shows your wallet address

### Production Testing:

1. **Deploy to Vercel**
2. **Open app in Telegram Mini App**
3. **Test payment flow**
4. **Verify payment received in your wallet**

---

## 🔍 How to Find Your Wallet Address

### In Tonkeeper:
1. Open Tonkeeper app
2. Tap on your wallet (top of screen)
3. Your address is shown (starts with `EQ` or `UQ`)
4. Tap to copy

### In MyTonWallet:
1. Open MyTonWallet
2. Your address is shown on the main screen
3. Click to copy

### In Telegram Wallet:
1. Open Telegram
2. Go to Settings → Wallet
3. Your address is shown
4. Tap to copy

---

## ⚠️ Important Notes

1. **Wallet Address Format:**
   - Must start with `EQ` or `UQ`
   - Usually 48 characters long
   - Example: `EQD123456789012345678901234567890123456789012345678901234567890ABCD`

2. **Don't use testnet addresses:**
   - Use mainnet addresses for production
   - Testnet addresses start differently

3. **Security:**
   - Never share your private key
   - Only share your public wallet address (what we're setting here)

4. **Multiple Environments:**
   - Local development: Use `.env` file
   - Production: Use Vercel environment variables

---

## 🚨 Troubleshooting

### "Invalid wallet address" error:
- Check the address format (must start with `EQ` or `UQ`)
- Make sure there are no extra spaces
- Verify it's a mainnet address

### Environment variable not working:
- Make sure the variable name is exactly: `VITE_TON_DONATION_WALLET`
- Restart the dev server after adding to `.env`
- For Vercel: Redeploy after adding the variable

### Payment not working:
- Verify wallet address is correct
- Check that it's a valid mainnet address
- Make sure you have funds in your wallet to test receiving

---

## 📞 Need Help?

If you're stuck:
1. Double-check the wallet address format
2. Verify the environment variable name
3. Check browser console for errors
4. Make sure you restarted the dev server

---

**Quick Reference:**
- **Local:** Create `fitness-frontend/.env` with `VITE_TON_DONATION_WALLET=YOUR_ADDRESS`
- **Production:** Add `VITE_TON_DONATION_WALLET` in Vercel → Settings → Environment Variables

