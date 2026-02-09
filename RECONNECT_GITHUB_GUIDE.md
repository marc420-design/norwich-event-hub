# Reconnect GitHub to Cloudflare Pages - Step-by-Step Guide

## Current Status
- ✅ Site is deployed and working: https://norwicheventshub.com
- ❌ Git Provider: **Disconnected** (shows "No" instead of "GitHub")
- ❌ Automatic deployments are not working

## Manual Reconnection Steps

### Option 1: Through Cloudflare Dashboard (Recommended)

1. **Navigate to Cloudflare Dashboard:**
   - Go to: https://dash.cloudflare.com
   - Log in with your account

2. **Go to Workers & Pages:**
   - Click on "Workers & Pages" in the left sidebar
   - Or navigate directly to: https://dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/workers/pages

3. **Select Your Project:**
   - Find and click on "norwich-event-hub" project

4. **Go to Settings:**
   - Click on the "Settings" tab at the top of the project page

5. **Find Builds & Deployments Section:**
   - Scroll down to find "Builds & deployments" or "Source" section
   - Look for Git integration settings

6. **Connect to GitHub:**
   - Click "Connect to Git" or "Connect repository" button
   - Select "GitHub" as the provider
   - Authorize Cloudflare GitHub App (you'll be redirected to GitHub)
   - Select repository: `marc420-design/norwich-event-hub`
   - Set production branch: `master`
   - Click "Save" or "Connect"

7. **Verify Connection:**
   - After reconnecting, the Git Provider should show "GitHub" instead of "No"
   - You can verify by running: `wrangler pages project list`

### Option 2: Through GitHub App Settings (Alternative)

If the dashboard method doesn't work, try reinstalling the Cloudflare GitHub App:

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/settings/installations
   - Find "Cloudflare Pages" in your installed GitHub Apps

2. **Reinstall/Reconfigure:**
   - Click on "Cloudflare Pages"
   - Click "Configure" or "Reinstall"
   - Ensure `marc420-design/norwich-event-hub` repository is selected
   - Authorize the app

3. **Return to Cloudflare:**
   - Go back to Cloudflare Dashboard
   - Navigate to your Pages project settings
   - The connection should now appear

## Verify Connection

After reconnecting, verify the connection is working:

```powershell
cd "C:\Users\marcc\Desktop\new company"
wrangler pages project list
```

The output should show:
- **Git Provider:** GitHub (instead of "No")
- **Repository:** marc420-design/norwich-event-hub

## Test Automatic Deployment

Once reconnected, test that automatic deployments work:

```powershell
cd "C:\Users\marcc\Desktop\new company"
git add .
git commit -m "Test automatic deployment"
git push origin master
```

After pushing, check the Cloudflare Dashboard:
- Go to your Pages project
- Click on "Deployments" tab
- You should see a new deployment triggered automatically

## Troubleshooting

### If Connection Still Shows "No":
1. Check GitHub App permissions in GitHub Settings
2. Ensure the repository name matches exactly: `marc420-design/norwich-event-hub`
3. Try disconnecting and reconnecting again
4. Clear browser cache and cookies

### If Deployments Don't Trigger:
1. Verify webhook is installed in GitHub:
   - Go to: https://github.com/marc420-design/norwich-event-hub/settings/hooks
   - Look for Cloudflare Pages webhook
2. Check branch name matches: `master` (not `main`)
3. Verify GitHub Actions workflow is enabled (if using GitHub Actions)

## Current Project Details

- **Project Name:** norwich-event-hub
- **Account ID:** 8c701b8757253b51f9344c37d4ceef48
- **Repository:** marc420-design/norwich-event-hub
- **Branch:** master
- **Production URL:** https://norwicheventshub.com

## Notes

- Reconnecting GitHub requires OAuth authentication, which must be done through the dashboard
- The Cloudflare Pages API does not support programmatic GitHub reconnection
- Manual deployments will still work using `wrangler pages deploy` until reconnected
