import json
import asyncio
import logging
import pandas as pd

from datetime import datetime
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

from services.message_service import save_chat_message, build_chat_history
from services.chat_service import chat_room_exists, update_chatroom_summary, generate_chatroom_title
from modules.rag_runner import run_sql_pipeline, run_chart_pipeline, run_insight_pipeline_async
from schemas.rag import QueryRequest, ChartRequest, InsightRequest

async def handle_chat_websocket(websocket: WebSocket):
    
    while True:
        try:
            data = await websocket.receive_text()
            data_dict = json.loads(data)

            request = QueryRequest(**data_dict)
            uuid = request.uuid
            question = request.question
            department = request.user_department

            # 제목 자동 생성
            try:
                title = generate_chatroom_title(question)
                await websocket.send_text(f"[채팅방 제목]: {title}")
            except Exception as e:
                logging.warning(f"❗ 채팅방 제목 생성 실패: {e}")
                await websocket.send_text(f"[채팅방 제목]: 새 채팅방")
                title = "새 채팅방"

            # 채팅방 생성 확인
            if not chat_room_exists(uuid):
                await websocket.send_text("채팅방이 존재하지 않습니다.")
                await websocket.close()
                return

            # 사용자 질문 저장
            save_chat_message(
                chat_room_id=uuid, 
                sender_type="user", 
                message_type="text", 
                content={"question": question}
            )

            await websocket.send_text("SQL 생성 중...")

            result_dict = run_sql_pipeline(request)
            need_chart = result_dict.get("need_chart")
            if isinstance(need_chart, str):
                need_chart = need_chart.lower() != "false"

            result = ChartRequest(**result_dict)
            sql = result.sql_query
            df = pd.DataFrame(result.data)

            await websocket.send_text(f"SQL:\n{sql}")
            await websocket.send_text(f"Data:\n{df}")

            # 차트 생성
            data_summary = ""
            chart_obj={}

            if need_chart:
                updated_chart_request = run_chart_pipeline(result)
                chart_obj = updated_chart_request.chart_spec
                data_summary = updated_chart_request.data_summary

                await websocket.send_text("차트 & 데이터 전송 중...")
                await websocket.send_json({
                    "query": sql,
                    "data": df.to_dict(orient="records"),
                    "data_summary": data_summary,
                    "chart": chart_obj
                })

                data_for_insight = None
                data_summary_for_insight = data_summary
            else:
                data_for_insight = df.to_dict(orient="records")
                data_summary_for_insight = None

            # 인사이트 생성
            await websocket.send_text("insight_start")
            chat_history = build_chat_history(uuid)

            request_dict = {
                "question": question,
                "chart_spec": chart_obj,
                "data": data_for_insight,
                "data_summary": data_summary_for_insight,
                "user_department": department,
                "chat_history": chat_history
            }

            insight_request = InsightRequest(**request_dict)

            max_retries = 3
            retry_delay = 2
            insight_text = ""
            for attempt in range(1, max_retries + 1):
                try:
                    insight_text = await run_insight_pipeline_async(insight_request, websocket)
                    break
                except WebSocketDisconnect:
                    logging.warning("🚫 클라이언트가 WebSocket 연결을 종료했습니다.")
                    return
                except Exception as e:
                    error_message = str(e)
                    if "503" in error_message and attempt < max_retries:
                        await asyncio.sleep(retry_delay)
                    else:
                        insight_text = "인사이트 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
                        try:
                            await websocket.send_text(insight_text)
                        except:
                            pass
                        break

            await websocket.send_text(insight_text)
            await websocket.send_text("insight_end")

            # 최종 메시지 저장 (AI 응답)
            save_chat_message(
                chat_room_id=uuid,
                sender_type="ai",
                message_type="sql",
                content={
                    "question": question,
                    "query": sql,
                    "chart": chart_obj if chart_obj else {},
                    "insight": insight_text
                }
            )

            update_chatroom_summary(
                chat_room_id=uuid,
                last_question=question,
                last_insight=insight_text or "",
                last_chart_type=chart_obj.get("chart_type") if chart_obj else None
            )

        except WebSocketDisconnect:
            logging.warning("⚠️ 클라이언트가 WebSocket 연결을 중단했습니다.")
        
        except Exception as e:
            logging.error(f"예상치 못한 에러 발생 : {e}")
            await websocket.send_text("서버 처리 중 오류가 발생했습니다. 다시 시도해주세요.")
