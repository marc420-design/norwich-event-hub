# Email Templates - Norwich Event Hub

## 1. Event Submission Confirmation

**Subject**: Event Submission Received - Norwich Event Hub

**From**: submit@norwicheventshub.com

**Template**:
```
Hi [Promoter Name],

Thank you for submitting your event to Norwich Event Hub!

Event Details:
- Event Name: [Event Name]
- Date: [Date]
- Time: [Time]
- Location: [Location]
- Category: [Category]

Your event has been received and is pending review. You will receive another email once your event has been approved and published.

Event ID: [Event ID]

If you have any questions or need to make changes, please contact us at submit@norwicheventshub.com

Best regards,
Norwich Event Hub Team
```

## 2. Event Approval Notification

**Subject**: Your Event Has Been Approved! - Norwich Event Hub

**From**: events@norwicheventshub.com

**Template**:
```
Hi [Promoter Name],

Great news! Your event "[Event Name]" has been approved and is now live on Norwich Event Hub!

View your event: https://norwicheventshub.com/directory.html?event=[Event ID]

Your event will appear in:
- The 2026 Directory
- What's On Today (on the event date)
- Featured events section
- Social media posts

Thank you for being part of the Norwich event community!

Best regards,
Norwich Event Hub Team
```

## 3. Event Rejection Notification

**Subject**: Event Submission Update - Norwich Event Hub

**From**: submit@norwicheventshub.com

**Template**:
```
Hi [Promoter Name],

Thank you for your submission. Unfortunately, we're unable to publish your event "[Event Name]" at this time.

Reason: [Reason for rejection]

If you believe this is an error or would like to discuss, please reply to this email or contact us at submit@norwicheventshub.com

We encourage you to submit other events in the future!

Best regards,
Norwich Event Hub Team
```

## 4. Weekly Newsletter

**Subject**: This Week in Norwich - [Date Range]

**From**: hello@norwicheventshub.com

**Template**:
```
Hi [Subscriber Name],

Here's what's happening in Norwich this week!

🎉 FEATURED EVENTS

[Event 1]
Date: [Date] | Time: [Time]
Location: [Location]
[Description]
[Ticket Link]

[Event 2]
...

📅 FULL SCHEDULE
View the complete 2026 directory: https://norwicheventshub.com/directory.html

🎫 SUBMIT YOUR EVENT
Have an event to share? Submit it here: https://norwicheventshub.com/submit.html

Follow us on social media for daily updates:
- Instagram: @norwicheventshub
- Facebook: /norwicheventshub
- Twitter: @norwicheventshub

See you around Norwich!

Best,
Norwich Event Hub Team
```

## 5. Event Reminder (24 hours before)

**Subject**: Reminder: [Event Name] Tomorrow!

**From**: events@norwicheventshub.com

**Template**:
```
Hi [Subscriber Name],

Just a friendly reminder that [Event Name] is happening tomorrow!

📅 Date: [Date]
⏰ Time: [Time]
📍 Location: [Location]

[Description]

[Ticket Link if applicable]

Don't miss out!

Best,
Norwich Event Hub Team
```

## 6. Welcome Email (New Subscriber)

**Subject**: Welcome to Norwich Event Hub!

**From**: hello@norwicheventshub.com

**Template**:
```
Hi [Name],

Welcome to Norwich Event Hub! 🎉

You're now subscribed to receive weekly updates about events happening in Norwich.

What to expect:
- Weekly event roundups every Monday
- Featured event highlights
- Reminders for events you might be interested in

Browse events: https://norwicheventshub.com/directory.html
Submit your event: https://norwicheventshub.com/submit.html

Follow us on social media for daily updates!

Best,
Norwich Event Hub Team
```

## Email Signature Template

```
---
Norwich Event Hub
Your independent guide to everything happening in Norwich

Website: https://norwicheventshub.com
Email: info@norwicheventshub.com
Submit Events: submit@norwicheventshub.com

Follow us:
Instagram | Facebook | Twitter | TikTok
```

## HTML Email Styling

Use inline CSS for email compatibility:

```html
<style>
    body {
        font-family: Inter, Arial, sans-serif;
        color: #000000;
        background-color: #F5F5F5;
    }
    .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #FFFFFF;
        padding: 20px;
    }
    .header {
        background-color: #000000;
        color: #3AB8FF;
        padding: 20px;
        text-align: center;
    }
    .content {
        padding: 20px;
    }
    .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #3AB8FF;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
    }
    .footer {
        background-color: #000000;
        color: #FFFFFF;
        padding: 20px;
        text-align: center;
        font-size: 12px;
    }
</style>
```

## Integration Notes

- Use Gmail SMTP "Send As" for sending emails
- Configure email routing in Cloudflare
- Set up email automation in Make.com/Zapier
- Use email service like SendGrid/Mailgun for bulk emails
- Test emails across different clients (Gmail, Outlook, etc.)

