from typing import List, Optional
from pydantic import BaseModel, EmailStr, UUID4, ConfigDict, Field
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
    id: UUID4
    room_type: str
    location: str
    occupancy_status: OccupancyStatus = OccupancyStatus.empty
    description: Optional[str] = None

class StorageRoomCreate(BaseModel):
    room_type: str
    location: str
    occupancy_status: OccupancyStatus = OccupancyStatus.empty
    description: Optional[str] = None

class StorageRoomDto(StorageRoomBase):
    id: UUID4

    # class Config:
    #     orm_mode = True

    model_config = ConfigDict(from_attributes=True)

class StoredItemCreate(BaseModel):
    name: str
    classification: str
    description: Optional[str] = None
    storageroom_id: UUID

class StoredItemUpdate(BaseModel):
    name: Optional[str] = None
    classification: Optional[str] = None
    description: Optional[str] = None
    storageroom_id: Optional[UUID] = None

class StoredItemDto(BaseModel):
    id: UUID
    name: str
    classification: str
    description: Optional[str] = None
    storageroom_id: UUID

    model_config = ConfigDict(from_attributes=True)

class StorageRoomUpdate(BaseModel):
    room_type: Optional[str] = None
    location: Optional[str] = None
    occupancy_status: Optional[OccupancyStatus] = None
    description: Optional[str] = None

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

    model_config = ConfigDict(from_attributes=True)

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: UUID

    class Config:
        orm_mode = True

class SecurityEventBase(BaseModel):
    event_type: SecurityEventType
    description: Optional[str] = None

class SecurityEventCreate(SecurityEventBase):
    stored_item_id: UUID4  # Mandatory for creation

class SecurityEventUpdate(BaseModel):
    event_type: Optional[SecurityEventType] = None
    description: Optional[str] = None
    stored_item_id: Optional[UUID4] = None

class SecurityEventDto(SecurityEventBase):
    id: UUID
    datetime: str  # ISO formatted datetime
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: UUID = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
