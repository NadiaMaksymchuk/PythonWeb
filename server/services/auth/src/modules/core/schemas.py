from typing import List, Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from enum import Enum
from datetime import datetime

# Enums
class UserRole(str, Enum):
    administrator = "administrator"
    security_guard = "security_guard"
    technician = "technician"

class ScheduleType(str, Enum):
    cleaning = "cleaning"
    maintenance = "maintenance"
    security = "security"

class SecurityEventType(str, Enum):
    intrusion = "intrusion"
    equipment_failure = "equipment_failure"
    anomaly = "anomaly"

class OccupancyStatus(str, Enum):
    empty = "empty"
    partially_filled = "partially_filled"
    full = "full"

# StorageRoom Schemas
class StorageRoomBase(BaseModel):
    room_type: str
    location: str
    occupancy_status: OccupancyStatus = OccupancyStatus.empty
    description: Optional[str] = None

class StorageRoomCreate(StorageRoomBase):
    pass

class StorageRoom(StorageRoomBase):
    id: UUID

    class Config:
        orm_mode = True

# StoredItem Schemas
class StoredItemBase(BaseModel):
    name: str
    classification: str
    description: Optional[str] = None
    storageroom_id: UUID

class StoredItemCreate(StoredItemBase):
    pass

class StoredItem(StoredItemBase):
    id: UUID

    class Config:
        orm_mode = True

# User Schemas
class UserBase(BaseModel):
    name: str
    role: UserRole
    contact_info: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID

    class Config:
        orm_mode = True

# Schedule Schemas
class ScheduleBase(BaseModel):
    schedule_type: ScheduleType
    datetime: datetime
    storageroom_id: UUID
    user_id: UUID

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: UUID

    class Config:
        orm_mode = True

# SecurityEvent Schemas
class SecurityEventBase(BaseModel):
    event_type: SecurityEventType
    description: Optional[str] = None
    datetime: datetime
    user_id: UUID

class SecurityEventCreate(SecurityEventBase):
    pass

class SecurityEvent(SecurityEventBase):
    id: UUID

    class Config:
        orm_mode = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[UserRole] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
