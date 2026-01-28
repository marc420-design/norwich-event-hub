# 🌐 Deploy Norwich Event Hub to Your Domain

Complete guide to getting your website live at **norwicheventshub.com**

---

## 📋 What You'll Do

1. ✅ Push code to GitHub (10 min)
2. ✅ Deploy to Cloudflare Pages (5 min)
3. ✅ Connect your domain (10 min)
4. ✅ Configure SSL (automatic)
5. ✅ Go live! (5 min)

**Total time: 30 minutes**

---

## Step 1: Push to GitHub (10 minutes)

### A. Create GitHub Repository

1. **Go to GitHub**: https://github.com/new

2. **Create repository**:
   - Repository name: `norwich-event-hub`
   - Description: `Independent event listing platform for Norwich`
   - Visibility: **Private** (recommended) or Public
   - **DO NOT** initialize with README (you already have one)
   - Click **"Create repository"**

### B. Push Your Code

Open terminal/command prompt in your project folder:

```bash
cd "C:\Users\marc\Desktop\new company"

# Verify git is initialized (already done)
git status

# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/norwich-event-hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

**✅ Checkpoint**: Visit your GitHub repo - you should see all your files!

---

## Step 2: Deploy to Cloudflare Pages (5 minutes)

### A. Connect to Cloudflare

1. **Go to Cloudflare Pages**: https://dash.cloudflare.com/

2. **Log in** with your Cloudflare account
   - (If you don't have one, sign up - it's free)

3. **Go to "Workers & Pages"** in the sidebar

4. **Click "Create application"** → **"Pages"** → **"Connect to Git"**

### B. Connect GitHub

1. **Click "Connect GitHub"**

2. **Authorize Cloudflare** to access your GitHub

3. **Select repository**: `norwich-event-hub`

4. **Click "Begin setup"**

### C. Configure Build Settings

**Important**: Your site is static HTML, so:

- **Project name**: `norwich-event-hub` (or any name you want)
- **Production branch**: `main`
- **Framework preset**: `None`
- **Build command**: **(leave empty)**
- **Build output directory**: `/` (just a forward slash)
- **Root directory**: `/` (just a forward slash)

5. **Click "Save and Deploy"**

### D. Wait for Deployment

- Takes 1-3 minutes
- You'll see build logs
- When complete, you'll get a URL like:
  - `norwich-event-hub.pages.dev`

6. **Click the URL** to test your site!

**✅ Checkpoint**: Your site is now live at the Cloudflare URL!

---

## Step 3: Connect Your Custom Domain (10 minutes)

### A. Add Custom Domain in Cloudflare Pages

1. **In your Pages project**, go to **"Custom domains"** tab

2. **Click "Set up a custom domain"**

3. **Enter**: `norwicheventshub.com`

4. **Click "Continue"**

### B. Configure DNS

**Option A: Domain already in Cloudflare** (Easy!)

If `norwicheventshub.com` is already managed by Cloudflare:

1. Cloudflare will **automatically** add the DNS record
2. Click **"Activate domain"**
3. **Done!** Wait 1-2 minutes for propagation

**Option B: Domain NOT in Cloudflare** (Need to add it)

1. **Add your domain to Cloudflare**:
   - Go to Cloudflare Dashboard → **"Add a site"**
   - Enter: `norwicheventshub.com`
   - Choose **Free plan**
   - Click **"Add site"**

2. **Update nameservers** at your domain registrar:
   - Cloudflare will show you 2 nameservers like:
     - `ava.ns.cloudflare.com`
     - `cody.ns.cloudflare.com`
   - Copy these

3. **Go to your domain registrar** (where you bought the domain):
   - GoDaddy, Namecheap, etc.
   - Find "Nameservers" or "DNS Settings"
   - Change to **"Custom nameservers"**
   - Paste the Cloudflare nameservers
   - Save

4. **Wait for propagation** (5 minutes - 48 hours, usually 10-30 minutes)

5. **Return to Cloudflare Pages** → **"Custom domains"**
   - Add `norwicheventshub.com`
   - Cloudflare creates DNS record automatically

### C. Add WWW Subdomain

1. **Click "Set up a custom domain"** again

2. **Enter**: `www.norwicheventshub.com`

3. **Click "Continue"** → **"Activate domain"**

Now both `norwicheventshub.com` AND `www.norwicheventshub.com` work!

**✅ Checkpoint**: Your domain is connected!

---

## Step 4: SSL Certificate (Automatic!)

Cloudflare automatically provisions SSL certificate:

- Takes 1-5 minutes
- Your site will have `https://` (secure)
- No action needed!

**✅ Checkpoint**: Visit `https://norwicheventshub.com` - you should see a lock icon!

---

## Step 5: Configure Google Sheets (Make It Functional)

Your site is live, but events need backend!

### Quick Setup:

1. **Create Google Sheet** (if not done):
   - Follow `GOOGLE_SHEET_SETUP.md`
   - Deploy Google Apps Script
   - Get Web App URL

2. **Create config file**:
   ```bash
   # Create scripts/config.js (NOT gitignored for now)
   ```

3. **Add your Web App URL**:
   ```javascript
   const APP_CONFIG = {
       GOOGLE_APPS_SCRIPT_URL: 'YOUR_WEB_APP_URL_HERE',
       USE_LOCAL_STORAGE: false,
       SITE_URL: 'https://norwicheventshub.com',
       SOCIAL_HANDLES: {
           instagram: '@norwicheventshub',
           facebook: 'norwicheventshub',
           twitter: '@norwicheventshub'
       }
   };

   if (typeof window !== 'undefined') {
       window.APP_CONFIG = APP_CONFIG;
   }
   ```

4. **Commit and push**:
   ```bash
   git add scripts/config.js
   git commit -m "Add Google Sheets configuration"
   git push
   ```

5. **Cloudflare auto-deploys** in 1-2 minutes!

**✅ Checkpoint**: Test event submission form!

---

## Step 6: Verify Everything Works

### Test Checklist:

- [ ] **Visit https://norwicheventshub.com**
  - Site loads correctly
  - No SSL warnings

- [ ] **Test all pages**:
  - [ ] Homepage: `https://norwicheventshub.com/`
  - [ ] What's On Today: `https://norwicheventshub.com/today.html`
  - [ ] Directory: `https://norwicheventshub.com/directory.html`
  - [ ] Submit Event: `https://norwicheventshub.com/submit.html`

- [ ] **Test on mobile**:
  - Open on your phone
  - Check responsive design
  - Test navigation

- [ ] **Test form submission**:
  - Fill out "Submit Event" form
  - Click Submit
  - Check Google Sheet for new row
  - Check email for confirmation

- [ ] **Test event display**:
  - Add test event to Google Sheet
  - Set Status to "Approved"
  - Check it appears on website

**All working? 🎉 You're live!**

---

## Step 7: Configure Email (Optional but Recommended)

Your emails (info@norwicheventshub.com, etc.) should work via Cloudflare Email Routing:

1. **In Cloudflare Dashboard** → **"Email"** → **"Email Routing"**

2. **Verify status**: Should say "Active"

3. **Check destination addresses**:
   - Make sure your personal email is set as destination

4. **Test email**:
   - Send email to `info@norwicheventshub.com`
   - Check it arrives at your inbox

**✅ Checkpoint**: Emails forwarding correctly!

---

## 🚀 You're Live!

### Your Live URLs:

- **Main site**: https://norwicheventshub.com
- **WWW**: https://www.norwicheventshub.com
- **Cloudflare**: https://norwich-event-hub.pages.dev

### Your Emails:

- info@norwicheventshub.com
- submit@norwicheventshub.com
- events@norwicheventshub.com
- press@norwicheventshub.com
- hello@norwicheventshub.com

---

## 🔄 Making Updates

### When you make changes:

1. **Edit files locally**

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

3. **Cloudflare auto-deploys** in 1-2 minutes!

4. **Refresh your site** - changes are live!

**No manual deployment needed!**

---

## 📊 Monitor Your Site

### Cloudflare Analytics:

1. **Go to your Pages project** → **"Analytics"** tab

2. **View stats**:
   - Page views
   - Unique visitors
   - Top pages
   - Geographic data

### Google Analytics (Optional):

Add Google Analytics to track more details:

1. **Get GA4 tracking ID** from https://analytics.google.com/

2. **Add to all HTML files** (before `</head>`):
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

3. **Commit and push**

---

## 🔒 Security Settings

### Recommended Cloudflare Settings:

1. **SSL/TLS** → **"Full (strict)"**
2. **Security** → **"Automatic HTTPS Rewrites"**: ON
3. **Security** → **"Always Use HTTPS"**: ON
4. **Speed** → **"Auto Minify"**: Check HTML, CSS, JS
5. **Speed** → **"Brotli"**: ON

These optimize security and performance!

---

## 🐛 Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN"
- DNS not propagated yet
- Wait 10-30 minutes
- Try different network/device

### "Too Many Redirects"
- Go to SSL/TLS settings
- Change to "Full" or "Full (strict)"

### "404 Not Found"
- Check build output directory is `/` (root)
- Verify files deployed in Cloudflare Pages

### Site shows old version
- Clear browser cache (Ctrl+Shift+R)
- Check deployment completed in Cloudflare

### Form not submitting
- Check Google Apps Script is deployed
- Verify Web App URL in config.js
- Check browser console for errors (F12)

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Cloudflare Pages connected
- [ ] Site deployed successfully
- [ ] Custom domain added (norwicheventshub.com)
- [ ] WWW subdomain added
- [ ] SSL certificate active (HTTPS)
- [ ] All pages load correctly
- [ ] Mobile responsive working
- [ ] Google Sheets backend configured
- [ ] Form submissions working
- [ ] Events displaying correctly
- [ ] Email routing active
- [ ] Analytics set up (optional)

**All checked? 🎉 You're officially LIVE!**

---

## 🎯 Next Steps

Now that you're live:

1. **Add real events** (10-20 to start)
2. **Test everything** thoroughly
3. **Set up social media** accounts
4. **Launch announcement** (follow LAUNCH_CONTENT.md)
5. **Enable AI aggregation** (follow AI_AGGREGATOR_SETUP.md)
6. **Monitor and iterate**

---

## 💡 Pro Tips

### Performance:
- Images: Use WebP format, compress before uploading
- Files: Keep under 1MB each
- Cache: Cloudflare handles automatically

### SEO:
- Submit sitemap: https://norwicheventshub.com/sitemap.xml
- Google Search Console: Add and verify your site
- Keep meta descriptions updated

### Reliability:
- Cloudflare provides 99.99% uptime
- Pages are served from global CDN (super fast)
- Automatic DDoS protection

---

## 🎉 Congratulations!

**Your Norwich Event Hub is live at:**
# https://norwicheventshub.com

**Time to launch:** Follow `LAUNCH_CHECKLIST.md`

**Questions?** All documentation is ready for you!

You now have a **professional, scalable, automated event platform** that will grow with your audience!

🚀 **Welcome to the web!**
