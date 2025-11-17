# 🌐 API_URL Explained

What is API_URL and how to get one for production deployment.

---

## 📖 What is API_URL?

**API_URL** is the public internet address (URL) where your backend API server will be accessible.

It's the URL that:
- Your frontend uses to make API calls
- Telegram Mini App uses to connect to your backend
- External services use to access your API
- Users' browsers connect to for API requests

**Example:**
```
https://api.yourdomain.com
https://your-app.railway.app
https://your-app.herokuapp.com
```

---

## 🎯 Why You Need It

Your application needs to know where the backend API is located:

1. **Frontend** → Calls API at this URL
2. **Telegram Bot** → Connects to API at this URL
3. **Telegram Mini App** → Loads from frontend, which calls API at this URL
4. **CORS** → Allows requests from frontend to this API URL

---

## 🚀 How to Get Your API_URL

Your API_URL depends on **where you deploy your backend**. Here are the most common options:

---

## Option 1: Railway.app (Recommended - Easiest)

### What You Get:
Railway automatically provides a URL when you deploy:
```
https://your-app-name.railway.app
```

### How to Get It:
1. **Deploy your app to Railway:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   railway link
   
   # Deploy
   railway up
   ```

2. **Railway will show you the URL:**
   - In the Railway dashboard
   - In the terminal output after deployment
   - Format: `https://your-app-name.railway.app`

3. **Use it in .env:**
   ```env
   API_URL=https://your-app-name.railway.app
   ```

### Custom Domain (Optional):
- Add your own domain in Railway dashboard
- Example: `https://api.yourdomain.com`

---

## Option 2: Heroku

### What You Get:
Heroku provides a URL when you create an app:
```
https://your-app-name.herokuapp.com
```

### How to Get It:
1. **Create Heroku app:**
   ```bash
   # Install Heroku CLI
   # Login
   heroku login
   
   # Create app
   heroku create your-app-name
   # This will show: https://your-app-name.herokuapp.com
   ```

2. **Deploy:**
   ```bash
   git push heroku main
   ```

3. **Use it in .env:**
   ```env
   API_URL=https://your-app-name.herokuapp.com
   ```

### Custom Domain (Optional):
- Add domain in Heroku dashboard: Settings → Domains
- Example: `https://api.yourdomain.com`

---

## Option 3: DigitalOcean App Platform

### What You Get:
DigitalOcean provides a URL when you deploy:
```
https://your-app-name.ondigitalocean.app
```

### How to Get It:
1. **Create app in DigitalOcean dashboard:**
   - Connect your GitHub repository
   - Configure build settings
   - Deploy

2. **Get URL from dashboard:**
   - App → Settings → App URL
   - Format: `https://your-app-name.ondigitalocean.app`

3. **Use it in .env:**
   ```env
   API_URL=https://your-app-name.ondigitalocean.app
   ```

### Custom Domain (Optional):
- Add domain in App Platform → Settings → Domains
- Example: `https://api.yourdomain.com`

---

## Option 4: Vercel / Netlify (For Frontend)

**Note:** These are primarily for frontend. For backend API, use:
- Railway (recommended)
- Heroku
- DigitalOcean
- AWS
- Or any Node.js hosting

---

## Option 5: Your Own Server (VPS)

If you have your own server (DigitalOcean Droplet, AWS EC2, etc.):

### What You Get:
```
https://your-server-ip-or-domain.com
```

### How to Set It Up:
1. **Deploy your app to the server**
2. **Set up Nginx/Apache** as reverse proxy
3. **Configure SSL** (Let's Encrypt)
4. **Use your domain:**
   ```env
   API_URL=https://api.yourdomain.com
   ```

---

## 🔒 Important: HTTPS Required

**⚠️ CRITICAL:** Your API_URL **MUST** use HTTPS in production!

- ✅ `https://api.yourdomain.com` - Correct
- ❌ `http://api.yourdomain.com` - Wrong (will fail validation)
- ❌ `http://localhost:3000` - Wrong (development only)

**Why?**
- Telegram requires HTTPS for Mini Apps
- Security best practice
- Required by production validation

---

## 📝 Step-by-Step: Getting Your API_URL

### Quick Start (Railway - Easiest):

1. **Sign up for Railway:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Railway will:**
   - Build your app
   - Deploy it
   - Give you a URL like: `https://your-app.railway.app`

4. **Copy the URL:**
   - It's shown in the Railway dashboard
   - Use it as your API_URL

5. **Add to .env:**
   ```env
   API_URL=https://your-app.railway.app
   ```

---

## 🧪 Testing Your API_URL

Once you have your API_URL, test it:

```bash
# Test health endpoint
curl https://your-api-url.com/api/health

# Should return:
# {"status":"ok","message":"Telegram Fitness App API is running",...}
```

---

## 🔄 Updating API_URL

If your API_URL changes:

1. **Update .env file:**
   ```env
   API_URL=https://new-api-url.com
   ```

2. **Update CORS_ORIGIN** (if needed):
   ```env
   CORS_ORIGIN=https://your-frontend.com
   ```

3. **Redeploy** (if using environment variables from hosting platform)

---

## 📋 Quick Reference

| Platform | URL Format | How to Get |
|----------|-----------|------------|
| Railway | `https://app.railway.app` | Auto-generated on deploy |
| Heroku | `https://app.herokuapp.com` | `heroku create app-name` |
| DigitalOcean | `https://app.ondigitalocean.app` | From dashboard after deploy |
| Custom Domain | `https://api.yourdomain.com` | Configure in hosting platform |

---

## 🎯 For Your Current Setup

**Right now, you need to:**

1. **Choose a hosting platform** (Railway recommended)
2. **Deploy your backend** to that platform
3. **Get the URL** from the platform
4. **Add it to .env.production:**
   ```env
   API_URL=https://your-actual-api-url.com
   ```

**You don't have the URL yet?** That's okay! You can:
- Deploy first, then update .env with the URL
- Or set a placeholder and update after deployment

---

## 💡 Pro Tips

1. **Start with Railway** - Easiest setup, free tier available
2. **Use custom domain later** - Start with platform URL, add custom domain when ready
3. **Test before production** - Verify API works at the URL
4. **Keep it secure** - Always use HTTPS
5. **Document it** - Note your API_URL for reference

---

## 🆘 Common Questions

**Q: Do I need to buy a domain?**  
A: No! Hosting platforms provide free URLs. You can add a custom domain later.

**Q: Can I use localhost?**  
A: No, not for production. Localhost only works on your computer. You need a public URL.

**Q: How much does it cost?**  
A: Many platforms have free tiers (Railway, Heroku). Custom domains cost ~$10-15/year.

**Q: Can I change it later?**  
A: Yes! Just update your .env file and redeploy.

---

**🎉 Summary:** Your API_URL is the public address where your backend API lives. Deploy to a hosting platform (like Railway) and they'll give you the URL!

