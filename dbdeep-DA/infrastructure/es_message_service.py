from infrastructure.es_client import es
from uuid import uuid4
from datetime import datetime
import pytz

def save_chat_message_to_es(chat_room_id: str, member_id: int, sender_type: str, message_type: str, content: dict):
    """
    Elasticsearch에 채팅 메시지 저장
    """
    doc = {
        "chatRoomId": chat_room_id,
        "memberId": member_id,
        "senderType": sender_type,
        "timestamp": datetime.now(pytz.timezone("Asia/Seoul")).isoformat(),
        "type": message_type,
        "content": {
            "question": content.get("question", ""),
            "query": content.get("query", ""),
            "chart": content.get("chart", {}),
            "insight": content.get("insight", "")
        }
    }

    es.index(index="chat-messages", id=str(uuid4()), document=doc)
