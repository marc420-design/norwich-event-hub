# 🔧 Fix: No Email Code Being Sent

Your Access application is configured, but emails aren't being sent. Here's how to fix it:

---

## ✅ **Quick Fix - Enable One-Time PIN (1 Minute)**

### **Option 1: Via Cloudflare Dashboard (Recommended)**

1. **Go to:** https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/access/apps/4d905a76-3c60-43d4-b36a-ec9c9058b4c8

2. **Click:** "Configure" or "Edit" on your "Norwich events hub" application

3. **Scroll down to:** "Login methods"

4. **Make sure:** "One-time PIN" is **checked/enabled**

5. **If "Accept all available identity providers" is OFF:**
   - Turn it **ON**
   - Or manually check the "One-time PIN" checkbox

6. **Click:** "Save" or "Update application"

7. **Test again** in incognito window

---

### **Option 2: Check Global Settings**

If One-Time PIN isn't available:

1. **Go to:** https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/settings/authentication

2. **Under "Login methods"** check if "One-time PIN" exists

3. **If not present:**
   - Click "Add" or "Enable"
   - Enable "One-time PIN"
   - Save

4. **Go back to your application** and enable it there too

---

## 🎯 **What to Look For**

In the application settings, you should see:

```
Login methods
✅ One-time PIN (enabled)
```

Or:

```
Accept all available identity providers: ON
```

---

## 🧪 **Test After Fixing**

1. Open Incognito/Private window
2. Go to: https://norwicheventshub.com/admin
3. Enter your email: `marc@example.com` (or your real email)
4. **You should now receive an email** with a 6-digit code
5. Enter the code → Access granted! 🎉

---

## 📧 **Still No Email?**

Check these:

### 1. **Is the email address correct?**
If you need to update it, run:
```powershell
.\attach-policy.ps1 -ApiToken "4Bkp432a1Te8VUe36GkTOi41OSXirT7il7_LhyzN" -Email "your-correct-email@gmail.com"
```

### 2. **Check spam folder**
Cloudflare emails might go to spam. Look for:
- From: `noreply@cloudflareaccess.com`
- Subject: "Your verification code"

### 3. **Verify email domain works**
Some corporate email servers block automated emails. Try:
- Gmail
- Outlook
- Yahoo
- Personal email domain

### 4. **Check Cloudflare Access logs**
Go to: https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/logs/access-requests

This shows authentication attempts and any errors.

---

## ⚡ **Fastest Solution**

1. **Click this link:** https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/access/apps/4d905a76-3c60-43d4-b36a-ec9c9058b4c8

2. **Click "Configure"**

3. **Scroll to "Login methods"**

4. **Toggle "Accept all available identity providers" to ON**

5. **Click "Save"**

6. **Test again** → You should get the email! ✅

---

## 🔍 **Current Application Settings**

Your app is configured with:
- **Application ID:** `4d905a76-3c60-43d4-b36a-ec9c9058b4c8`
- **Domain:** `norwicheventshub.com/admin`
- **Policy:** admin only (allows marc@example.com)
- **Session:** 24 hours
- **Identity Providers:** ⚠️ **NONE CONFIGURED** (this is the issue!)

---

## 💡 **Why This Happened**

When we created the application via API, we didn't specify `allowed_idps`. Cloudflare requires you to explicitly enable login methods either:
- Via the dashboard UI
- Or by specifying identity provider IDs in the API call

The dashboard is the quickest fix!

---

**Go to the link above, enable One-time PIN, save, and test again! 🚀**
