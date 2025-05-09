from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

class MemberIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        member_id = request.headers.get("X-Member-Id")
        if not member_id:
            return JSONResponse(status_code=400, content={"detail": "X-Member-Id 헤더가 없습니다"})
        request.state.member_id = member_id
        response = await call_next(request)
        return response
