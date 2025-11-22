from flask import Blueprint, request, jsonify, make_response, current_app
from models import db, Event, User, Registration, RegistrationField, RegistrationFieldResponse
from utils.clerk_auth import clerk_token_required
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
from io import BytesIO
from config import Config
import os
import uuid
import requests
import base64

event_routes = Blueprint('event_routes', __name__)

def validate_image_file(file):
    """
    Validate uploaded file by checking MIME type and verifying actual image content.
    Returns (is_valid, error_message)
    """
    ALLOWED_MIMES = {'image/png', 'image/jpeg', 'image/jpg', 'image/gif'}
    
    # Check MIME type from the upload
    if file.mimetype not in ALLOWED_MIMES:
        return False, 'Invalid file type. Only PNG, JPG, JPEG, and GIF images are allowed.'
    
    # Verify the file is actually a valid image by trying to open it with Pillow
    try:
        file.stream.seek(0)  # Reset stream to beginning
        img = Image.open(file.stream)
        img.verify()  # Verify it's a valid image
        file.stream.seek(0)  # Reset stream again for later use
        return True, None
    except Exception as e:
        return False, 'Uploaded file is not a valid image or is corrupted.'

def upload_to_imgbb(file):
    """
    Upload validated image file to ImgBB cloud storage.
    Returns (success, url_or_error_message)
    """
    api_key = Config.IMGBB_API_KEY
    
    if not api_key or api_key == 'your_imgbb_api_key_here':
        return False, 'ImgBB API key not configured. Please add IMGBB_API_KEY to .env file'
    
    try:
        # Read file and encode to base64
        file.stream.seek(0)
        image_data = base64.b64encode(file.stream.read()).decode('utf-8')
        
        # Upload to ImgBB
        url = 'https://api.imgbb.com/1/upload'
        payload = {
            'key': api_key,
            'image': image_data,
        }
        
        response = requests.post(url, data=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                image_url = result['data']['url']  # Direct image URL
                return True, image_url
            else:
                return False, 'ImgBB upload failed: ' + str(result.get('error', {}).get('message', 'Unknown error'))
        else:
            return False, f'ImgBB API error: HTTP {response.status_code}'
            
    except requests.exceptions.Timeout:
        return False, 'Upload timeout - please try again'
    except Exception as e:
        return False, f'Upload failed: {str(e)}'

@event_routes.errorhandler(400)
def bad_request(error):
    return make_response(jsonify({'message': str(error), 'status': 400}), 400)

@event_routes.errorhandler(403)
def forbidden(error):
    return make_response(jsonify({'message': str(error), 'status': 403}), 403)

@event_routes.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'message': str(error), 'status': 404}), 404)

# List all events
@event_routes.route('/', methods=['GET'])
def list_events():
    events = Event.query.all()
    result = []
    for event in events:
        organiser = User.query.get(event.organiser_id)
        registration_count = Registration.query.filter_by(event_id=event.id).count()
        result.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'poster_url': event.poster_url,
            'date': event.date,
            'deadline': event.deadline,
            'prizes': event.prizes,
            'eligibility': event.eligibility,
            'category': event.category,
            'mode': event.mode,
            'venue': event.venue,
            'participation_type': event.participation_type,
            'team_size': event.team_size,
            'organiser_name': organiser.name if organiser else None,
            'organiser_id': event.organiser_id,
            'registration_count': registration_count
        })
    return jsonify({'events': result}), 200

# Create event
@event_routes.route('/', methods=['POST'])
@clerk_token_required
def create_event(clerk_user_id):
    # Get user from clerk_user_id
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.', 'status': 404}), 404
    
    # Handle file upload
    poster_url = None
    if 'poster' in request.files:
        file = request.files['poster']
        if file and file.filename:
            # Step 1: Validate file using MIME type and content verification
            is_valid, error_msg = validate_image_file(file)
            if not is_valid:
                return jsonify({'message': error_msg, 'status': 400}), 400
            
            # Step 2: Upload to ImgBB cloud storage
            upload_success, result = upload_to_imgbb(file)
            if not upload_success:
                return jsonify({'message': result, 'status': 500}), 500
            
            poster_url = result  # ImgBB returns direct image URL
    
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description')
    date = request.form.get('date')
    deadline = request.form.get('deadline')
    prizes = request.form.get('prizes')
    eligibility = request.form.get('eligibility')
    category = request.form.get('category')
    mode = request.form.get('mode')
    venue = request.form.get('venue')
    participation_type = request.form.get('participation_type')
    team_size = request.form.get('team_size')
    
    # Parse fields from JSON string
    import json
    fields = []
    if request.form.get('fields'):
        try:
            fields = json.loads(request.form.get('fields'))
        except:
            fields = []

    # Validate required fields
    if not title or not description or not date or not deadline or not category:
        return jsonify({'message': 'Missing required fields.', 'status': 400}), 400

    try:
        event_date = datetime.fromisoformat(date)
        deadline_date = datetime.fromisoformat(deadline)
    except Exception:
        return jsonify({'message': 'Invalid date format. Use ISO format.', 'status': 400}), 400

    now = datetime.utcnow()
    
    # Validate dates are in the future
    if event_date <= now:
        return jsonify({'message': 'Event date must be in the future.', 'status': 400}), 400
    
    if deadline_date <= now:
        return jsonify({'message': 'Registration deadline must be in the future.', 'status': 400}), 400
    
    # Validate deadline is before event date
    if deadline_date >= event_date:
        return jsonify({'message': 'Registration deadline must be before the event date.', 'status': 400}), 400

    # Validate mode and venue
    if mode == 'Offline' and not venue:
        return jsonify({'message': 'Venue is required for offline events.', 'status': 400}), 400

    # Validate team size
    if participation_type == 'Team' and team_size:
        try:
            team_size = int(team_size)
            if team_size < 2:
                return jsonify({'message': 'Team size must be at least 2.', 'status': 400}), 400
        except ValueError:
            return jsonify({'message': 'Invalid team size.', 'status': 400}), 400
    else:
        team_size = None

    event = Event(
        title=title,
        description=description,
        poster_url=poster_url,
        date=event_date,
        deadline=deadline_date,
        prizes=prizes,
        eligibility=eligibility,
        category=category,
        mode=mode,
        venue=venue,
        participation_type=participation_type,
        team_size=team_size,
        organiser_id=user.id
    )
    db.session.add(event)
    db.session.commit()

    # Save registration fields
    for field in fields:
        if not field.get('field_name') or not field.get('field_type'):
            continue
        field_obj = RegistrationField(
            event_id=event.id,
            field_name=field.get('field_name'),
            field_type=field.get('field_type'),
            is_required=field.get('is_required', False)
        )
        db.session.add(field_obj)
    db.session.commit()

    return jsonify({'message': 'Event created successfully.', 'event_id': event.id, 'status': 201}), 201

# Get event details
@event_routes.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    organiser = User.query.get(event.organiser_id)
    fields = RegistrationField.query.filter_by(event_id=event.id).all()
    field_defs = [{
        'id': f.id,
        'field_name': f.field_name,
        'field_type': f.field_type,
        'is_required': f.is_required
    } for f in fields]
    registration_count = Registration.query.filter_by(event_id=event.id).count()
    event_data = {
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'poster_url': event.poster_url,
        'date': event.date,
        'deadline': event.deadline,
        'prizes': event.prizes,
        'eligibility': event.eligibility,
        'category': event.category,
        'mode': event.mode,
        'venue': event.venue,
        'participation_type': event.participation_type,
        'team_size': event.team_size,
        'organiser': organiser.name if organiser else None,
        'organiser_email': organiser.email if organiser else None,
        'organiser_id': event.organiser_id,
        'registration_count': registration_count,
        'fields': field_defs
    }
    return jsonify({'event': event_data}), 200

# Update event
@event_routes.route('/<int:event_id>', methods=['PUT'])
@clerk_token_required
def update_event(clerk_user_id, event_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != user.id:
        return jsonify({'message': 'Forbidden: Only organiser can update.'}), 403
    data = request.get_json()
    # Update fields
    for key in ['title', 'description', 'poster_url', 'date', 'deadline', 'prizes', 'eligibility', 'category', 'mode', 'venue', 'participation_type', 'team_size']:
        if key in data:
            setattr(event, key, data[key])
    # Validate date and deadline if updated
    if 'date' in data or 'deadline' in data:
        try:
            event_date = datetime.fromisoformat(event.date) if isinstance(event.date, str) else event.date
            deadline_date = datetime.fromisoformat(event.deadline) if isinstance(event.deadline, str) else event.deadline
        except Exception:
            return jsonify({'message': 'Invalid date format.'}), 400
        now = datetime.utcnow()
        if event_date <= now:
            return jsonify({'message': 'Event date must be in the future.'}), 400
        if deadline_date <= now:
            return jsonify({'message': 'Registration deadline must be in the future.'}), 400
        if deadline_date >= event_date:
            return jsonify({'message': 'Registration deadline must be before the event date.'}), 400
    db.session.commit()
    return jsonify({'message': 'Event updated successfully.'}), 200

# Delete event
@event_routes.route('/<int:event_id>', methods=['DELETE'])
@clerk_token_required
def delete_event(clerk_user_id, event_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != user.id:
        return jsonify({'message': 'Forbidden: Only organiser can delete.'}), 403
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully.'}), 200

# Register for event
@event_routes.route('/<int:event_id>/register', methods=['POST'])
@clerk_token_required
def register_event(clerk_user_id, event_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.', 'status': 404}), 404
    # Prevent duplicate registration
    if Registration.query.filter_by(event_id=event_id, user_id=user.id).first():
        return jsonify({'message': 'Already registered for this event.', 'status': 400}), 400
    data = request.get_json()
    registration = Registration(event_id=event_id, user_id=user.id)
    db.session.add(registration)
    db.session.commit()
    # Store custom field responses
    responses = data.get('responses', [])
    for resp in responses:
        field_id = resp.get('field_id')
        response_value = resp.get('response_value')
        field = RegistrationField.query.filter_by(id=field_id, event_id=event_id).first()
        if not field or (field.is_required and not response_value):
            continue  # skip invalid or missing required field
        field_response = RegistrationFieldResponse(
            registration_id=registration.id,
            field_id=field_id,
            response_value=response_value
        )
        db.session.add(field_response)
    db.session.commit()
    return jsonify({'message': 'Registration successful.', 'status': 201}), 201

# Cancel registration
@event_routes.route('/<int:event_id>/register', methods=['DELETE'])
@clerk_token_required
def cancel_registration(clerk_user_id, event_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    registration = Registration.query.filter_by(event_id=event_id, user_id=user.id).first()
    if not registration:
        return jsonify({'message': 'Registration not found.'}), 404
    db.session.delete(registration)
    db.session.commit()
    return jsonify({'message': 'Registration cancelled.'}), 200

# Get participants (organiser only)
@event_routes.route('/<int:event_id>/participants', methods=['GET'])
@clerk_token_required
def get_participants(clerk_user_id, event_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != user.id:
        return jsonify({'message': 'Forbidden: Only organiser can view participants.'}), 403
    registrations = Registration.query.filter_by(event_id=event_id).all()
    participants = []
    for reg in registrations:
        participant_user = User.query.get(reg.user_id)
        responses = RegistrationFieldResponse.query.filter_by(registration_id=reg.id).all()
        custom_fields = [
            {
                'field_name': RegistrationField.query.get(r.field_id).field_name,
                'response_value': r.response_value
            } for r in responses
        ]
        participants.append({
            'name': participant_user.name,
            'email': participant_user.email,
            'fields': custom_fields
        })
    return jsonify({'participants': participants}), 200

# Get user's created events
@event_routes.route('/users/<int:user_id>/events', methods=['GET'])
@clerk_token_required
def get_user_events(clerk_user_id, user_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    if user.id != user_id:
        return jsonify({'message': 'Forbidden'}), 403
    events = Event.query.filter_by(organiser_id=user_id).all()
    result = [{
        'id': e.id,
        'title': e.title,
        'date': e.date,
        'registration_count': Registration.query.filter_by(event_id=e.id).count()
    } for e in events]
    return jsonify({'events': result}), 200

# Get user's registrations
@event_routes.route('/users/<int:user_id>/registrations', methods=['GET'])
@clerk_token_required
def get_user_registrations(clerk_user_id, user_id):
    user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
    if not user:
        return jsonify({'message': 'User not found. Please sync your account.'}), 404
    
    if user.id != user_id:
        return jsonify({'message': 'Forbidden'}), 403
    registrations = Registration.query.filter_by(user_id=user_id).all()
    result = []
    for reg in registrations:
        event = Event.query.get(reg.event_id)
        if event:
            result.append({
                'event_id': event.id,
                'event_title': event.title,
                'event_date': event.date
            })
    return jsonify({'registrations': result}), 200
