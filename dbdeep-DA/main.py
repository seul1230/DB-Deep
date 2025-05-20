from fastapi import FastAPI
from middleware.member_id_middleware import MemberIdMiddleware
from exceptions.handlers import register_exception_handlers
from api import router, ws_chat, rag_router

app = FastAPI(
    title="DBDeep API",
    description="자연어 → SQL/차트/인사이트 서비스",
    version="1.0.0"
)

# 미들웨어
app.add_middleware(MemberIdMiddleware)

# 예외 핸들러
register_exception_handlers(app)

# 라우터 등록
app.include_router(router.router)
app.include_router(ws_chat.router)
app.include_router(rag_router.router)
app.include_router(glossary_term_controller.router)
