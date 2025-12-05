# Norwich Event Hub - Automation Setup Guide

This guide will help you set up the automation workflows for Norwich Event Hub.

## 1. Google Sheets Setup

### Step 1: Create Google Sheet
1. Create a new Google Sheet named "Norwich Event Hub"
2. Create a sheet tab named "Event Submissions"
3. Add the following columns (in order):
   - Timestamp
   - Event Name
   - Date
   - Time
   - Location
   - Category
   - Description
   - Ticket Link
   - Promoter Name
   - Promoter Email
   - Promoter Phone
   - Status
   - Event ID

### Step 2: Set Up Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy and paste the code from `automation/google-apps-script.js`
4. Save the script (Ctrl+S or Cmd+S)
5. Click **Deploy > New Deployment**
6. Select type: **Web app**
7. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
8. Click **Deploy**
9. Copy the **Web App URL**
10. Update `scripts/api.js` with your Web App URL:
    ```javascript
    SUBMISSION_URL: 'YOUR_WEB_APP_URL_HERE',
    EVENTS_URL: 'YOUR_WEB_APP_URL_HERE',
    ```

### Step 3: Test the Script
1. Open the Web App URL in a browser
2. You should see a JSON response (may show error if no data yet)
3. Test form submission from your website

## 2. Make.com Workflow Setup

### Step 1: Create Make.com Account
1. Sign up at [make.com](https://www.make.com)
2. Create a new scenario

### Step 2: Event Submission Workflow
1. Add **Webhooks > Custom webhook** as trigger
2. Copy the webhook URL
3. Update `scripts/submit.js` to POST to this webhook
4. Add **Google Sheets > Add a row** module
5. Connect to your Google Sheet
6. Map form fields to sheet columns
7. Add **Email > Send an email** module
8. Configure confirmation email template

### Step 3: Event Approval Workflow
1. Add **Google Sheets > Watch rows** trigger
2. Set filter: Status column = "Approved"
3. Add **Canva > Create a design** module
4. Create event post template in Canva
5. Add social media modules:
   - Instagram > Create media
   - Facebook > Create post
   - Twitter > Create tweet
6. Add **Email > Send an email** for approval notification

### Step 4: Daily Roundup Workflow
1. Add **Schedule > Schedule** trigger
2. Set to run daily at 9 AM
3. Add **Google Sheets > Get rows**
4. Filter events for today's date
5. Add **Canva > Create a design** for roundup graphic
6. Post to Instagram Story and Facebook

## 3. Canva Template Setup

### Create Templates
1. **Event Post Template** (1080x1080px for Instagram)
   - Event name (Montserrat Bold)
   - Date and time
   - Location
   - Category badge
   - Norwich Event Hub branding

2. **Daily Roundup Template** (1080x1920px for Stories)
   - "What's On Today" header
   - List of events
   - Brand colors

3. **Weekly Roundup Template** (1080x1080px)
   - "This Week in Norwich" header
   - Event grid
   - Brand styling

### Connect to Make.com
1. In Make.com, add Canva module
2. Authenticate with Canva API
3. Use template IDs in your workflows

## 4. Social Media API Setup

### Instagram
1. Create Facebook App (Instagram is part of Facebook)
2. Get Instagram Business Account ID
3. Generate access token
4. Add to Make.com Instagram module

### Facebook
1. Create Facebook App
2. Get Page Access Token
3. Add to Make.com Facebook module

### Twitter/X
1. Create Twitter Developer Account
2. Create app and get API keys
3. Add to Make.com Twitter module

## 5. Email Configuration

### Gmail SMTP (Already Configured per PRD)
- Domain: norwicheventshub.com
- SMTP: Gmail "Send As" configured
- Emails:
  - info@norwicheventshub.com
  - submit@norwicheventshub.com
  - events@norwicheventshub.com
  - press@norwicheventshub.com
  - hello@norwicheventshub.com

### Email Templates
Create templates for:
- Event submission confirmation
- Event approval notification
- Weekly newsletter
- Event reminder (24 hours before)

## 6. Testing Checklist

- [ ] Google Sheets receives form submissions
- [ ] Confirmation emails are sent
- [ ] Events can be retrieved via API
- [ ] Make.com workflows trigger correctly
- [ ] Social media posts are created
- [ ] Canva templates generate correctly
- [ ] Daily roundup runs automatically
- [ ] Weekly roundup sends newsletter

## 7. Monitoring

Set up monitoring for:
- Failed form submissions
- API errors
- Workflow failures
- Email delivery issues

## Support

For issues or questions:
- Email: info@norwicheventshub.com
- Check Make.com execution logs
- Review Google Apps Script execution logs
- Check browser console for frontend errors

