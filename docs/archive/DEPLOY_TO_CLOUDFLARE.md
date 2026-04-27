# 🚀 Deploy to Cloudflare Pages - 5 Minutes!

## 📋 What I Just Opened for You:
1. ✅ Cloudflare signup/login page
2. ✅ Your GitHub repository (to verify it's there)

---

## STEP 1: Sign Up/Login to Cloudflare (30 seconds)

**In the Cloudflare tab:**

1. **If you don't have an account:**
   - Enter your email
   - Create a password
   - Verify email

2. **If you have an account:**
   - Just login

**→ Click "Workers & Pages" in the left sidebar**

---

## STEP 2: Create Pages Project (1 minute)

1. Click the **"Create application"** button
2. Click the **"Pages"** tab
3. Click **"Connect to Git"**

---

## STEP 3: Connect GitHub (30 seconds)

1. Click **"Connect GitHub"**
2. Authorize Cloudflare to access your GitHub
3. Select **"marc420-design/norwich-event-hub"**
4. Click **"Begin setup"**

---

## STEP 4: Configure Build Settings (1 minute)

**Project name:** `norwich-event-hub` (or whatever you want)

**Build settings:**
- Framework preset: **None** (leave as is)
- Build command: **(leave blank)**
- Build output directory: **/** (root)
- Root directory: **(leave blank)**

**Environment variables:** (skip for now)

**→ Click "Save and Deploy"**

---

## STEP 5: Wait for Deployment (2 minutes)

You'll see:
```
⚡ Building your project...
✅ Deployment successful!
```

**Your site is now live at:**
- `https://norwich-event-hub.pages.dev`
- Or whatever URL Cloudflare gives you

---

## STEP 6: Add Your Custom Domain (1 minute)

1. In your project dashboard, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: **norwicheventshub.com**
4. Click **"Activate domain"**

**Cloudflare will show you DNS settings to add at your domain registrar**

---

## DNS Setup (Where You Bought Your Domain)

**Go to your domain registrar** (GoDaddy, Namecheap, etc.)

**Add these DNS records:**

**Option A - If using Cloudflare nameservers (Recommended):**
1. Change nameservers to Cloudflare's nameservers (they'll show you 2)
2. Wait 5-60 minutes for propagation
3. DONE! ✅

**Option B - If keeping current nameservers:**
1. Add CNAME record:
   - Name: `www`
   - Value: `norwich-event-hub.pages.dev`
2. Add A records for root domain (if required):
   - Use the IPs Cloudflare provides

---

## ✅ VERIFICATION

**After 5-60 minutes, check:**

1. **Your Cloudflare URL:** https://norwich-event-hub.pages.dev
   - Should show your 47 events
   - All pages working
   - Filters working

2. **Your Custom Domain:** https://norwicheventshub.com
   - Same as above
   - Might take longer to propagate

---

## 🎉 CONGRATULATIONS!

**Your Norwich Event Hub is LIVE!**

✅ Professional website
✅ 47 real events
✅ AI auto-updates every Monday
✅ Free hosting forever
✅ SSL certificate (HTTPS) automatic
✅ Global CDN (super fast)

---

## 📊 WHAT HAPPENS NEXT

**Monday 6 AM UTC:**
- GitHub Actions runs
- AI scrapes 50+ Norwich events
- Processes with OpenAI
- Commits new events to GitHub
- Cloudflare auto-deploys updates
- Your site updates automatically

**Cost:** £0.15-0.30/week = £10-15/year

---

## 🔧 TROUBLESHOOTING

**"Domain not working":**
- DNS takes 5-60 minutes to propagate
- Check nameservers are correct
- Clear browser cache

**"Site shows old version":**
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check Cloudflare deployment status

**"Events not showing":**
- Check browser console (F12)
- Verify JSON file deployed
- Check force-reload.js is loading

---

## 📞 SUPPORT

**Need help?**
- Cloudflare Docs: https://developers.cloudflare.com/pages/
- GitHub Repo: https://github.com/marc420-design/norwich-event-hub
- Email: support@norwicheventshub.com (set this up!)

---

**YOUR NORWICH EVENT HUB IS READY TO SERVE! 🎊**

Built with AI | Auto-updates weekly | Zero maintenance
