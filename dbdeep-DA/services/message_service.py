from typing import Literal
from datetime import datetime
from db.firestore import get_firestore_client

def save_chat_message(
    chat_room_id: str,
    sender_type: Literal["user", "ai", "system"],
    message_type: Literal["text", "sql", "chart", "insight"],
    content: str | dict
):
    db = get_firestore_client()
    db.collection("chat_messages").add({
        "chat_room_id": chat_room_id,
        "sender_type": sender_type,
        "type": message_type,
        "content": content,
        "timestamp": datetime.utcnow()
    })

def get_chat_messages(chat_room_id: str, limit: int = 100):
    db = get_firestore_client()
    query = (
        db.collection("chat_messages")
          .where("chat_room_id", "==", chat_room_id)
          .order_by("timestamp")
          .limit(limit)
    )
    return [doc.to_dict() for doc in query.stream()]

def build_chat_history(chat_room_id: str, limit: int = 20) -> str:
    messages = get_chat_messages(chat_room_id, limit)
    history_lines = []

    for m in messages:
        role = m.get("sender_type")
        content = m.get("content")
        if not content or not isinstance(content, str):
            continue
        if role == "user":
            history_lines.append(f"사용자: {content}")
        elif role == "ai":
            if m.get("type") == "insight":
                history_lines.append(f"AI(인사이트): {content}")
            elif m.get("type") == "sql":
                history_lines.append(f"AI(SQL): {content}")
            elif m.get("type") == "text":
                history_lines.append(f"AI: {content}")

    return "\n".join(history_lines)
