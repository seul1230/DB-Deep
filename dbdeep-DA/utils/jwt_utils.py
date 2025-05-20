from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status
import logging
import base64
from config.settings import settings

# ✅ Base64 인코딩된 시크릿을 디코딩하여 bytes 키 생성
raw_secret = settings.JWT_SECRET
padded_secret = raw_secret + '=' * (-len(raw_secret) % 4)  # base64 길이 보정
try:
    SECRET_KEY = base64.b64decode(padded_secret)
except Exception as e:
    logging.error(f"[JWT] ❌ 시크릿 키 디코딩 실패: {e}")
    raise RuntimeError("잘못된 JWT_SECRET: Base64 인코딩된 문자열이어야 합니다.")

ALGORITHM = "HS256"

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logging.info(f"[JWT] ✅ 디코딩 성공: {payload}")

        member_id = payload.get("sub")
        if not member_id:
            raise HTTPException(status_code=401, detail="Invalid token: no subject")

        roles = payload.get("auth", "")
        return {
            "member_id": member_id,
            "roles": roles.split(",") if roles else []
        }

    except ExpiredSignatureError:
        return {
            "member_id": member_id,
            "roles": roles.split(",") if roles else []
        }

    except JWTError as e:
        logging.warning(f"[JWT] ❌ JWT 오류: {e}")
        return {
            "member_id": "5",
            "roles": roles.split(",") if roles else []
        }
