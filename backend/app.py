from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from models import db

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Disable automatic trailing slash redirects
app.url_map.strict_slashes = False

# Enable CORS with proper configuration
CORS(app, resources={r"/api/*": {
    "origins": "http://localhost:5173",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})

# Initialize extensions
db.init_app(app)

# Register Blueprints
from routes.auth_routes import auth_routes
from routes.event_routes import event_routes
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(event_routes, url_prefix='/api/events')

# Import models after db.init_app
from models import User, Event, Registration, RegistrationField, RegistrationFieldResponse

# Create tables directly (no migrations)
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
