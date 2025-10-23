from flask import Blueprint, request, jsonify, make_response
from models import db, User
from utils.clerk_auth import clerk_token_required
from datetime import datetime

auth_routes = Blueprint('auth_routes', __name__)

# Error handlers
@auth_routes.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'message': str(error), 'status': 400}), 400)

@auth_routes.errorhandler(401)
def unauthorized(error):
    return make_response(jsonify({'message': str(error), 'status': 401}), 401)

@auth_routes.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'message': str(error), 'status': 404}), 404)

# Sync/Create user from Clerk
@auth_routes.route('/sync-user', methods=['POST'])
def sync_user():
    """
    Called by frontend after successful Clerk login.
    Creates or updates user in the database.
    """
    data = request.get_json()
    clerk_user_id = data.get('clerk_user_id')
    email = data.get('email')
    name = data.get('name')
    avatar_url = data.get('avatar_url')
    
    if not clerk_user_id or not email:
        return jsonify({'message': 'Missing required fields: clerk_user_id and email'}), 400
    
    # Check if user exists by clerk_user_id
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    
    if user:
        # Update existing user
        user.name = name or user.name
        user.email = email
        user.avatar_url = avatar_url
        user.last_login = datetime.utcnow()
    else:
        # Create new user
        user = User(
            clerk_user_id=clerk_user_id,
            name=name or 'User',
            email=email,
            avatar_url=avatar_url
        )
        db.session.add(user)
    
    db.session.commit()
    
    user_data = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'avatar_url': user.avatar_url,
        'clerk_user_id': user.clerk_user_id,
        'created_at': user.created_at.isoformat() if user.created_at else None
    }
    
    return jsonify({'user': user_data, 'status': 200}), 200

# Get current user profile (protected route)
@auth_routes.route('/me', methods=['GET'])
@clerk_token_required
def get_me(clerk_user_id):
    """
    Get current user profile using Clerk user ID from JWT token.
    """
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    user_data = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'avatar_url': user.avatar_url,
        'clerk_user_id': user.clerk_user_id,
        'created_at': user.created_at.isoformat() if user.created_at else None
    }
    
    return jsonify({'user': user_data}), 200

