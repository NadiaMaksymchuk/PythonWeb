import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects import postgresql

from src.common.database import Base

# class UserRole(enum.Enum):
#     administrator = "administrator"
#     security_guard = "security_guard"
#     technician = "technician"

class ScheduleType(enum.Enum):
    cleaning = "cleaning"
    maintenance = "maintenance"
    security = "security"

class SecurityEventType(enum.Enum):
    intrusion = "intrusion"
    equipment_failure = "equipment_failure"
    anomaly = "anomaly"

class OccupancyStatus(enum.Enum):
    empty = "empty"
    partially_filled = "partially_filled"
    full = "full"

class StorageRoom(Base):
    __tablename__ = "storagerooms"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    occupancy_status = Column(Enum(OccupancyStatus), nullable=False, default=OccupancyStatus.empty)
    description = Column(Text, nullable=True)

    stored_items = relationship("StoredItem", back_populates="storageroom")
    schedules = relationship("Schedule", back_populates="storageroom")

class StoredItem(Base):
    __tablename__ = "storeditems"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    classification = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    storageroom_id = Column(UUID(as_uuid=True), ForeignKey("storagerooms.id"))

    storageroom = relationship("StorageRoom", back_populates="stored_items")

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_type = Column(Enum(ScheduleType), nullable=False)
    datetime = Column(DateTime, default=datetime.utcnow)
    storageroom_id = Column(UUID(as_uuid=True), ForeignKey("storagerooms.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    storageroom = relationship("StorageRoom", back_populates="schedules")
    user = relationship("User", back_populates="schedules")

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    uuid = Column(postgresql.UUID(as_uuid=True), default=uuid4, unique=True, index=True)

    username = Column(String, unique=True)
    email = Column(String, unique=True, index=True)

    password = Column(String)

    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_enabled = Column(Boolean, default=True)

class SecurityEvent(Base):
    __tablename__ = "securityevents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(Enum(SecurityEventType), nullable=False)
    description = Column(Text, nullable=True)
    datetime = Column(DateTime, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    user = relationship("User", back_populates="security_events")