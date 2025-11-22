# Observer Pattern - Participant Notifications

## Overview

This implementation uses the **Observer Pattern** to notify registered participants when:
- ✅ An event is **updated** (date, venue, or other details change)
- ✅ An event is **cancelled** (deleted by organizer)

## Architecture

```
EventNotificationManager (Subject/Observable)
    ↓ observes
EmailParticipantNotifier (Observer)
    ↓ notifies
Registered Participants Only
```

## How It Works

### 1. When Event is Updated

```python
# routes/event_routes.py - update_event()
notification_manager.notify_registered_users(
    event_type='event_updated',
    event_data={
        'event_title': 'Tech Workshop',
        'updated_fields': ['date', 'venue']
    },
    event_id=123
)
```

**What happens:**
1. Gets all users registered for event #123
2. Sends notification to each registered participant
3. Currently prints to console (ready for email implementation)

### 2. When Event is Cancelled

```python
# routes/event_routes.py - delete_event()
notification_manager.notify_registered_users(
    event_type='event_cancelled',
    event_data={
        'event_title': 'Tech Workshop'
    },
    event_id=123
)
```

**What happens:**
1. Notifies all registered participants before deletion
2. Participants receive cancellation notice

## Implementation Files

- **`utils/participant_notifier.py`** - Observer pattern implementation
  - `EventNotificationManager` - Subject (Singleton)
  - `ParticipantObserver` - Abstract observer
  - `EmailParticipantNotifier` - Concrete observer

- **`app.py`** - Initialization
- **`routes/event_routes.py`** - Usage in update & delete routes

## Key Features

✅ **Only notifies registered users** - Unregistered users don't get notified
✅ **Singleton pattern** - Single notification manager instance
✅ **Extensible** - Easy to add SMS, Push notifications
✅ **Decoupled** - Routes don't know about notification details
✅ **Error handling** - One failed notification doesn't break others

## Adding More Observers

```python
# utils/participant_notifier.py
class SMSParticipantNotifier(ParticipantObserver):
    def notify_participants(self, event_type, event_data, participants):
        for participant in participants:
            send_sms(participant.phone, f"Event {event_type}")

# app.py
notification_manager.attach_observer(SMSParticipantNotifier())
```

## Testing Output

When you update an event with 3 registered participants:

```
🔔 Notifying 3 registered participants about: event_updated

📧 EMAIL NOTIFICATION - Event Updated
   Event: Tech Workshop
   Changes: date, venue
   Recipients: 3 registered participants
   → John Doe (john@example.com)
   → Jane Smith (jane@example.com)
   → Bob Wilson (bob@example.com)
```

## Email Integration - IMPLEMENTED! ✅

Actual email sending is **now implemented** using Flask-Mail!

### Features:
- ✅ Real emails sent via SMTP
- ✅ Beautiful HTML templates
- ✅ Personalized for each participant
- ✅ Graceful fallback (simulates if not configured)
- ✅ Professional formatting

### Setup:
See `EMAIL_SETUP_GUIDE.md` for complete setup instructions.

Quick start:
```env
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

Without configuration, emails are simulated (printed to console).

## Benefits

1. **Automatic notifications** - No manual tracking needed
2. **Scalable** - Add more notification channels easily
3. **Maintainable** - Notification logic separated from route logic
4. **Testable** - Mock observers for testing
5. **Professional** - Participants stay informed automatically
