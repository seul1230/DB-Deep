from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.streaming_service import handle_chat_websocket

router = APIRouter()

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    try:
        await websocket.accept()
        await handle_chat_websocket(websocket)
    except WebSocketDisconnect:
        print("WebSocket 연결 종료됨")
