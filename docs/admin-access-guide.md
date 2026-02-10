# Admin Access Guide - Norwich Event Hub

## Overview

The Norwich Event Hub admin dashboard is protected by **HTTP Basic Authentication** using Cloudflare Pages Functions middleware. This provides a simple, secure way to restrict access to the admin panel.

## Accessing the Admin Dashboard

### URL
```
https://norwicheventshub.com/admin
```

### Default Credentials (Initial Setup)

> [!WARNING]
> These are the **fallback credentials** used when environment variables are not configured. You should change these immediately after first access.

- **Username:** `admin`
- **Password:** `NorwichEvents2026!`

### How to Log In

1. Open your browser and navigate to: `https://norwicheventshub.com/admin`
2. You will see a browser login prompt titled **"Norwich Event Hub Admin"**
3. Enter your username and password
4. Click **Sign In** or press Enter
5. You will be granted access to the admin dashboard

### How to Log Out

HTTP Basic Authentication credentials are cached by your browser for the session. To log out:

1. **Close all browser windows** (not just tabs)
2. Reopen your browser
3. Navigate to the admin page again - you will be prompted for credentials

**Alternative (Chrome/Edge):**
- Open Developer Tools (F12)
- Go to **Application** → **Storage** → **Clear site data**

## Changing Admin Credentials

### Step 1: Access Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Log in with your Cloudflare account
3. Navigate to: **Pages** → **norwich-event-hub-git**

### Step 2: Configure Environment Variables

1. Click **Settings** in the top navigation
2. Scroll down to **Environment Variables**
3. Click **Add variable** (or **Edit variables**)

### Step 3: Add Secure Credentials

Add two environment variables for **Production**:

**Variable 1:**
- **Variable name:** `ADMIN_USERNAME`
- **Value:** Your chosen username (e.g., `norwich_admin`)

**Variable 2:**
- **Variable name:** `ADMIN_PASSWORD`
- **Value:** Your strong password

> [!IMPORTANT]
> **Password Requirements:**
> - Minimum 16 characters
> - Include uppercase and lowercase letters
> - Include numbers
> - Include special characters (!@#$%^&*)
> - Avoid dictionary words

### Step 4: Deploy Changes

1. Click **Save** on the environment variables page
2. Go to **Deployments** tab
3. Click **Retry deployment** on the latest deployment
4. Wait 2-3 minutes for deployment to complete

### Step 5: Test New Credentials

1. Open an **Incognito/Private browser window**
2. Navigate to: `https://norwicheventshub.com/admin`
3. Enter your **new credentials**
4. Verify you can access the admin dashboard

## Troubleshooting

### Issue: Login Prompt Doesn't Appear

**Cause:** Middleware may not be deployed correctly.

**Solution:**
1. Check that `functions/_middleware.js` exists in your repository
2. Verify the file is not in `.gitignore`
3. Trigger a new deployment from GitHub

### Issue: Credentials Don't Work

**Cause:** Environment variables not configured or deployment not complete.

**Solution:**
1. Verify environment variables are set in Cloudflare Pages dashboard
2. Check variable names are exactly: `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Wait for deployment to complete (check **Deployments** tab)
4. Try in an Incognito window to avoid cached credentials

### Issue: Can't Log Out

**Cause:** Browser is caching credentials.

**Solution:**
1. Close **all** browser windows
2. Clear browser cache and site data
3. Restart browser

### Issue: Other Pages Ask for Password

**Cause:** Middleware is protecting too many routes.

**Solution:**
1. Check `functions/_middleware.js` - it should only protect routes starting with `/admin`
2. The condition should be: `if (url.pathname.startsWith('/admin'))`

## Security Best Practices

### 1. Use Strong Passwords
- Never use default passwords in production
- Use a password manager to generate and store credentials
- Change passwords regularly (every 90 days)

### 2. Limit Access
- Only share credentials with authorized personnel
- Use different credentials for different team members (requires multiple middleware rules)

### 3. Monitor Access
- Check Cloudflare Analytics for unusual admin page access patterns
- Review deployment logs regularly

### 4. HTTPS Only
- Admin authentication only works over HTTPS
- Never access admin panel over HTTP
- Cloudflare automatically enforces HTTPS

## Advanced: Cloudflare Access (Future)

For more advanced authentication features, consider upgrading to **Cloudflare Access**:

### Benefits
- Email-based authentication (no password to remember)
- Time-limited sessions
- Audit logs
- Support for SSO and identity providers
- Granular access policies

### Setup Scripts Available
- `setup-access-final.ps1` - Complete Cloudflare Access setup
- `setup-cloudflare-access.ps1` - Alternative setup script

### When to Upgrade
- Multiple admin users needed
- Audit trail required
- SSO integration needed
- Enhanced security compliance required

## Technical Details

### How It Works

The authentication is implemented using Cloudflare Pages Functions middleware:

**File:** `functions/_middleware.js`

**Flow:**
1. User requests `/admin` or `/admin.html`
2. Middleware intercepts the request
3. Checks for `Authorization` header with Basic Auth credentials
4. Compares credentials against environment variables (or defaults)
5. If valid: allows request to proceed
6. If invalid: returns 401 Unauthorized with login prompt

### Protected Routes
- `/admin`
- `/admin.html`
- `/admin/*` (any sub-path)

### Public Routes
All other routes are **not protected** and remain publicly accessible:
- `/` (homepage)
- `/submit.html` (event submission)
- `/directory.html` (event directory)
- All other pages

## Support

### Need Help?

1. Check this guide first
2. Review `functions/_middleware.js` for middleware logic
3. Check Cloudflare Pages deployment logs
4. Verify environment variables in Cloudflare dashboard

### Changing Authentication Method

If you need to change from Basic Auth to another method:
1. Modify or replace `functions/_middleware.js`
2. Update environment variables as needed
3. Redeploy via GitHub or Cloudflare dashboard

---

**Last Updated:** 2026-02-10  
**Authentication Method:** HTTP Basic Auth via Cloudflare Pages Functions  
**Security Level:** Medium (suitable for small teams)
