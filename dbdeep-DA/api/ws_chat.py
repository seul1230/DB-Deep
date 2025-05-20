import logging
import os
import jwt
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from services.streaming_service import handle_chat_websocket
from services.chat_service import chat_room_exists
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

        # 클라이언트한테 첫 초기 데이터 수신 (uuid, member_id, department)
        init_data = await websocket.receive_text()
        init_dict = json.loads(init_data)

        websocket.state.uuid = init_dict["uuid"]
        websocket.state.department = init_dict["user_department"]

        # 채팅창 존재 여부 1회 확인
        if not chat_room_exists(websocket.state.uuid):
            await websocket.send_text("채팅방이 존재하지 않습니다.")
            await websocket.close()
            return

        await handle_chat_websocket(websocket)

    except WebSocketDisconnect:
        logging.info(" WebSocket 연결 종료됨")
