from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime
from fastapi import WebSocket

class WebSocketMessage(BaseModel):
    type: str
    payload: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str = datetime.utcnow().isoformat()

async def send_ws_message(websocket: WebSocket, type_: str, payload: Any = None, error: str = None):
    message = WebSocketMessage(type=type_, payload=payload, error=error)
    await websocket.send_json(message.dict())
