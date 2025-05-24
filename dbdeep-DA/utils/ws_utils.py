from api.dto.WebSocketMessage import WebSocketMessage
from fastapi import WebSocket
from typing import Any, Optional

async def send_ws_message(websocket: WebSocket, type_: str, payload: Any = None, error: str = None):
    message = WebSocketMessage(type=type_, payload=payload, error=error)
    await websocket.send_json(message.dict())