# 100% FREE Deployment Guide

Deploy DevBoard completely free using Vercel + Render + MongoDB Atlas.

## Total Cost: $0/month 🎉

---

## Step 1: Deploy Backend to Render (FREE)

### 1.1 Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub (free)

### 1.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `devboard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** ⭐

### 1.3 Add Environment Variables
Click "Advanced" → "Add Environment Variable":

```
MONGODB_URI=your_mongodb_atlas_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OAUTH_CALLBACK_URL=https://your-app.onrender.com/auth/github/callback
PORT=5001
NODE_ENV=production
```

### 1.4 Deploy
- Click **"Create Web Service"**
- Wait 5-10 minutes for first deploy
- Copy your URL: `https://your-app.onrender.com`

**Note:** Free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## Step 2: Setup MongoDB Atlas (FREE)

### 2.1 Create Account
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Sign up (free)

### 2.2 Create Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select region closest to you
4. Cluster name: `devboard`
5. Click **"Create"**

### 2.3 Create Database User
1. **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Username: `devboard_user`
4. Password: Generate secure password (save it!)
5. **Database User Privileges**: Read and write to any database
6. Click **"Add User"**

### 2.4 Whitelist All IPs
1. **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. IP: `0.0.0.0/0`
5. Click **"Confirm"**

### 2.5 Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy connection string:
   ```
   mongodb+srv://devboard_user:<password>@cluster.mongodb.net/devboard
   ```
4. Replace `<password>` with your actual password
5. Add this to Render environment variables

---

## Step 3: Deploy Frontend to Vercel (FREE)

### 3.1 Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub (free)

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variable
1. Go to **"Environment Variables"**
2. Add:
   ```
   VITE_API_URL=https://your-app.onrender.com
   ```
   (Use your Render backend URL)

### 3.4 Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- Your site is live! 🎉
- URL: `https://your-app.vercel.app`

---

## Step 4: Setup GitHub OAuth App

### 4.1 Create OAuth App
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**

### 4.2 Configure
- **Application name**: `DevBoard`
- **Homepage URL**: `https://your-app.vercel.app`
- **Authorization callback URL**: `https://your-app.onrender.com/auth/github/callback`
- Click **"Register application"**

### 4.3 Get Credentials
1. Copy **Client ID**
2. Click **"Generate a new client secret"**
3. Copy **Client Secret**
4. Add both to Render environment variables
5. Restart your Render service

---

## Step 5: Update Backend CORS

Your backend needs to allow requests from your Vercel frontend.

### 5.1 Add Environment Variable to Render
```
FRONTEND_URL=https://your-app.vercel.app
```

### 5.2 Update server.js
The code already uses `process.env.FRONTEND_URL`, so just restart the service.

---

## Step 6: Test Your Deployment

1. Visit `https://your-app.vercel.app`
2. Click **"connect with github"**
3. Authorize the app
4. You should be redirected to dashboard
5. Sync your data
6. Click **"devwrapped"** to test

---

## Free Tier Limits

### Vercel (Frontend)
- ✅ 100GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Global CDN
- **Perfect for this project!**

### Render (Backend)
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: ~30 seconds
- ✅ Automatic HTTPS
- **Good for personal/demo projects**

### MongoDB Atlas (Database)
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Enough for 100+ users
- **Perfect for starting out!**

---

## Dealing with Render Cold Starts

The free tier spins down after 15 minutes. Here are solutions:

### Option 1: Accept It (Recommended)
- First request takes 30 seconds
- Subsequent requests are fast
- Good for portfolio/demo

### Option 2: Keep-Alive Service (Free)
Use a free service to ping your backend every 14 minutes:

1. **UptimeRobot** (free)
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Add monitor for your Render URL
   - Check every 5 minutes
   - Keeps your service awake!

2. **Cron-job.org** (free)
   - Go to [cron-job.org](https://cron-job.org)
   - Create job to ping your URL every 14 minutes

### Option 3: Upgrade Later
- When you get users, upgrade Render to $7/month
- No cold starts
- Always fast

---

## Troubleshooting

### "Cannot connect to backend"
- Check Render service is running
- Verify `VITE_API_URL` in Vercel
- Check Render logs for errors

### "GitHub OAuth not working"
- Verify callback URL matches exactly
- Check client ID and secret in Render
- Ensure HTTPS (not HTTP)

### "Database connection failed"
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string
- Check database user password

### "CORS errors"
- Add `FRONTEND_URL` to Render
- Restart Render service
- Clear browser cache

### "Render service won't start"
- Check Render logs
- Verify all environment variables
- Check `package.json` has correct start script

---

## Monitoring Your Free Deployment

### Vercel Dashboard
- View deployments
- Check bandwidth usage
- See build logs

### Render Dashboard
- Monitor service status
- View logs
- Check uptime

### MongoDB Atlas
- Monitor storage usage
- Check connection count
- View performance metrics

---

## When to Upgrade

You should upgrade when:

1. **Render**: Getting 100+ daily users (cold starts annoying)
2. **MongoDB**: Using >400MB storage
3. **Vercel**: Using >80GB bandwidth/month

**Upgrade costs:**
- Render: $7/month (no cold starts)
- MongoDB: $9/month (2GB storage)
- Vercel: Still free!

---

## Alternative 100% Free Options

### Option A: Vercel for Everything
- Deploy both frontend and backend to Vercel
- Use Vercel Serverless Functions
- Requires code restructuring

### Option B: Netlify
- Similar to Vercel
- Free tier comparable
- Good alternative

### Option C: Cyclic.sh
- Free backend hosting
- No cold starts on free tier
- Good Render alternative

---

## Your Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string copied
- [ ] Render account created
- [ ] Backend deployed to Render
- [ ] All environment variables added to Render
- [ ] Render service is running
- [ ] Vercel account created
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set in Vercel
- [ ] GitHub OAuth app created
- [ ] OAuth credentials added to Render
- [ ] Callback URL updated
- [ ] Tested login flow
- [ ] Tested data sync
- [ ] Tested DevWrapped

---

## Success! 🎉

Your DevBoard is now live and 100% free!

**Share your link:**
- Add to your resume
- Share on LinkedIn
- Tweet about it
- Show to recruiters

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`
- Database: MongoDB Atlas

Anyone can now sign up and use your DevBoard! 🚀

---

## Need Help?

Common issues and solutions are in the Troubleshooting section above.

For other issues:
1. Check Render logs
2. Check Vercel deployment logs
3. Verify all environment variables
4. Test locally first

---

**Enjoy your free deployment!** 💚
