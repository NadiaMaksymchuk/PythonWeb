from http.client import HTTPException
from fastapi import APIRouter, Depends

from src.models.users import models
from src.modules.auth.service import AuthService
from src.common.database import get_postgres
from src.modules.customers import schemas, services

router = APIRouter(prefix="/customer")

customer_service = services.CustomerService()


@router.post(path="")
async def create_customer(dto: schemas.CreateCustomerDto, db=Depends(get_postgres), current_user: models.User = Depends(AuthService.get_current_active_user)):
    if current_user.is_admin == False:
        raise HTTPException(status_code=403, detail="Доступ заборонено")
    return await customer_service.create(db, dto)