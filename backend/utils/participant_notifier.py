"""
Observer Pattern for Event Participant Notifications
Notifies registered users when events are updated or cancelled.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from models import User, Registration
from utils.email_service import EmailService


class ParticipantObserver(ABC):
    """
    Abstract Observer for participant notifications.
    """
    
    @abstractmethod
    def notify_participants(self, event_type: str, event_data: Dict[str, Any], participants: List[User]) -> None:
        """
        Notify participants about event changes.
        
        Args:
            event_type: 'event_updated' or 'event_cancelled'
            event_data: Event details
            participants: List of User objects who registered for the event
        """
        pass


class EmailParticipantNotifier(ParticipantObserver):
    """
    Sends email notifications to registered participants.
    """
    
    def __init__(self):
        """Initialize with email service."""
        self.email_service = EmailService.get_instance()
    
    def notify_participants(self, event_type: str, event_data: Dict[str, Any], participants: List[User]) -> None:
        """Send email to all registered participants."""
        if event_type == "event_updated":
            self._notify_event_updated(event_data, participants)
        elif event_type == "event_cancelled":
            self._notify_event_cancelled(event_data, participants)
    
    def _notify_event_updated(self, data: Dict[str, Any], participants: List[User]) -> None:
        """Notify participants about event updates."""
        event_title = data.get('event_title')
        updated_fields = data.get('updated_fields', [])
        
        print(f"\n📧 EMAIL NOTIFICATION - Event Updated")
        print(f"   Event: {event_title}")
        print(f"   Changes: {', '.join(updated_fields)}")
        print(f"   Recipients: {len(participants)} registered participants")
        
        subject = f"⚠️ Event Update: {event_title}"
        
        for participant in participants:
            print(f"   → Sending to {participant.name} ({participant.email})")
            
            # Create personalized email
            body = f"""Dear {participant.name},

The event you registered for has been updated:

📅 Event: {event_title}
🔄 Updated Information: {', '.join(updated_fields)}

Please review the updated event details on the EventSynk platform.

If you have any questions, please contact the event organizer.

Best regards,
EventSynk Team"""

            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2563eb;">Event Update Notification</h2>
                    <p>Dear <strong>{participant.name}</strong>,</p>
                    <p>The event you registered for has been updated:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>📅 Event:</strong> {event_title}</p>
                        <p><strong>🔄 Updated:</strong> {', '.join(updated_fields)}</p>
                    </div>
                    <p>Please review the updated event details on the EventSynk platform.</p>
                    <p>If you have any questions, please contact the event organizer.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">Best regards,<br>EventSynk Team</p>
                </body>
            </html>
            """
            
            self.email_service.send_email(
                recipient=participant.email,
                subject=subject,
                body=body,
                html=html
            )
    
    def _notify_event_cancelled(self, data: Dict[str, Any], participants: List[User]) -> None:
        """Notify participants about event cancellation."""
        event_title = data.get('event_title')
        organiser_name = data.get('organiser_name', 'the organizer')
        
        print(f"\n📧 EMAIL NOTIFICATION - Event Cancelled")
        print(f"   Event: {event_title}")
        print(f"   Recipients: {len(participants)} registered participants")
        
        subject = f"🚫 Event Cancelled: {event_title}"
        
        for participant in participants:
            print(f"   → Sending to {participant.name} ({participant.email})")
            
            # Create personalized email
            body = f"""Dear {participant.name},

We regret to inform you that the following event has been cancelled:

📅 Event: {event_title}
👤 Organizer: {organiser_name}

We apologize for any inconvenience this may cause. 

Your registration has been automatically cancelled, and you will not be charged for this event.

Thank you for your understanding.

Best regards,
EventSynk Team"""

            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #dc2626;">Event Cancellation Notice</h2>
                    <p>Dear <strong>{participant.name}</strong>,</p>
                    <p>We regret to inform you that the following event has been cancelled:</p>
                    <div style="background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 5px; margin: 20px 0;">
                        <p><strong>📅 Event:</strong> {event_title}</p>
                        <p><strong>👤 Organizer:</strong> {organiser_name}</p>
                    </div>
                    <p>We apologize for any inconvenience this may cause.</p>
                    <p>Your registration has been automatically cancelled, and you will not be charged for this event.</p>
                    <p>Thank you for your understanding.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">Best regards,<br>EventSynk Team</p>
                </body>
            </html>
            """
            
            self.email_service.send_email(
                recipient=participant.email,
                subject=subject,
                body=body,
                html=html
            )


class EventNotificationManager:
    """
    Singleton manager for participant notifications.
    Acts as the Subject in Observer pattern.
    """
    _instance = None
    _observers: List[ParticipantObserver] = []
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super(EventNotificationManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize only once."""
        if not hasattr(self, '_initialized'):
            self._observers = []
            self._initialized = True
    
    @classmethod
    def get_instance(cls):
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = EventNotificationManager()
        return cls._instance
    
    def attach_observer(self, observer: ParticipantObserver) -> None:
        """Attach an observer."""
        if observer not in self._observers:
            self._observers.append(observer)
            print(f"✅ {observer.__class__.__name__} attached to notification manager")
    
    def detach_observer(self, observer: ParticipantObserver) -> None:
        """Detach an observer."""
        if observer in self._observers:
            self._observers.remove(observer)
    
    def notify_registered_users(self, event_type: str, event_data: Dict[str, Any], event_id: int) -> None:
        """
        Notify all registered participants about event changes.
        
        Args:
            event_type: 'event_updated' or 'event_cancelled'
            event_data: Event details
            event_id: ID of the event
        """
        # Get all participants registered for this event
        registrations = Registration.query.filter_by(event_id=event_id).all()
        
        if not registrations:
            print(f"ℹ️  No registered participants to notify for event #{event_id}")
            return
        
        # Get User objects for all participants
        participant_ids = [reg.user_id for reg in registrations]
        participants = User.query.filter(User.id.in_(participant_ids)).all()
        
        print(f"\n🔔 Notifying {len(participants)} registered participants about: {event_type}")
        
        # Notify all observers
        for observer in self._observers:
            try:
                observer.notify_participants(event_type, event_data, participants)
            except Exception as e:
                print(f"⚠️ Error in {observer.__class__.__name__}: {str(e)}")
    
    @classmethod
    def reset_instance(cls):
        """Reset singleton (for testing)."""
        cls._instance = None
        cls._observers = []
