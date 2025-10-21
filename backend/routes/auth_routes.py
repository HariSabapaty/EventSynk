from flask import Blueprint, request, jsonify, make_response
from models import db, User
from utils.auth import hash_password, check_password, generate_token, token_required
import re

auth_routes = Blueprint('auth_routes', __name__)

# Error handler
@auth_routes.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'message': str(error), 'status': 400}), 400)

@auth_routes.errorhandler(401)
def unauthorized(error):
    return make_response(jsonify({'message': str(error), 'status': 401}), 401)

@auth_routes.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'message': str(error), 'status': 404}), 404)

# Register route
@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Validate required fields
    if not name or not email or not password:
        return jsonify({'message': 'Name, email, and password are required.', 'status': 400}), 400

    # Email domain check
    if not email.endswith('@ssn.edu.in'):
        return jsonify({'message': 'Email must be a college email (@ssn.edu.in).', 'status': 400}), 400

    # Password length and strength check
    if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
        return jsonify({'message': 'Password must be at least 8 characters and contain letters and numbers.', 'status': 400}), 400

    # Email uniqueness check
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered.', 'status': 400}), 400

    # Hash password and create user
    hashed = hash_password(password)
    user = User(name=name, email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Registration successful.', 'status': 201}), 201

# Login route
@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required.', 'status': 400}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({'message': 'Invalid email or password.', 'status': 401}), 401

    token = generate_token(user.id, user.email)
    user_data = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'avatar_url': user.avatar_url
    }
    return jsonify({'token': token, 'user': user_data, 'status': 200}), 200

# Get current user profile
@auth_routes.route('/me', methods=['GET'])
@token_required
def get_me(current_user_id):
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found.'}), 404
    user_data = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'avatar_url': user.avatar_url,
        'created_at': user.created_at
    }
    return jsonify({'user': user_data}), 200
