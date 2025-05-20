import logging
import os
import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from services.streaming_service import handle_chat_websocket
from utils import jwt_utils

router = APIRouter()
JWT_SECRET = os.getenv("JWT_SECRET")

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = jwt_utils.decode_jwt_token(token)

        member_id = payload.get("member_id")
        websocket.state.member_id = member_id
        logging.info(f"✅ 인증된 사용자: {websocket.state.member_id}")

        await websocket.accept()
        await handle_chat_websocket(websocket)

    except WebSocketDisconnect:
        logging.info("🔌 WebSocket 연결 종료됨")
