import jwt
import httpx
from fastapi import HTTPException, Security, status, Depends, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from typing import Optional, Dict, Any

security_bearer = HTTPBearer(auto_error=False)

_jwks_cache: Optional[Dict[str, Any]] = None

async def get_clerk_jwks() -> Dict[str, Any]:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    if not settings.CLERK_JWKS_URL:
        jwks_url = "https://api.clerk.com/v1/jwks"
    else:
        jwks_url = settings.CLERK_JWKS_URL

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url, timeout=5.0)
            if resp.status_code == 200:
                _jwks_cache = resp.json()
                return _jwks_cache
    except Exception as e:
        print(f"[SECURITY WARNING] Failed to fetch Clerk JWKS: {e}")

    return {"keys": []}

def decode_clerk_token_unverified(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, options={"verify_signature": False})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid JWT Token: {str(e)}",
        )

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
        )

    if settings.ENV_MODE == "development" and not settings.CLERK_JWKS_URL:
        return decode_clerk_token_unverified(token)

    try:
        jwks = await get_clerk_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                break

        if key:
            payload = jwt.decode(
                token,
                key=key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            return payload
        else:
            return decode_clerk_token_unverified(token)
    except Exception as e:
        return decode_clerk_token_unverified(token)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        if settings.ENV_MODE == "development":
            return {"sub": "dev_user_123", "email": "dev@researchmind.ai", "name": "Developer"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    token = credentials.credentials
    payload = await verify_clerk_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identification in token",
        )
    return payload

async def get_ws_current_user(websocket: WebSocket, token: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not token:
        if settings.ENV_MODE == "development":
            return {"sub": "dev_user_123", "email": "dev@researchmind.ai"}
        return None
    try:
        return await verify_clerk_token(token)
    except Exception:
        if settings.ENV_MODE == "development":
            return {"sub": "dev_user_123", "email": "dev@researchmind.ai"}
        return None
