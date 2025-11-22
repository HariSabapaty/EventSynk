# Email Setup Guide for EventSynk

## Overview

EventSynk now sends **actual emails** to registered participants when:
- ✅ Events are **updated**
- ✅ Events are **cancelled**

## Quick Setup

### 1. Install Flask-Mail

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Email Settings

Add these to your `.env` file:

```env
# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=your_email@gmail.com
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account → Security
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password
4. Use this password in `MAIL_PASSWORD` (not your Gmail password!)

### Step 3: Update .env

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop  # 16-char app password
MAIL_DEFAULT_SENDER=youremail@gmail.com
```

## Other Email Providers

### Outlook/Hotmail
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=youremail@outlook.com
MAIL_PASSWORD=your_password
```

### Yahoo
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=youremail@yahoo.com
MAIL_PASSWORD=your_app_password
```

### Custom SMTP
```env
MAIL_SERVER=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
```

## Testing Email Service

### Test Without Configuration
If email is not configured, emails will be **simulated** (printed to console):

```
⚠️  Email not configured - emails will be simulated (printed to console)

📧 [SIMULATED EMAIL]
   To: user@example.com
   Subject: ⚠️ Event Update: Tech Workshop
   Body: Dear John, The event you registered for has been updated...
```

### Test With Configuration
Once configured, real emails will be sent:

```
✅ Email service initialized successfully
✅ Email sent to user@example.com: ⚠️ Event Update: Tech Workshop
```

## Email Templates

### Event Updated Email
```
Subject: ⚠️ Event Update: [Event Name]

Dear [User Name],

The event you registered for has been updated:

📅 Event: [Event Name]
🔄 Updated Information: [Changed Fields]

Please review the updated event details on the EventSynk platform.
```

### Event Cancelled Email
```
Subject: 🚫 Event Cancelled: [Event Name]

Dear [User Name],

We regret to inform you that the following event has been cancelled:

📅 Event: [Event Name]
👤 Organizer: [Organizer Name]

Your registration has been automatically cancelled.
```

## Features

✅ **HTML & Plain Text** - Beautiful HTML emails with plain text fallback
✅ **Personalized** - Each email addressed to the participant
✅ **Professional** - Styled with proper formatting
✅ **Graceful Degradation** - Works without email config (simulates)
✅ **Error Handling** - Failed emails logged, doesn't break app

## Architecture

```
EmailService (Singleton)
    ↓ used by
EmailParticipantNotifier (Observer)
    ↓ notifies
Registered Participants
```

## Troubleshooting

### "Username and Password not accepted"
- Use App Password, not regular password
- Enable 2FA first
- Check "Less secure app access" (not recommended)

### "Connection refused"
- Check MAIL_SERVER and MAIL_PORT
- Ensure firewall allows SMTP
- Try MAIL_USE_SSL=True with PORT=465

### Emails go to spam
- Configure SPF/DKIM for your domain
- Use verified email address
- Avoid spammy content

### No emails received
- Check spam/junk folder
- Verify recipient email is correct
- Check console for error messages

## Development vs Production

### Development (No Email Config)
```python
⚠️  Email not configured - emails will be simulated
```
Emails printed to console - perfect for testing!

### Production (With Email Config)
```python
✅ Email service initialized successfully
```
Real emails sent via SMTP.

## Security Best Practices

1. **Never commit .env** - Already in .gitignore
2. **Use App Passwords** - Not regular passwords
3. **Enable 2FA** - For Gmail accounts
4. **Rotate passwords** - Periodically change app passwords
5. **Use environment variables** - Not hardcoded credentials

## Example Usage

The system automatically sends emails when:

```python
# Update event → Emails sent to participants
PUT /api/events/123

# Delete event → Cancellation emails sent
DELETE /api/events/123
```

No manual intervention needed - Observer pattern handles everything!

## Advanced Configuration

### Custom Email Templates
Edit `utils/participant_notifier.py`:
```python
def _notify_event_updated(self, data, participants):
    # Customize subject
    subject = f"Custom: {event_title}"
    
    # Customize body
    body = f"Your custom message..."
```

### Disable Emails Temporarily
In `.env`:
```env
# Comment out to disable
# MAIL_USERNAME=your_email@gmail.com
# MAIL_PASSWORD=your_password
```

App will fall back to simulation mode.

## Cost

- **Gmail**: Free (500 emails/day)
- **SendGrid**: Free tier (100 emails/day)
- **AWS SES**: $0.10 per 1000 emails
- **Mailgun**: Free (5000 emails/month)

For production with high volume, consider dedicated email services!
