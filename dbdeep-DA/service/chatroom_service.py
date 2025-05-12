from db.mysql import SessionLocal, ChatRoom

def chat_room_exists(chat_room_id: str) -> bool:
    with SessionLocal() as session:
        return session.get(ChatRoom, chat_room_id) is not None
