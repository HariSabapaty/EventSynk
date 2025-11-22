from flask import Flask
from flask_cors import CORS
from config import Config
from utils.database_manager import DatabaseManager
from utils.image_upload_manager import ImageUploadManager
import os

# Initialize Flask app
app = Flask(__name__)

# Get Singleton Config instance
config = Config.get_instance()
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['IMGBB_API_KEY'] = config.IMGBB_API_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH

# Initialize ImageUploadManager singleton
image_manager = ImageUploadManager.get_instance()
image_manager.set_api_key(config.IMGBB_API_KEY)

# Disable automatic trailing slash redirects
app.url_map.strict_slashes = False

# Enable CORS
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"]
)

# Initialize Database using Singleton pattern
db = DatabaseManager.init_app(app)

# Register Blueprints
from routes.auth_routes import auth_routes
from routes.event_routes import event_routes
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(event_routes, url_prefix='/api/events')

# Import models after db initialization
from models import User, Event, Registration, RegistrationField, RegistrationFieldResponse

# Create tables using DatabaseManager singleton
DatabaseManager.create_all(app)

if __name__ == "__main__":
    app.run(debug=True)
