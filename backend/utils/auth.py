from datetime import datetime, timedelta
from functools import wraps

import bcrypt
import jwt
from flask import jsonify, request

from config import Config


# Hash a password using bcrypt
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# Check a password against a hash
def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


# Generate JWT token
def generate_token(user_id, email):
    payload = {'user_id': user_id, 'email': email, 'exp': datetime.utcnow() + timedelta(hours=4)}
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token


# Verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# Decorator to require token authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Token is missing!'}), 401
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        current_user_id = payload['user_id']
        return f(current_user_id, *args, **kwargs)

    return decorated
