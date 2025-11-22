"""
Email Service Singleton
Handles all email sending operations using Flask-Mail.
"""
from flask_mail import Mail, Message
from config import Config


class EmailService:
    """
    Singleton Email Service for sending emails.
    """
    _instance = None
    _mail = None
    _app = None
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super(EmailService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize only once."""
        if not hasattr(self, '_initialized'):
            self._mail = Mail()
            self._initialized = True
    
    @classmethod
    def get_instance(cls):
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = EmailService()
        return cls._instance
    
    def init_app(self, app):
        """Initialize Flask-Mail with app."""
        self._app = app
        self._mail.init_app(app)
        
        # Check if email is configured
        config = Config.get_instance()
        if not config.MAIL_USERNAME or not config.MAIL_PASSWORD:
            print("⚠️  Email not configured - emails will be simulated (printed to console)")
            self._email_configured = False
        else:
            print("✅ Email service initialized successfully")
            self._email_configured = True
        
        return self._mail
    
    def send_email(self, recipient: str, subject: str, body: str, html: str = None) -> bool:
        """
        Send an email.
        
        Args:
            recipient: Email address of recipient
            subject: Email subject
            body: Plain text body
            html: Optional HTML body
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self._email_configured:
            # Simulate email sending
            print(f"\n📧 [SIMULATED EMAIL]")
            print(f"   To: {recipient}")
            print(f"   Subject: {subject}")
            print(f"   Body: {body[:100]}...")
            return True
        
        try:
            msg = Message(
                subject=subject,
                recipients=[recipient],
                body=body,
                html=html
            )
            
            with self._app.app_context():
                self._mail.send(msg)
            
            print(f"✅ Email sent to {recipient}: {subject}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {recipient}: {str(e)}")
            return False
    
    def send_bulk_email(self, recipients: list, subject: str, body_template: str, html_template: str = None) -> dict:
        """
        Send emails to multiple recipients.
        
        Args:
            recipients: List of tuples (email, name, custom_data)
            subject: Email subject
            body_template: Body template with {name} and other placeholders
            html_template: Optional HTML template
            
        Returns:
            Dictionary with success/failure counts
        """
        success = 0
        failed = 0
        
        for recipient_info in recipients:
            email = recipient_info[0]
            name = recipient_info[1] if len(recipient_info) > 1 else "User"
            
            # Replace placeholders
            body = body_template.replace('{name}', name)
            html = html_template.replace('{name}', name) if html_template else None
            
            if self.send_email(email, subject, body, html):
                success += 1
            else:
                failed += 1
        
        return {'success': success, 'failed': failed}
    
    @classmethod
    def reset_instance(cls):
        """Reset singleton (for testing)."""
        cls._instance = None
        cls._mail = None
        cls._app = None
