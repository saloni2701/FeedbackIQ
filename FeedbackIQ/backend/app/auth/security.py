"""Password hashing (bcrypt) and signed access tokens (JWT)."""
import warnings
from datetime import datetime, timedelta, timezone
from functools import lru_cache

import bcrypt
import jwt
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_SECRET = "change-me"


class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jwt_secret: str = DEV_SECRET
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 1440


@lru_cache
def auth_settings() -> AuthSettings:
    s = AuthSettings()
    if s.jwt_secret == DEV_SECRET:
        warnings.warn("JWT_SECRET is not set. Set a long random value in .env before deploying.", stacklevel=2)
    return s


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


@lru_cache
def dummy_hash() -> str:
    """Used so a login for an unknown email takes about as long as a real one."""
    return hash_password("not-a-real-password")


def create_access_token(user_id: int) -> str:
    s = auth_settings()
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + timedelta(minutes=s.access_token_minutes)}
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    s = auth_settings()
    return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
