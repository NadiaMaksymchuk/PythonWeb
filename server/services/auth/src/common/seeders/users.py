from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.users import User
from uuid import uuid4
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_users(db: AsyncSession):
        # Create an admin user if it doesn't exist
        admin_user = User(
            username="admin01",
            email="admin01@example.com",
            password="passw0rd",  # Hash the password
            is_admin=True,
            is_active=True,
            is_enabled=True,
            uuid=uuid4()  # Generate UUID for the user
        )

        db.add(admin_user)
        await db.commit()
        print("Admin user created")