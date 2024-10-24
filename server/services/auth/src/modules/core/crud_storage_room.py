from sqlalchemy.orm import Session

from server.services.auth.src.models import models

from .. import schemas
from typing import List
from uuid import UUID

def get_storageroom(db: Session, storageroom_id: UUID):
    return db.query(models.StorageRoom).filter(models.StorageRoom.id == storageroom_id).first()

def get_storagerooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.StorageRoom).offset(skip).limit(limit).all()

def create_storageroom(db: Session, storageroom: schemas.StorageRoomCreate):
    db_storageroom = models.StorageRoom(**storageroom.dict())
    db.add(db_storageroom)
    db.commit()
    db.refresh(db_storageroom)
    return db_storageroom

def update_storageroom(db: Session, storageroom_id: UUID, storageroom: schemas.StorageRoomCreate):
    db_storageroom = get_storageroom(db, storageroom_id)
    if not db_storageroom:
        return None
    for key, value in storageroom.dict().items():
        setattr(db_storageroom, key, value)
    db.commit()
    db.refresh(db_storageroom)
    return db_storageroom

def delete_storageroom(db: Session, storageroom_id: UUID):
    db_storageroom = get_storageroom(db, storageroom_id)
    if not db_storageroom:
        return None
    db.delete(db_storageroom)
    db.commit()
    return db_storageroom
