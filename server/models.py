from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    users = db.relationship('User', backref='role', lazy=True)

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    contact_info = db.Column(db.String(255))

    schedules = db.relationship('Schedule', backref='user', lazy=True)
    security_events = db.relationship('SecurityEvent', backref='recorded_by_user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class StorageRoom(db.Model):
    __tablename__ = 'storage_rooms'
    id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String(100))
    location = db.Column(db.String(255))
    occupancy_status = db.Column(db.String(50))
    description = db.Column(db.Text)

    stored_items = db.relationship('StoredItem', backref='storage_room', lazy=True)
    schedules = db.relationship('Schedule', backref='storage_room', lazy=True)

class StoredItem(db.Model):
    __tablename__ = 'stored_items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    classification = db.Column(db.String(50))
    description = db.Column(db.Text)
    storage_room_id = db.Column(db.Integer, db.ForeignKey('storage_rooms.id'), nullable=False)

class Schedule(db.Model):
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    schedule_type = db.Column(db.String(50))
    scheduled_at = db.Column(db.DateTime)
    storage_room_id = db.Column(db.Integer, db.ForeignKey('storage_rooms.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

class SecurityEvent(db.Model):
    __tablename__ = 'security_events'
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(100))
    description = db.Column(db.Text)
    event_at = db.Column(db.DateTime)
    recorded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)