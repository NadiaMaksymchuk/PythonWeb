from http.client import HTTPException
from typing import List
from requests import Session
from sqlalchemy import UUID
from fastapi import APIRouter, Depends
from server.services.auth.src.models.users import models
from server.services.auth.src.common.database import get_postgres
from server.services.auth.src.modules.core import crud_storage_room
from src.modules.core import schemas

storageroom_router = APIRouter(
    prefix="/storagerooms",
    tags=["Storage Rooms"]
)

# Отримати всі камери
@storageroom_router.get("/", response_model=List[schemas.StorageRoom])
def read_storagerooms(skip: int = 0, limit: int = 100,  db=Depends(get_postgres)):
    storagerooms = crud_storage_room.get_storagerooms(db, skip=skip, limit=limit)
    return storagerooms

# Створити нову камеру
@storageroom_router.post("/", response_model=schemas.StorageRoom)
def create_storageroom(storageroom: schemas.StorageRoomCreate,  db=Depends(get_postgres), current_user: models.User = Depends(get_current_active_user)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ заборонено")
    return crud_storage_room.create_storageroom(db, storageroom)

# Отримати камеру за ID
@storageroom_router.get("/{storageroom_id}", response_model=schemas.StorageRoom)
def read_storageroom(storageroom_id: UUID,  db=Depends(get_postgres)):
    db_storageroom = crud_storage_room.get_storageroom(db, storageroom_id)
    if db_storageroom is None:
        raise HTTPException(status_code=404, detail="StorageRoom не знайдений")
    return db_storageroom

# Оновити камеру
@storageroom_router.put("/{storageroom_id}", response_model=schemas.StorageRoom)
def update_storageroom(storageroom_id: UUID, storageroom: schemas.StorageRoomCreate,  db=Depends(get_postgres), current_user: models.User = Depends(get_current_active_user)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ заборонено")
    db_storageroom = crud_storage_room.update_storageroom(db, storageroom_id, storageroom)
    if db_storageroom is None:
        raise HTTPException(status_code=404, detail="StorageRoom не знайдений")
    return db_storageroom

# Видалити камеру
@storageroom_router.delete("/{storageroom_id}", response_model=schemas.StorageRoom)
def delete_storageroom(storageroom_id: UUID, db=Depends(get_postgres), current_user: models.User = Depends(get_current_active_user)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Доступ заборонено")
    db_storageroom = crud_storage_room.delete_storageroom(db, storageroom_id)
    if db_storageroom is None:
        raise HTTPException(status_code=404, detail="StorageRoom не знайдений")
    return db_storageroom

