"""
Database Reset Script
This script will drop all existing tables and recreate them with the updated schema.
"""

from app import app, db
from models import User, Event, Registration, RegistrationField, RegistrationFieldResponse

def reset_database():
    with app.app_context():
        print("🗑️  Dropping all existing tables...")
        db.drop_all()
        print("✅ All tables dropped successfully!")
        
        print("\n📦 Creating new tables with updated schema...")
        db.create_all()
        print("✅ All tables created successfully!")
        
        print("\n🎉 Database reset complete!")
        print("\nNew Event table now includes:")
        print("  • mode (Online/Offline)")
        print("  • venue (for offline events)")
        print("  • participation_type (Individual/Team)")
        print("  • team_size (max team members)")
        print("  • eligibility (expanded to TEXT)")

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE RESET SCRIPT")
    print("=" * 60)
    print("\n⚠️  WARNING: This will delete ALL data in the database!")
    confirmation = input("\nType 'YES' to confirm: ")
    
    if confirmation == "YES":
        reset_database()
    else:
        print("\n❌ Database reset cancelled.")
