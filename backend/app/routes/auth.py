from uuid import uuid4

from fastapi import APIRouter, HTTPException

from pwdlib import PasswordHash

from ..db import db
from ..schemas import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserOut,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


password_hash = PasswordHash.recommended()


@router.post(
    "/register",
    response_model=RegisterResponse,
)
async def register(
    payload: RegisterRequest,
):
    email = str(payload.email).lower().strip()

    existing_user = await db.users.find_one(
        {
            "email": email,
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    # Generate a unique internal user ID.
    user_id = f"user_{uuid4().hex[:12]}"

    hashed_password = password_hash.hash(
        payload.password
    )

    user = {
        "id": user_id,
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hashed_password,
    }

    await db.users.insert_one(user)

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        }
    }


@router.post(
    "/login",
    response_model=LoginResponse,
)
async def login(
    payload: LoginRequest,
):
    email = str(payload.email).lower().strip()

    user = await db.users.find_one(
        {
            "email": email,
        }
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    stored_hash = user.get(
        "password_hash"
    )

    if not stored_hash:
        raise HTTPException(
            status_code=401,
            detail=(
                "This account does not have a password yet. "
                "Please create a new account."
            ),
        )

    try:
        valid_password = (
            password_hash.verify(
                payload.password,
                stored_hash,
            )
        )
    except Exception:
        valid_password = False

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
        }
    }


@router.get(
    "/users",
    response_model=list[UserOut],
)
async def get_users():
    users = await db.users.find(
        {},
        {
            "_id": 0,
            "id": 1,
            "name": 1,
            "email": 1,
        },
    ).to_list(length=1000)

    return users