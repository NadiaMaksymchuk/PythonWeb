from http.client import HTTPException
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from src.models.users import models
from src.common.database import get_postgres
from src.modules.core import crud_storage_room, schemas
from src.modules.auth.service import AuthService
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(
    prefix="/storagerooms",
    tags=["Storage Rooms"]
)

@router.get("/")
async def read_storagerooms(db=Depends(get_postgres)):
    storagerooms = await crud_storage_room.get_storagerooms(db)
    return [schemas.StorageRoomDto.from_orm(storageroom) for storageroom in storagerooms]

@router.post("/")
async def create_storageroom(storageroom: schemas.StorageRoomCreate,  db=Depends(get_postgres), current_user: models.User = Depends(AuthService.get_current_active_user)):
    if current_user.is_admin == False:
        raise HTTPException(status_code=403, detail="Доступ заборонено")
    return await crud_storage_room.create_storageroom(db, storageroom)

@router.get("/{storageroom_id}")
async def read_storageroom(
    storageroom_id: str,
    db: AsyncSession = Depends(get_postgres)
):
    storageroom = await crud_storage_room.get_storageroom_by_id(db, storageroom_id)
    if not storageroom:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StorageRoom not found")
    return storageroom

@router.put("/{storageroom_id}", response_model=schemas.StorageRoomDto)
async def update_storageroom(
    storageroom_id: str,
    storageroom_update: schemas.StorageRoomUpdate,
    db: AsyncSession = Depends(get_postgres),
    current_user: models.User = Depends(AuthService.get_current_active_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    updated_storageroom = await crud_storage_room.update_storageroom(db, storageroom_id, storageroom_update)
    if not updated_storageroom:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StorageRoom not found")
    return schemas.StorageRoomDto.from_orm(updated_storageroom)

@router.delete("/{storageroom_id}", response_model=schemas.StorageRoomDto)
async def delete_storageroom(
    storageroom_id: str,
    db: AsyncSession = Depends(get_postgres),
    current_user: models.User = Depends(AuthService.get_current_active_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    deleted_storageroom = await crud_storage_room.delete_storageroom(db, storageroom_id)
    if not deleted_storageroom:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StorageRoom not found")
    return schemas.StorageRoomDto.from_orm(deleted_storageroom)

