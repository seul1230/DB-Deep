import json
import asyncio
import pandas as pd
from fastapi import WebSocket
from services.message_service import save_chat_message, build_chat_history
from services.chat_service import chat_room_exists, update_chatroom_summary, generate_chatroom_title
from modules.rag_runner import run_sql_pipeline, run_chart_pipeline, run_insight_pipeline_async
from schemas.rag import QueryRequest, ChartRequest, InsightRequest

async def handle_chat_websocket(websocket: WebSocket):
    uuid, question, department, insight_text = None, None, None, None

    try:
        data = await websocket.receive_text()

        data_dict = json.loads(data)
        question = data_dict["question"]
        uuid = data_dict['uuid']
        
        if not chat_room_exists(uuid):
            await websocket.send_text("채팅방이 존재하지 않습니다.")
            await websocket.close()
            return

        save_chat_message(uuid, "user", "text", question)

        generate_title = True
        if generate_title:
            title = generate_chatroom_title(question)
            print(title)

    finally:
        if uuid:
            update_chatroom_summary(
                chat_room_id = uuid,
                last_question=question, last_insight=None)
