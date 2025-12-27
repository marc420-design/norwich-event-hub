# 🚀 Deploy Norwich Event Hub NOW - Quick Checklist

## ✅ Pre-Deployment Status

**What's Ready:**
- ✅ Code pushed to GitHub: `github.com/marc420-design/norwich-event-hub`
- ✅ Data pipeline connected (AI → Website)
- ✅ Configuration set up (local dev mode)
- ✅ GitHub Actions workflow configured
- ✅ All changes committed and pushed
- ✅ Website ready for deployment

**Total Time to Deploy:** 5-10 minutes

---

## Step-by-Step Deployment

### Step 1: Open Cloudflare Pages (1 min)

1. Go to: https://dash.cloudflare.com/
2. Sign up or log in
3. Click **"Workers & Pages"** in sidebar
4. Click **"Create application"**
5. Click **"Pages"** tab
6. Click **"Connect to Git"**

---

### Step 2: Connect GitHub Repository (2 min)

1. Click **"Connect GitHub"**
2. Authorize Cloudflare (if needed)
3. Select repository: **"marc420-design/norwich-event-hub"**
4. Click **"Begin setup"**

---

### Step 3: Configure Build (1 min)

**Project name:** `norwich-event-hub`

**Production branch:** `master`

**Build settings:**
- Framework preset: **None**
- Build command: **(leave empty)**
- Build output directory: `/`
- Root directory: **(leave empty)**

**Click "Save and Deploy"**

---

### Step 4: Wait for Build (2-3 min)

Watch the build logs. You should see:
```
✅ Initializing build environment
✅ Cloning repository
✅ Building application
✅ Deploying to Cloudflare's network
✅ Success! Deployed to https://norwich-event-hub-XXX.pages.dev
```

---

### Step 5: Test Your Live Site (1 min)

1. Click the deployment URL
2. Verify:
   - ✅ Homepage loads
   - ✅ Events are displaying
   - ✅ Navigation works
   - ✅ "What's On Today" page works
   - ✅ Directory page works

---

### Step 6: Enable Auto-Deploy (30 sec)

**Already done!** Cloudflare auto-deploys on every push to `master` branch.

When GitHub Actions updates events (every Monday), Cloudflare will:
1. Detect the new commit
2. Rebuild the site automatically
3. Deploy updated events

---

## 🎯 Post-Deployment Tasks

### Immediate (Optional):

**Add Custom Domain:**
1. In Cloudflare Pages project → **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter: `norwicheventshub.com`
4. Follow DNS instructions

**Set Up GitHub Secrets (for AI automation):**
1. Go to: https://github.com/marc420-design/norwich-event-hub/settings/secrets/actions
2. Add secret: `CLAUDE_API_KEY`
   - Get from: https://console.anthropic.com/
   - Cost: ~$5-10/year
3. See `GITHUB_SECRETS_SETUP.md` for detailed instructions

---

### Test GitHub Actions Workflow:

1. Go to: https://github.com/marc420-design/norwich-event-hub/actions
2. Click **"Weekly Event Aggregation"**
3. Click **"Run workflow"**
4. Watch it run (will take ~5-10 minutes)
5. Check if `data/sample-events.json` gets updated
6. Cloudflare will auto-rebuild when data updates

**Note:** Workflow won't fully work until `CLAUDE_API_KEY` secret is added.

---

## 🎉 Success Checklist

Once deployed, verify:

- [ ] Site is live and accessible
- [ ] All pages load correctly
- [ ] Events are displaying (130 events should show)
- [ ] Filtering works on directory page
- [ ] Mobile responsive design works
- [ ] Custom domain connected (if applicable)
- [ ] Auto-deploy is enabled (check settings)
- [ ] GitHub Actions workflow is configured

---

## 📊 Deployment URLs

**Production Site:**
- Cloudflare Pages URL: `https://norwich-event-hub-XXX.pages.dev`
- Custom Domain (when added): `https://norwicheventshub.com`

**GitHub Repository:**
- Code: `https://github.com/marc420-design/norwich-event-hub`
- Actions: `https://github.com/marc420-design/norwich-event-hub/actions`
- Settings: `https://github.com/marc420-design/norwich-event-hub/settings`

---

## 🔧 Troubleshooting

**Build fails?**
- Check build logs in Cloudflare dashboard
- Verify all files pushed to GitHub
- Ensure no syntax errors in HTML/JS

**Events not showing?**
- Check `data/sample-events.json` exists
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

**Workflow not running?**
- Add `CLAUDE_API_KEY` secret in GitHub
- Check Actions tab for error logs
- See `GITHUB_SECRETS_SETUP.md`

---

## 🚀 Ready to Deploy?

**You're all set!** Just follow steps 1-4 above and your site will be live in 5 minutes.

**What happens after deployment:**
1. Site goes live immediately
2. Every time you push to GitHub, it auto-rebuilds
3. When AI scraper runs (Monday 6 AM), events auto-update
4. Cloudflare CDN makes your site blazing fast worldwide

**Status: READY FOR PRODUCTION! 🎉**

---

## Next Steps After Deployment

1. **Test the live site thoroughly**
2. **Add custom domain** (if you have one)
3. **Set up Claude API key** for weekly automation
4. **Share the site** and start promoting!
5. **Monitor the first automated run** (next Monday)

---

**Need help?** Check:
- Full guide: `DEPLOY_TO_CLOUDFLARE.md`
- GitHub Secrets: `GITHUB_SECRETS_SETUP.md`
- Project docs: `README.md`

🎉 **You're about to launch Norwich Event Hub!**
