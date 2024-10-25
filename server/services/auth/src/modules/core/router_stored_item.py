from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.core.schemas import StoredItemCreate, StoredItemDto, StoredItemUpdate
from src.models.users import models
from src.modules.core import crud_stored_item
from src.common.database import get_postgres
from src.modules.auth.service import AuthService
router = APIRouter(
    prefix="/storeditems",
    tags=["Stored Items"],
)

@router.get("/", response_model=List[StoredItemDto])
async def read_storeditems(db: AsyncSession = Depends(get_postgres)):
    storeditems = await crud_stored_item.get_storeditems(db)
    return [StoredItemDto.from_orm(item) for item in storeditems]

@router.post("/", response_model=StoredItemDto)
async def create_storeditem(
    storeditem: StoredItemCreate,
    db: AsyncSession = Depends(get_postgres),
    current_user: models.User = Depends(AuthService.get_current_active_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    created_storeditem = await crud_stored_item.create_storeditem(db, storeditem)
    return StoredItemDto.from_orm(created_storeditem)

@router.get("/{storeditem_id}", response_model=StoredItemDto)
async def read_storeditem(
    storeditem_id: UUID,
    db: AsyncSession = Depends(get_postgres)
):
    storeditem = await crud_stored_item.get_storeditem_by_id(db, storeditem_id)
    if not storeditem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StoredItem not found")
    return StoredItemDto.from_orm(storeditem)

@router.put("/{storeditem_id}", response_model=StoredItemDto)
async def update_storeditem(
    storeditem_id: UUID,
    storeditem_update: StoredItemUpdate,
    db: AsyncSession = Depends(get_postgres),
    current_user: models.User = Depends(AuthService.get_current_active_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    updated_storeditem = await crud_stored_item.update_storeditem(db, storeditem_id, storeditem_update)
    if not updated_storeditem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StoredItem not found")
    return StoredItemDto.from_orm(updated_storeditem)

@router.delete("/{storeditem_id}", response_model=StoredItemDto)
async def delete_storeditem(
    storeditem_id: UUID,
    db: AsyncSession = Depends(get_postgres),
    current_user: models.User = Depends(AuthService.get_current_active_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    deleted_storeditem = await crud_stored_item.delete_storeditem(db, storeditem_id)
    if not deleted_storeditem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StoredItem not found")
    return StoredItemDto.from_orm(deleted_storeditem)
