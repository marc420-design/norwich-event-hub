# Make.com Automation Setup Guide

Complete guide to setting up automation workflows for Norwich Event Hub.

## Prerequisites

- [ ] Google Sheet with event data (see GOOGLE_SHEET_SETUP.md)
- [ ] Make.com account (free tier works for testing)
- [ ] Canva Pro account (for template access)
- [ ] Social media business accounts
- [ ] Email access (norwicheventshub.com emails)

## Workflow 1: Event Submission Processing

### Purpose
Automatically process form submissions and add them to Google Sheets

### Setup Steps

1. **Create New Scenario** in Make.com
   - Click "Create a new scenario"
   - Name it: "Norwich Events - Form Submission"

2. **Add Webhook Module** (Trigger)
   - Search for "Webhooks"
   - Select "Custom webhook"
   - Click "Add"
   - Create a new webhook named "Event Submissions"
   - **Copy the webhook URL** - you'll need this

3. **Update Website Form**
   - Open `scripts/submit.js`
   - Add the webhook URL as a secondary endpoint
   - Or replace the Google Apps Script with this webhook

4. **Add Google Sheets Module**
   - Click "Add module"
   - Search "Google Sheets"
   - Select "Add a row"
   - Connect your Google account
   - Select your Norwich Event Hub spreadsheet
   - Select the "Event Submissions" sheet
   - Map fields:
     - A (Timestamp): `{{now}}`
     - B (Event Name): `{{name}}`
     - C (Date): `{{date}}`
     - D (Time): `{{time}}`
     - E (Location): `{{location}}`
     - F (Category): `{{category}}`
     - G (Description): `{{description}}`
     - H (Ticket Link): `{{ticketLink}}`
     - I (Promoter Name): `{{promoterName}}`
     - J (Promoter Email): `{{promoterEmail}}`
     - K (Promoter Phone): `{{promoterPhone}}`
     - L (Status): `Pending`
     - M (Event ID): `{{NEH-{{timestamp}}-{{random}}}}`

5. **Add Email Module**
   - Click "Add module"
   - Search "Email"
   - Select "Send an email"
   - Configure:
     - To: `{{promoterEmail}}`
     - From: `submit@norwicheventshub.com`
     - Subject: `Event Submission Received - Norwich Event Hub`
     - Content: Use template from `emails/templates.md`

6. **Test the Workflow**
   - Submit a test event from your website
   - Check Make.com execution log
   - Verify event appears in Google Sheet
   - Check email was received

7. **Activate Scenario**
   - Click "On/Off" toggle
   - Set to "On"

## Workflow 2: Event Approval & Social Media Posting

### Purpose
When an event is approved, automatically create social posts

### Setup Steps

1. **Create New Scenario**
   - Name it: "Norwich Events - Auto Posting"

2. **Add Google Sheets Watch Module** (Trigger)
   - Select "Watch Rows"
   - Connect to your spreadsheet
   - Sheet: "Event Submissions"
   - Trigger column: Status (Column L)
   - Trigger value: "Approved"
   - Schedule: Every 15 minutes

3. **Add Router Module** (Optional)
   - Allows you to post to multiple platforms simultaneously
   - Click "Add module" → "Flow control" → "Router"

4. **Route 1: Instagram Post**
   - Add "Instagram" module
   - Select "Create a Media (Photo)"
   - Connect your Instagram Business Account
   - Configure:
     - Image URL: Use Canva module output (see next step)
     - Caption:
       ```
       {{Event Name}} 📅

       📅 {{Date}} at {{Time}}
       📍 {{Location}}

       {{Description}}

       {{#if ticketLink}}🎟️ Tickets: {{ticketLink}}{{/if}}

       #NorwichEvents #Norwich #WhatsOnNorwich #{{Category}}
       ```

5. **Route 2: Facebook Post**
   - Add "Facebook" module
   - Select "Create a Post"
   - Select your Norwich Event Hub page
   - Use similar caption format

6. **Route 3: Twitter/X Post**
   - Add "X (Twitter)" module
   - Select "Create a Tweet"
   - Caption (under 280 chars):
     ```
     🎉 {{Event Name}}
     📅 {{Date}} | {{Time}}
     📍 {{Location}}
     {{#if ticketLink}}🎟️ {{ticketLink}}{{/if}}
     #NorwichEvents
     ```

7. **Add Canva Module** (Optional - for custom graphics)
   - Insert before social media modules
   - Select "Create a design from template"
   - Choose your event template
   - Map fields dynamically

8. **Add Email Notification**
   - Send approval email to promoter
   - Template from `emails/templates.md`

9. **Test & Activate**
   - Manually change an event to "Approved" in Google Sheet
   - Watch the scenario run
   - Verify posts appear on all platforms

## Workflow 3: Daily Event Roundup

### Purpose
Post daily "What's On Today" content

### Setup Steps

1. **Create New Scenario**
   - Name it: "Norwich Events - Daily Roundup"

2. **Add Schedule Module** (Trigger)
   - Select "Schedule"
   - Set to run: Daily at 9:00 AM
   - Timezone: Europe/London

3. **Add Google Sheets Search Module**
   - Select "Search Rows"
   - Spreadsheet: Norwich Event Hub
   - Sheet: Event Submissions
   - Filter:
     - Date = Today's date
     - Status = Approved
   - Max results: 10

4. **Add Aggregator Module**
   - "Tools" → "Text aggregator"
   - Combine all event names into a list

5. **Add Canva Module**
   - Create design from "Daily Roundup" template
   - Insert aggregated event list

6. **Post to Instagram Story**
   - Module: Instagram → Create a Story
   - Upload Canva output image

7. **Post to Facebook**
   - Standard post with image and caption

## Workflow 4: Weekly Newsletter

### Purpose
Send weekly event digest on Monday mornings

### Setup Steps

1. **Create New Scenario**
   - Name it: "Norwich Events - Weekly Newsletter"

2. **Add Schedule Trigger**
   - Every Monday at 10:00 AM

3. **Get This Week's Events**
   - Google Sheets → Search Rows
   - Filter: Date between Monday and Sunday
   - Status: Approved

4. **Format Email**
   - HTML email with event cards
   - Use `emails/templates.md` as base

5. **Send to Subscriber List**
   - Use email module or integrate Mailchimp
   - Track opens and clicks

## API Connections Required

### 1. Google Sheets
- Authorize in Make.com
- Permissions: Read & Write

### 2. Instagram Business Account
- Link via Facebook Business Suite
- Get access token
- Requires Facebook Page + Instagram Business account

### 3. Facebook Page
- Create Facebook App (optional)
- Or use direct page access

### 4. Twitter/X
- Create Developer Account
- Create App at developer.twitter.com
- Get API keys:
  - API Key
  - API Secret
  - Bearer Token
  - Access Token
  - Access Token Secret

### 5. Canva
- Canva Pro account required
- Connect in Make.com
- Create templates first in Canva

### 6. Email (Gmail/SMTP)
- Use Gmail with App Password
- Or Cloudflare Email Routing + Gmail SMTP

## Canva Template Setup

### Event Post Template (1080x1080px)

1. Create new design in Canva
2. Set dimensions: 1080 x 1080px (Instagram square)
3. Design elements:
   - Background: Electric Blue (#3AB8FF) or Black
   - Text fields (make editable):
     - Event Name (Montserrat Bold, 48px)
     - Date & Time (Bebas Neue, 36px)
     - Location (Inter, 24px)
     - Category badge
   - Norwich Event Hub logo
   - Save as template

4. **Share template**
   - Click "Share"
   - "More" → "Template link"
   - Copy template ID from URL

### Daily Roundup Template (1080x1920px)

1. Instagram Story dimensions
2. Design:
   - Header: "WHAT'S ON TODAY"
   - List area (dynamic text)
   - Footer with logo and social handles

### Weekly Roundup (1080x1350px)

1. Instagram feed dimensions
2. Grid layout for multiple events
3. "THIS WEEK IN NORWICH" header

## Testing Checklist

- [ ] Form submission creates Google Sheet row
- [ ] Confirmation email sends to promoter
- [ ] Approval triggers social media posts
- [ ] Posts appear on Instagram
- [ ] Posts appear on Facebook
- [ ] Tweets appear on X/Twitter
- [ ] Daily roundup runs at 9 AM
- [ ] Weekly newsletter sends Monday 10 AM
- [ ] Canva templates generate correctly
- [ ] Email notifications work

## Monitoring & Maintenance

### Check Weekly:
- Make.com scenario execution history
- Failed scenarios and errors
- API rate limits
- Social media post performance

### Monthly:
- Review and update templates
- Check API connections still active
- Update automation logic if needed

## Costs Estimate

- **Make.com**: Free tier (1,000 operations/month) or Pro ($9/month)
- **Canva**: Pro required ($12.99/month or $119.99/year)
- **Social Media APIs**: Free (Twitter has rate limits)
- **Total**: ~$22-25/month

## Troubleshooting

### Webhook not receiving data
- Check webhook URL is correct in form
- Verify CORS settings
- Test with Postman or curl

### Google Sheets not updating
- Check permissions in Google account
- Verify sheet and column names
- Check for special characters

### Social posts failing
- Verify API tokens are valid
- Check image format/size requirements
- Review rate limits

### Canva integration issues
- Ensure Canva Pro subscription active
- Check template is shared correctly
- Verify API connection in Make.com

## Support Resources

- Make.com Academy: https://www.make.com/en/academy
- Make.com Community: https://community.make.com/
- Instagram Graph API docs: https://developers.facebook.com/docs/instagram-api/
- Twitter API docs: https://developer.twitter.com/en/docs
- Canva API docs: https://www.canva.dev/
