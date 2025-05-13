from datetime import datetime
from db.mysql import SessionLocal, ChatRoom
from db.firestore import get_firestore_client

def chat_room_exists(chat_room_id: str) -> bool:
    with SessionLocal() as session:
        return session.get(ChatRoom, chat_room_id) is not None
    

def update_chatroom_summary(chat_room_id: str, last_question: str, last_insight: str, last_chart_type: str = None):
    summary_text = f"{last_question or '최근 질문 없음'} → {last_insight or '답변 없음'}"
    db = get_firestore_client()
    ref = db.collection("chat_rooms").document(chat_room_id)
    ref.set({
        "summary": summary_text,
        "last_question": last_question,
        "last_insight": last_insight,
        "last_chart_type": last_chart_type,
        "last_updated": datetime.utcnow()
    }, merge=True)