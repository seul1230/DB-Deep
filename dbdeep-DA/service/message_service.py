from typing import Literal
from datetime import datetime

from db.firestore import get_firestore_client
from google.cloud import firestore


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
          .where("chatRoomId", "==", chat_room_id)
          .order_by("timestamp")
          .limit(limit)
    )
    return [doc.to_dict() for doc in query.stream()]


def update_chatroom_summary(chat_room_id: str):
    db = get_firestore_client()

    query = (
        db.collection("chat_messages")
          .where("chatRoomId", "==", chat_room_id)
          .order_by("timestamp", direction=firestore.Query.DESCENDING)
          .limit(20)
    )
    messages = list(query.stream())
    parsed = [m.to_dict() for m in reversed(messages)]

    last_question = next((m["content"] for m in reversed(parsed) if m["senderType"] == "user"), None)
    last_insight = next((m["content"] for m in reversed(parsed) if m["type"] == "insight"), None)
    last_chart_type = next((m["content"]["type"] for m in reversed(parsed)
                            if m["type"] == "chart" and isinstance(m["content"], dict)), None)

    summary_text = f"{last_question or '최근 질문 없음'} → {last_insight or '답변 없음'}"

    db.collection("chat_rooms").document(chat_room_id).update({
        "summary": summary_text,
        "last_question": last_question,
        "last_insight": last_insight,
        "last_chart_type": last_chart_type,
        "last_updated": datetime.utcnow()
    })


def build_chat_history(chat_room_id: str, limit: int = 20) -> str:
    messages = get_chat_messages(chat_room_id, limit=limit)

    history_lines = []
    for m in messages:
        role = m.get("senderType")
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
