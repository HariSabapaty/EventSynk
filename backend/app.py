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

# Enable CORS with more permissive configuration for development
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True,
     expose_headers=["Content-Type", "Authorization"]
)

# Initialize extensions
db.init_app(app)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

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
