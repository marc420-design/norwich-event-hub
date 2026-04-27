# 🚀 Cloudflare Access Setup via CLI - Final Steps

You're almost done! Follow these 2 simple steps to complete the setup using the API.

---

## ✅ Step 1: Create Your API Token

1. **Go to:** https://dash.cloudflare.com/profile/api-tokens
2. **Click:** "Create Token"
3. **Use Template:** "Edit Cloudflare Zero Trust"
4. **Click:** "Continue to summary"
5. **Click:** "Create Token"
6. **Copy the token** (you'll need it in the next step)

---

## ✅ Step 2: Run the Setup Script

Open PowerShell in this folder and run:

```powershell
.\setup-access-final.ps1 -ApiToken "YOUR_TOKEN_HERE"
```

**Replace `YOUR_TOKEN_HERE` with the token you just copied.**

---

## 📋 What the Script Does

The script will automatically:

1. ✅ Create an Access application named "Norwich events hub"
2. ✅ Configure it to protect `norwicheventshub.com/admin`
3. ✅ Attach your existing "admin only" policy (with your email)
4. ✅ Set session duration to 24 hours

---

## 🧪 Test It Immediately

After the script completes:

1. **Open Incognito/Private window**
2. **Go to:** https://norwicheventshub.com/admin
3. **You should see:** Cloudflare Access login screen
4. **Enter your email**
5. **Check inbox** for the one-time code
6. **Enter code** → Admin dashboard unlocked! 🎉

---

## 🔧 Your Configuration

- **Account ID:** `8c701b8757253b51f9344c37d4ceef48`
- **Policy ID:** `10487340-b920-487e-9362-f4c2c75e4ef1` (admin only)
- **Domain:** `norwicheventshub.com`
- **Path:** `/admin`
- **Session:** 24 hours

---

## ⚡ Quick Command (Copy & Paste Ready)

```powershell
# Step 1: Get your API token from https://dash.cloudflare.com/profile/api-tokens

# Step 2: Run this (replace YOUR_TOKEN_HERE with your actual token)
.\setup-access-final.ps1 -ApiToken "YOUR_TOKEN_HERE"
```

---

## 🎯 Expected Output

You should see:

```
Cloudflare Access Setup - Norwich Event Hub
============================================

Using Account ID: 8c701b8757253b51f9344c37d4ceef48
Using Policy ID: 10487340-b920-487e-9362-f4c2c75e4ef1

Step 1: Creating Access Application...
SUCCESS: Application created!
Application ID: [your-app-id]

Step 2: Attaching 'admin only' policy...
SUCCESS: Policy attached!

============================================
SETUP COMPLETE!
============================================
```

---

## 🔗 Manage Your Access Application

After setup, manage it here:
https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/access/apps

---

## ❓ Troubleshooting

### "Invalid API token"
- Make sure you used the "Edit Cloudflare Zero Trust" template
- Check the token has Zero Trust permissions

### "Application already exists"
- Go to Cloudflare dashboard and delete the existing app first
- Or manually attach the policy in the dashboard

### "Policy not found"
- The policy ID is correct: `10487340-b920-487e-9362-f4c2c75e4ef1`
- Check it exists at: https://one.dash.cloudflare.com/8c701b8757253b51f9344c37d4ceef48/access/policies

---

## ✅ You're Done!

Once the script completes successfully, your admin dashboard is fully protected by Cloudflare Access. 

No more worrying about unauthorized access! 🔒
