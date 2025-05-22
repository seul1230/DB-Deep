import json
import asyncio
import logging
import pandas as pd

from fastapi import WebSocket, WebSocketDisconnect
from utils.ws_session_manager import set_stop_flag, clear_stop_flag
from utils.ws_utils import send_ws_message
from utils.response_utils import replace_nulls_with_zero
from services.message_service import save_chat_message, build_chat_history
from services.glossary_service import get_glossary_terms_by_member_id
from services.chat_service import update_chatroom_summary, generate_chatroom_title, is_first_chat
from modules.rag_runner import run_sql_pipeline, run_chart_pipeline, run_insight_pipeline_async, run_question_clf_chain, run_follow_up_chain_async
from schemas.rag import QueryRequest, ChartRequest, InsightRequest
from infrastructure.es_message_service import save_chat_message_to_es

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


async def handle_chat_websocket(websocket: WebSocket):
    
    while True:
        uuid = websocket.state.uuid
        member_id = websocket.state.member_id
        department = websocket.state.department

        try:
            data = await websocket.receive_text()
            data_dict = json.loads(data)

            if "type" in data_dict:
                if data_dict["type"] == "stop":
                    await set_stop_flag(uuid)
                    await send_ws_message(websocket, type_="info", payload="🛑 생성 중단 요청 완료")
                    await asyncio.sleep(0)
                    continue
                else:
                    await send_ws_message(websocket, type_="error", payload=f"알 수 없는 type: {data_dict['type']}")
                    await asyncio.sleep(0)
                    continue
            
            data_dict["uuid"] = uuid
            data_dict["user_department"] = department
            request = QueryRequest(**data_dict)
            question = request.question
            member_dict = get_glossary_terms_by_member_id(member_id)
            
            # 최초 메시지인 경우에만 제목 생성
            if is_first_chat(uuid):
                try:
                    title = generate_chatroom_title(question)
                    await send_ws_message(websocket, type_="title", payload=title)
                    await asyncio.sleep(0)
                except Exception as e:
                    logging.warning(f"❗ 채팅방 제목 생성 실패: {e}")
                    await send_ws_message(websocket, type_="title", payload="새 채팅방", error=str(e))
                    await asyncio.sleep(0)  # flush 기회 줌
                    title = "새 채팅방"
            
            chat_history = build_chat_history(uuid)
            
            # 사용자 질문 저장
            save_chat_message(
                chat_room_id=uuid, 
                sender_type="user", 
                message_type="text", 
                content={"question": question}
            )

            # 🔍 질문 유형 분류
            clf_result = await run_question_clf_chain(question=question, chat_history=chat_history)
            clf_type = clf_result.get("classification", "")
            logging.info("완료: %s", clf_result)
            logging.info("완료: %s", clf_result.get("reason", ""))

            await send_ws_message(websocket, type_="info", payload=f"질문 분류 결과: {clf_type}")
            await asyncio.sleep(0)

            if clf_type == "follow_up":
                follow_up_response = ""
                try:
                    response_text = await run_follow_up_chain_async(question, chat_history, websocket)
                    follow_up_response += response_text
                    # ✅ Follow-up 응답 최종 저장
                    chat_id = save_chat_message(
                        chat_room_id=uuid,
                        sender_type="ai",
                        message_type="follow_up",
                        content={
                            "question": question,
                            "follow_up_response": response_text
                        }
                    )
                    logging.info(f"Follow-up 답변: {follow_up_response}")

                    await send_ws_message(websocket, type_="info", payload=chat_id)
                    await asyncio.sleep(0)
                    update_chatroom_summary(
                        chat_room_id=uuid,
                        last_question=question,
                        last_insight=response_text,
                        last_chart_type=None
                    )
                    continue

                except WebSocketDisconnect:
                    logging.warning("🚫 클라이언트가 WebSocket 연결을 종료했습니다.")
                    break
                except Exception as e:
                    continue
            
            elif clf_type != "analysis":
                msg = {
                    "confused": "조금 더 구체적으로 질문해주시면 분석을 도와드릴 수 있어요!"
                }.get(clf_type, "죄송합니다. 이해할 수 없는 질문입니다. 다시 시도해주세요.")
        
                await send_ws_message(websocket, type_="follow_up_stream", payload=msg)
                await asyncio.sleep(0)
                continue
            

            # SQL & 테이블 생성
            await send_ws_message(websocket, type_="info", payload="SQL & 데이터 생성 중")
            await asyncio.sleep(0)
            result_dict = await run_sql_pipeline(request, websocket, 5, custom_dict=member_dict)
            need_chart = result_dict.get("need_chart")
            if isinstance(need_chart, str):
                need_chart = need_chart.lower() != "false"
            print(result_dict)
            result = ChartRequest(**result_dict)
            sql = result.sql_query
            df = pd.DataFrame(result.data)

            await send_ws_message(websocket, type_="query", payload=sql)
            await asyncio.sleep(0)
            await send_ws_message(websocket, type_="data", payload=df.to_dict(orient="records"))
            await asyncio.sleep(0)
            await send_ws_message(websocket, type_="info", payload="SQL 생성 완료")
            await asyncio.sleep(0)

            # 차트 생성
            data_summary = ""
            chart_obj={}
            print("need_chart: ", need_chart)
            if need_chart:
                await send_ws_message(websocket, type_="info", payload="차트 생성 중")
                await asyncio.sleep(0)
                
                updated_chart_request = run_chart_pipeline(result)
                chart_obj = updated_chart_request.chart_spec
                data_summary = updated_chart_request.data_summary

                await send_ws_message(websocket, type_="chart", payload=chart_obj)
                await asyncio.sleep(0)
                await send_ws_message(websocket, type_="data_summary", payload=data_summary)
                await asyncio.sleep(0)

                data_for_insight = None
                data_summary_for_insight = data_summary
            else:
                data_for_insight = df.to_dict(orient="records")
                data_summary_for_insight = None
            await send_ws_message(websocket, type_="info", payload="차트 생성 완료")
            await asyncio.sleep(0)

            # 인사이트 생성
            await send_ws_message(websocket, type_="info", payload="인사이트 생성 중")
            await asyncio.sleep(0)
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
                    insight_text = await run_insight_pipeline_async(insight_request, websocket, uuid)
                    print(insight_text)
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
                            await send_ws_message(websocket, type_="insight", payload=insight_text)
                            await asyncio.sleep(0)
                        except:
                            pass
                        break
                finally:
                    await clear_stop_flag(uuid)


            await send_ws_message(websocket, type_="info", payload="인사이트 생성 완료")
            await asyncio.sleep(0)

            chart_obj = replace_nulls_with_zero(chart_obj)



            # 최종 메시지 저장 (AI 응답)
            chat_id = save_chat_message(
                chat_room_id=uuid,
                sender_type="ai",
                message_type="sql",
                content={
                    "question": question,
                    "query": sql,
                    "data": df.to_markdown(index=False),
                    "chart": chart_obj if chart_obj else {},
                    "insight": insight_text
                }
            )
            
            # chart["y"]가 dict일 경우 평균값 등으로 요약
            if isinstance(chart_obj.get("y"), dict):
                logging.warning("📛 chart.y가 dict 형태입니다. 저장용으로 변환합니다.")
                # 예: 각 시리즈의 마지막 값만 추출해서 리스트로 변환
                chart_obj["y"] = [series[-1] for series in chart_obj["y"].values()]
                
            if isinstance(chart_obj.get("legend"), dict):
                # JSON 문자열로 변환해서 저장하거나
                chart_obj["legend"] = json.dumps(chart_obj["legend"], ensure_ascii=False)
                # 또는 그냥 key=value 형태로 이어 붙이기
                # chart_obj["legend"] = ", ".join(f"{k}={v}" for k, v in chart_obj["legend"].items())


            save_chat_message_to_es(
                chat_room_id=uuid,
                member_id=5,
                sender_type="ai",
                message_type="sql",
                content={
                    "question": question,
                    "query": sql,
                    "chart": chart_obj if chart_obj else {},
                    "insight": insight_text
                }
            )

            await send_ws_message(websocket, type_= "info", payload=chat_id)
            await asyncio.sleep(0)

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

        finally:
            if uuid:
                await clear_stop_flag(uuid)