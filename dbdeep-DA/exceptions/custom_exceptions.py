class ChatroomNotFoundException(Exception):
    def __init__(self, chatroom_id: str):
        self.chatroom_id = chatroom_id
        self.message = f"채팅방 '{chatroom_id}'를 찾을 수 없습니다."
        super().__init__(self.message)

class SQLExecutionException(Exception):
    def __init__(self, detail: str = "SQL 실행 중 오류가 발생했습니다."):
        self.message = detail
        super().__init__(self.message)
