import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """
    Singleton Configuration Class
    Ensures only one instance of configuration exists throughout the application.
    """
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Override __new__ to implement Singleton pattern."""
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize configuration only once."""
        if not Config._initialized:
            self.MYSQL_HOST = os.getenv('MYSQL_HOST')
            self.MYSQL_USER = os.getenv('MYSQL_USER')
            self.MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
            self.MYSQL_DB = os.getenv('MYSQL_DB')
            self.SECRET_KEY = os.getenv('SECRET_KEY')
            self.IMGBB_API_KEY = os.getenv('IMGBB_API_KEY')
            self.SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}/{self.MYSQL_DB}"
            self.SQLALCHEMY_TRACK_MODIFICATIONS = False
            self.MAX_CONTENT_LENGTH = 1 * 1024 * 1024  # 1MB max file size for uploads
            
            # Email Configuration
            self.MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
            self.MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
            self.MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
            self.MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
            self.MAIL_USERNAME = os.getenv('MAIL_USERNAME')
            self.MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
            self.MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', self.MAIL_USERNAME)
            
            Config._initialized = True
    
    @classmethod
    def get_instance(cls):
        """Get the singleton instance of Config."""
        if cls._instance is None:
            cls._instance = Config()
        return cls._instance
    
    @classmethod
    def reset_instance(cls):
        """Reset singleton instance (useful for testing)."""
        cls._instance = None
        cls._initialized = False
