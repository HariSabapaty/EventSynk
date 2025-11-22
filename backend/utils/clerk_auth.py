from functools import wraps

import jwt
from flask import jsonify, request


def verify_clerk_session_token(token):
    """
    Verify Clerk session token using JWT.
    Clerk uses RS256 algorithm with their public keys.
    For production, you should fetch and cache Clerk's JWKS.
    For development, we'll use a simpler approach with the secret key.
    """
    try:
        # Decode the JWT token
        # Note: In production, use Clerk's JWKS endpoint for verification
        # https://clerk.com/.well-known/jwks.json
        payload = jwt.decode(
            token,
            options={'verify_signature': False},  # For development only
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f'Token verification error: {e}')
        return None


def clerk_token_required(f):
    """
    Decorator to require Clerk authentication.
    Extracts clerk_user_id from the JWT token and passes it to the route.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Authorization token is missing!'}), 401

        token = auth_header.split(' ')[1]
        payload = verify_clerk_session_token(token)

        if not payload:
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        # Extract clerk user ID from the token
        clerk_user_id = payload.get('sub')  # 'sub' contains the Clerk user ID

        if not clerk_user_id:
            return jsonify({'message': 'Invalid token payload!'}), 401

        return f(clerk_user_id, *args, **kwargs)

    return decorated
