# ⚠️ SECURITY WARNING - API Keys

## 🔐 Your API Keys Are Configured

I've set up your API keys in `automation/.env` file. These keys provide access to:

- **OpenAI API** - For AI processing
- **Gemini API** - Alternative AI provider
- **Facebook API** - Social media integration
- **YouTube API** - Video platform access
- **Resend API** - Email sending
- **Database** - Your database password

## 🚨 CRITICAL: Keep These Private!

### ✅ Already Protected:
- ✅ `.env` file is gitignored (won't be committed to Git)
- ✅ `google-service-account.json` is gitignored
- ✅ Keys stored locally on your computer only

### ⚠️ NEVER Do This:
- ❌ Don't push `.env` to GitHub/GitLab
- ❌ Don't share API keys publicly
- ❌ Don't post keys in Discord/Slack
- ❌ Don't commit to public repositories
- ❌ Don't share this file with others

### 🔄 If Keys Are Compromised:

**If you accidentally expose your keys:**

1. **OpenAI**: https://platform.openai.com/api-keys → Revoke & create new
2. **Gemini**: https://makersuite.google.com/app/apikey → Delete & create new
3. **Facebook**: https://developers.facebook.com/ → Reset access token
4. **YouTube**: https://console.cloud.google.com/ → Regenerate key
5. **Resend**: https://resend.com/api-keys → Revoke & create new

### 📤 Deploying to Cloud:

When deploying to GitHub Actions, Cloudflare, etc:

1. **Use Secrets/Environment Variables** - NOT the .env file
2. **Never include .env in deployment**
3. **Set keys in platform settings:**
   - GitHub: Settings → Secrets → Actions
   - Cloudflare: Workers → Settings → Variables
   - Railway: Project → Variables
   - Heroku: Settings → Config Vars

### ✅ Safe Practices:

- Store `.env` file locally only
- Use environment variables in production
- Rotate keys every 3-6 months
- Monitor API usage for suspicious activity
- Set spending limits on paid APIs

---

## 🎯 Using Your Keys

The system will now use:
- **OpenAI** for AI event parsing (more reliable than Claude for your use case)
- **Facebook API** for Facebook events scraping
- **Gemini** as backup AI provider
- **Resend** for email notifications

---

## 💰 API Costs to Monitor

### OpenAI (Primary AI):
- **Model**: GPT-4o-mini or GPT-3.5-turbo
- **Cost**: ~$0.01-0.05 per week
- **Usage**: Event parsing and categorization
- **Set spending limit**: https://platform.openai.com/settings/organization/limits

### Gemini (Backup AI):
- **Free tier**: 60 requests/minute
- **Cost**: FREE for your usage
- **Usage**: Backup if OpenAI fails

### Facebook API:
- **Free tier**: Standard access
- **Cost**: FREE
- **Usage**: Public events scraping

### YouTube API:
- **Free tier**: 10,000 units/day
- **Cost**: FREE for your usage

### Resend Email:
- **Free tier**: 100 emails/day
- **Cost**: FREE for your usage

### Total Expected Cost: $5-10/year

---

## 🔒 This File Location:

Your keys are stored in:
- `C:\Users\marc\Desktop\new company\automation\.env`

**Keep this directory private and don't share with others!**

---

## ✅ You're Secure!

Your API keys are properly configured and protected. The system is ready to use them automatically.

Next: Follow `AI_AGGREGATOR_SETUP.md` to test the system!
