from flask import Blueprint, request, jsonify, make_response
from models import db, Event, User, Registration, RegistrationField, RegistrationFieldResponse
from utils.auth import token_required
from datetime import datetime

event_routes = Blueprint('event_routes', __name__)

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
            'date': event.date,
            'organiser_name': organiser.name if organiser else None,
            'registration_count': registration_count
        })
    return jsonify({'events': result}), 200

# Create event
@event_routes.route('/', methods=['POST'])
@token_required
def create_event(current_user_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    poster_url = data.get('poster_url')
    date = data.get('date')
    deadline = data.get('deadline')
    prizes = data.get('prizes')
    eligibility = data.get('eligibility')
    category = data.get('category')
    fields = data.get('fields', [])

    # Validate required fields
    if not title or not description or not date or not deadline:
        return jsonify({'message': 'Missing required fields.', 'status': 400}), 400

    try:
        event_date = datetime.fromisoformat(date)
        deadline_date = datetime.fromisoformat(deadline)
    except Exception:
        return jsonify({'message': 'Invalid date format. Use ISO format.', 'status': 400}), 400

    now = datetime.utcnow()
    if deadline_date > event_date or deadline_date < now:
        return jsonify({'message': 'Deadline must be before event date and not in the past.', 'status': 400}), 400

    event = Event(
        title=title,
        description=description,
        poster_url=poster_url,
        date=event_date,
        deadline=deadline_date,
        prizes=prizes,
        eligibility=eligibility,
        category=category,
        organiser_id=current_user_id
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
        'organiser': organiser.name if organiser else None,
        'registration_count': registration_count,
        'fields': field_defs
    }
    return jsonify({'event': event_data}), 200

# Update event
@event_routes.route('/<int:event_id>', methods=['PUT'])
@token_required
def update_event(current_user_id, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != current_user_id:
        return jsonify({'message': 'Forbidden: Only organiser can update.'}), 403
    data = request.get_json()
    # Update fields
    for key in ['title', 'description', 'poster_url', 'date', 'deadline', 'prizes', 'eligibility', 'category']:
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
        if deadline_date > event_date or deadline_date < now:
            return jsonify({'message': 'Deadline must be before event date and not in the past.'}), 400
    db.session.commit()
    return jsonify({'message': 'Event updated successfully.'}), 200

# Delete event
@event_routes.route('/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(current_user_id, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != current_user_id:
        return jsonify({'message': 'Forbidden: Only organiser can delete.'}), 403
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully.'}), 200

# Register for event
@event_routes.route('/<int:event_id>/register', methods=['POST'])
@token_required
def register_event(current_user_id, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.', 'status': 404}), 404
    # Prevent duplicate registration
    if Registration.query.filter_by(event_id=event_id, user_id=current_user_id).first():
        return jsonify({'message': 'Already registered for this event.', 'status': 400}), 400
    data = request.get_json()
    registration = Registration(event_id=event_id, user_id=current_user_id)
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
@token_required
def cancel_registration(current_user_id, event_id):
    registration = Registration.query.filter_by(event_id=event_id, user_id=current_user_id).first()
    if not registration:
        return jsonify({'message': 'Registration not found.'}), 404
    db.session.delete(registration)
    db.session.commit()
    return jsonify({'message': 'Registration cancelled.'}), 200

# Get participants (organiser only)
@event_routes.route('/<int:event_id>/participants', methods=['GET'])
@token_required
def get_participants(current_user_id, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'message': 'Event not found.'}), 404
    if event.organiser_id != current_user_id:
        return jsonify({'message': 'Forbidden: Only organiser can view participants.'}), 403
    registrations = Registration.query.filter_by(event_id=event_id).all()
    participants = []
    for reg in registrations:
        user = User.query.get(reg.user_id)
        responses = RegistrationFieldResponse.query.filter_by(registration_id=reg.id).all()
        custom_fields = [
            {
                'field_name': RegistrationField.query.get(r.field_id).field_name,
                'response_value': r.response_value
            } for r in responses
        ]
        participants.append({
            'name': user.name,
            'email': user.email,
            'fields': custom_fields
        })
    return jsonify({'participants': participants}), 200

# Get user's created events
@event_routes.route('/users/<int:user_id>/events', methods=['GET'])
@token_required
def get_user_events(current_user_id, user_id):
    if current_user_id != user_id:
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
@token_required
def get_user_registrations(current_user_id, user_id):
    if current_user_id != user_id:
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
