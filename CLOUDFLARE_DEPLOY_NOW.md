# Deploy to Cloudflare Pages - Quick Guide

## 🚀 First Time Deployment (5 Minutes)

### Step 1: Go to Cloudflare Pages

1. Visit: https://dash.cloudflare.com/
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Create application"** button
4. Click **"Pages"** tab
5. Click **"Connect to Git"**

---

### Step 2: Connect GitHub Repository

1. Click **"Connect GitHub"**
2. **Authorize Cloudflare** (if first time)
3. Select repository: **"marc420-design/norwich-event-hub"**
4. Click **"Begin setup"**

---

### Step 3: Configure Build Settings

**Project name:** `norwich-event-hub`

**Production branch:** `master`

**Build settings:**
- Framework preset: **None** (or select "None")
- Build command: **(leave empty)**
- Build output directory: `/` (root)
- Root directory: **(leave empty)**

**Click "Save and Deploy"**

---

### Step 4: Wait for First Build

Watch the deployment:
- Should take 2-3 minutes
- You'll see build logs
- Wait for "Success" message

**You'll get a URL like:**
```
https://norwich-event-hub-abc.pages.dev
```

**Test this URL first!**

---

### Step 5: Add Custom Domain (AFTER Pages URL works)

Only do this after the `.pages.dev` URL works:

1. In your Pages project, click **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: `norwicheventshub.com`
4. Follow DNS instructions
5. Add `www` subdomain too

---

## 🔧 Troubleshooting Current Error 522

### Issue: Custom domain configured but Pages not deployed

**Fix:**
1. Deploy to Pages first (Steps 1-4 above)
2. Test the `.pages.dev` URL
3. Then connect custom domain

### If you already have a Pages deployment:

**Check these:**
1. Pages project exists and is active
2. Latest commit deployed successfully
3. Custom domain DNS is correct
4. Wait 24-48 hours for DNS propagation

---

## ✅ Success Checklist

- [ ] Cloudflare Pages project created
- [ ] GitHub repository connected
- [ ] First deployment successful
- [ ] `.pages.dev` URL works
- [ ] Custom domain added (optional)
- [ ] DNS configured correctly

---

**Next:** Test your `.pages.dev` URL before adding custom domain!
