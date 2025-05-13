import json
import pandas as pd
from fastapi import WebSocket
from services.message_service import save_chat_message, build_chat_history
from services.chat_service import chat_room_exists, update_chatroom_summary
from modules.rag_runner import run_sql_pipeline, run_chart_pipeline, run_insight_pipeline_async
from schemas.rag import QueryRequest, ChartRequest, InsightRequest

async def handle_chat_websocket(websocket: WebSocket):
    uuid, question, department, insight_text = None, None, None, None

    try:
        data = await websocket.receive_text()
        # payload = json.loads(data)
        # uuid = payload["uuid"]
        # question = payload["question"]
        # department = payload["department"]
        data_dict = json.loads(data)
        
        request = QueryRequest(**data_dict)
        uuid = request.uuid
        question = request.question
        department = request.user_department
        
        if not chat_room_exists(uuid):
            await websocket.send_text("채팅방이 존재하지 않습니다.")
            await websocket.close()
            return

        save_chat_message(uuid, "user", "text", question)
        await websocket.send_text("SQL 생성 중...")

        result_dict = run_sql_pipeline(request)
        result = ChartRequest(**result_dict)
        sql = result.sql_query
        df = pd.DataFrame(result.data)

        save_chat_message(uuid, "ai", "sql", sql)
        await websocket.send_text(f"SQL:\n{sql}")
        
        # run_chart_pipeline
        updated_chart_request = run_chart_pipeline(result)

        chart_obj = updated_chart_request.chart_spec  # chart JSON 구조
        data_summary = updated_chart_request.data_summary  # LLM이 생성한 데이터 요약 문장

        save_chat_message(uuid, "ai", "chart", chart_obj)
        await websocket.send_text("차트 & 데이터 전송 중...")

        await websocket.send_json({
            "query": sql,
            "data": df.to_dict(orient="records"),
            "data_summary": data_summary,
            "chart": chart_obj
        })

        save_chat_message(uuid, "ai", "chart", chart_obj)
        await websocket.send_text("차트 & 데이터 전송 중...")
        await websocket.send_json({
            "query": sql,
            "data": df.to_dict(orient="records"),
            "chart": chart_obj
        })

        await websocket.send_text("insight_start")

        chat_history = build_chat_history(uuid)
        request_dict = {
            "question": question,
            "chart_spec": chart_obj,
            "data": df.to_dict(orient="records"),
            "user_department": department,
            "chat_history": chat_history
        }
        
        insight_request = InsightRequest(**request_dict)
        insight_text = await run_insight_pipeline_async(insight_request, websocket)

        save_chat_message(uuid, "ai", "insight", insight_text)
        await websocket.send_text(insight_text)

        await websocket.send_text("insight_end")

    finally:
        if uuid:
            update_chatroom_summary(
                chat_room_id = uuid,
                last_question=question,
                last_insight=insight_text or "Error",
                last_chart_type=chart_obj.get("chart_type") if 'chart_obj' in locals() else None)
