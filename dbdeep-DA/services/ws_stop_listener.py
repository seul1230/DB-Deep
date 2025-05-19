import json
import logging
from fastapi import WebSocket
from utils.ws_session_manager import set_stop_flag
from utils.ws_utils import send_ws_message

async def listen_for_stop(websocket: WebSocket, uuid: str):
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "stop" and msg.get("uuid") == uuid:
                await set_stop_flag(uuid)
                await send_ws_message(websocket, type_="info", payload="🛑 멈춤 요청 수신됨")
                break
    except Exception as e:
        logging.warning(f"수신 종료: {e}")
