from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
import os
from pipeline.rag_chain import set_rag_chain
from pipeline.sql_process import clean_sql_from_response, clean_json_from_response, SQLExecutor
from llm.gemini import GeminiStreamingViaGMS
from pipeline.prompt_templates import get_prompt_for_insight
from db.pinecone import get_vectorstore
from service.chatroom_service import chat_room_exists
from service.message_service import (
    save_chat_message,
    update_chatroom_summary,
    build_chat_history
)

router = APIRouter()

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    uuid = None
    try:
        # 1. 메시지 수신
        data = await websocket.receive_text()
        payload = json.loads(data)

        uuid = payload["uuid"]
        question = payload["question"]
        department = payload["department"]

        # 2. 채팅방 유무 확인
        if not chat_room_exists(uuid):
            await websocket.send_text("채팅방이 존재하지 않습니다.")
            await websocket.close()
            return

        save_chat_message(uuid, "user", "text", question)

        # 3. SQL 생성
        await websocket.send_text("SQL 생성 중...")

        vectorstore = get_vectorstore()
        response_text = set_rag_chain(question, department, vectorstore)

        sql = clean_sql_from_response(response_text)
        chart_json = clean_json_from_response(response_text)

        save_chat_message(uuid, "ai", "sql", sql)
        await websocket.send_text(f"SQL:\n{sql}")

        # 4. SQL 실행
        executor = SQLExecutor()
        df = executor.execute_with_retry(sql)

        chart_obj = json.loads(chart_json)
        save_chat_message(uuid, "ai", "chart", chart_obj)

        await websocket.send_text("차트 & 데이터 전송 중...")
        await websocket.send_json({
            "query": sql,
            "data": df.to_dict(orient="records"),
            "chart": chart_obj
        })

        # 5. 인사이트 스트리밍
        await websocket.send_text("insight_start")

        chat_history = build_chat_history(uuid)

        prompt = get_prompt_for_insight({
            "question": question,
            "chart_spec": chart_obj,
            "data": df.to_dict(orient="records"),
            "user_department": department,
            "chat_history": chat_history
        })

        llm = GeminiStreamingViaGMS(
            api_key=os.getenv("GEMINI_API_KEY"),
            api_base=os.getenv("GEMINI_API_BASE")
        )

        async for chunk in llm.astream(prompt):
            save_chat_message(uuid, "ai", "insight", chunk.text)
            await websocket.send_text(chunk.text)

        await websocket.send_text("insight_end")

    except WebSocketDisconnect:
        logging.info(f"WebSocket 연결 종료: {uuid}")
        if uuid:
            update_chatroom_summary(uuid)
