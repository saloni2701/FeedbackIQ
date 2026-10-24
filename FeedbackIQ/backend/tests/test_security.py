import jwt
import pytest

from app.auth.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_roundtrip():
    h = hash_password("correct horse battery")
    assert h != "correct horse battery"
    assert verify_password("correct horse battery", h)
    assert not verify_password("wrong password", h)


def test_token_roundtrip_and_tamper():
    token = create_access_token(42)
    assert decode_access_token(token)["sub"] == "42"
    with pytest.raises(jwt.PyJWTError):
        decode_access_token(token[:-2] + "xx")
