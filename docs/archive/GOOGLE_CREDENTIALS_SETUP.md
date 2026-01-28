# Google Service Account Setup Guide

This guide will help you create a Google Service Account and download the credentials needed for the AI Event Aggregator to write events to your Google Sheet.

## Why You Need This

The AI Event Aggregator needs permission to write events to your Google Sheet. A Service Account is like a robot user that can access your Google Sheet on behalf of your application.

---

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: https://console.cloud.google.com/
2. Sign in with your Google account (the same one that owns your Google Sheet)

### Step 2: Create a New Project (or use existing)

1. Click on the project dropdown at the top (says "Select a project")
2. Click **"NEW PROJECT"**
3. Enter project name: `Norwich Event Hub`
4. Click **"CREATE"**
5. Wait for the project to be created (about 10-30 seconds)

### Step 3: Enable Google Sheets API

1. Make sure your new project is selected (check top bar)
2. Click the hamburger menu (☰) → **"APIs & Services"** → **"Library"**
3. Search for: `Google Sheets API`
4. Click on **"Google Sheets API"**
5. Click **"ENABLE"**
6. Wait for it to enable (about 5-10 seconds)

### Step 4: Enable Google Drive API

1. While still in the API Library, search for: `Google Drive API`
2. Click on **"Google Drive API"**
3. Click **"ENABLE"**

### Step 5: Create Service Account

1. Click the hamburger menu (☰) → **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"Service Account"**
4. Fill in the details:
   - **Service account name:** `norwich-events-bot`
   - **Service account ID:** (auto-filled, leave it)
   - **Description:** `Bot account for Norwich Event Hub AI aggregator`
5. Click **"CREATE AND CONTINUE"**
6. For "Grant this service account access to project":
   - Click **"CONTINUE"** (skip this step)
7. For "Grant users access to this service account":
   - Click **"DONE"** (skip this step)

### Step 6: Create and Download Credentials

1. You'll see your new service account in the list
2. Click on the service account email (looks like: `norwich-events-bot@...`)
3. Go to the **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"CREATE"**
7. A JSON file will download automatically (keep it safe!)

### Step 7: Rename and Move the Credentials File

1. Find the downloaded file (probably in your Downloads folder)
2. It has a name like: `norwich-event-hub-123456-abcdef.json`
3. **Rename it to:** `google-credentials.json`
4. **Move it to:** `C:\Users\marc\Desktop\new company\automation\google-credentials.json`

### Step 8: Share Your Google Sheet with the Service Account

This is the most important step!

1. Open the downloaded JSON file with Notepad
2. Find the line that says `"client_email":`
3. Copy the email address (looks like: `norwich-events-bot@norwich-event-hub-123456.iam.gserviceaccount.com`)
4. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1wdh2VOlZ8gp0hwFpFV6cVpDDmaMxGs48eCDqoFFZTcU/edit
5. Click the **"Share"** button (top right)
6. Paste the service account email
7. Make sure the permission is set to **"Editor"**
8. **UNCHECK** "Notify people" (this is a bot, not a person)
9. Click **"Share"** or **"Send"**

---

## Verify Your Setup

You should now have:

- ✅ `google-credentials.json` file in the `automation/` folder
- ✅ Google Sheets API enabled
- ✅ Google Drive API enabled
- ✅ Service account email shared with your Google Sheet (as Editor)

---

## Update Your .env File

Now update your `.env` file:

```env
GOOGLE_SHEETS_CREDENTIALS=automation/google-credentials.json
```

Or if you placed it directly in the automation folder:

```env
GOOGLE_SHEETS_CREDENTIALS=google-credentials.json
```

---

## Security Note

**IMPORTANT:** Never commit `google-credentials.json` to Git or share it publicly!

This file is already listed in `.gitignore` to prevent accidental commits.

---

## Troubleshooting

### Error: "File not found: google-credentials.json"
- Make sure the file is in the correct location
- Check the path in your `.env` file matches where you saved it

### Error: "Permission denied" or "Spreadsheet not found"
- Make sure you shared the Google Sheet with the service account email
- The service account needs "Editor" permissions, not just "Viewer"

### Error: "API has not been used in project"
- Make sure you enabled both Google Sheets API and Google Drive API
- Wait a few minutes and try again (API activation can take time)

---

## Next Steps

Once you've completed this setup:

1. Get your Gemini API key (see GEMINI_SETUP.md)
2. Run the AI aggregator: `python automation/ai-event-aggregator.py`
3. Check your Google Sheet for newly discovered events!
