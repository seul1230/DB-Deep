from datetime import datetime
from db.mysql import SessionLocal, ChatRoom
from db.firestore import get_firestore_client

from llm.gemini import GeminiSyncViaGMS

def chat_room_exists(chat_room_id: str) -> bool:
    with SessionLocal() as session:
        return session.get(ChatRoom, chat_room_id) is not None
    
def is_first_chat(chat_room_id: str) -> bool:
    db = get_firestore_client()
    messages_ref = db.collection("chat_messages")
    query = messages_ref.where("chat_room_id", "==", chat_room_id).limit(1)
    docs = query.stream()
    return not any(True for _ in docs)
    

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

def generate_chatroom_title(user_question: str) -> str:
    llm = GeminiSyncViaGMS()
    
    system_prompt = (
        "너는 사용자의 질문을 보고 채팅방 제목을 정해주는 AI야. "
        "질문에서 주제를 파악해서 짧고 핵심적인 채팅방 이름을 만들어줘. "
        "예: '성과급 정책 조정', '이직률 분석', '사원 수 추이'처럼 5~15자 내외로 요약해줘.\n\n"
        f"[사용자 질문]\n{user_question}\n\n"
        "→ 채팅방 이름:"
    )
    
    try:
        title = llm(system_prompt)
        return title.strip().split("\n")[0]  # 혹시 여러 줄이 왔을 경우 대비
    except Exception as e:
        # 실패 시 fallback
        return "새 채팅방"
