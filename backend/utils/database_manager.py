"""
Database Manager Singleton
Ensures single database connection instance throughout the application.
"""
from flask_sqlalchemy import SQLAlchemy


class DatabaseManager:
    """
    Singleton Database Manager
    Manages database connections and ensures only one DB instance exists.
    """

    _instance = None
    _db = None

    def __new__(cls):
        """Override __new__ to implement Singleton pattern."""
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize database only once."""
        if DatabaseManager._db is None:
            DatabaseManager._db = SQLAlchemy()

    @classmethod
    def get_db(cls):
        """Get the singleton database instance."""
        if cls._instance is None:
            cls._instance = DatabaseManager()
        return cls._db

    @classmethod
    def init_app(cls, app):
        """Initialize database with Flask app."""
        db = cls.get_db()
        db.init_app(app)
        return db

    @classmethod
    def create_all(cls, app):
        """Create all database tables."""
        db = cls.get_db()
        with app.app_context():
            db.create_all()

    @classmethod
    def reset_instance(cls):
        """Reset singleton instance (useful for testing)."""
        cls._instance = None
        cls._db = None
