from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    clerk_user_id = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    events = db.relationship('Event', backref='organiser', lazy=True, cascade="all, delete-orphan")
    registrations = db.relationship('Registration', backref='user', lazy=True, cascade="all, delete-orphan")

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    poster_url = db.Column(db.String(255), nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    prizes = db.Column(db.String(255), nullable=True)
    eligibility = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    organiser_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registrations = db.relationship('Registration', backref='event', lazy=True, cascade="all, delete-orphan")
    registration_fields = db.relationship('RegistrationField', backref='event', lazy=True, cascade="all, delete-orphan")

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    field_responses = db.relationship('RegistrationFieldResponse', backref='registration', lazy=True, cascade="all, delete-orphan")

class RegistrationField(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    field_name = db.Column(db.String(100), nullable=False)
    field_type = db.Column(db.String(50), nullable=False)
    is_required = db.Column(db.Boolean, default=False)

    field_responses = db.relationship('RegistrationFieldResponse', backref='field', lazy=True, cascade="all, delete-orphan")

class RegistrationFieldResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    registration_id = db.Column(db.Integer, db.ForeignKey('registration.id'), nullable=False)
    field_id = db.Column(db.Integer, db.ForeignKey('registration_field.id'), nullable=False)
    response_value = db.Column(db.Text, nullable=False)
