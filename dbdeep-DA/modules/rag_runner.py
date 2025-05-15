import re
import json
import logging

import asyncio
from typing import Dict

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect


from services.sql_executor import SQLExecutor
from schemas.rag import QueryRequest, ChartRequest, InsightRequest
from db.pinecone import get_vectorstore
from utils.response_utils import clean_sql_from_response, clean_json_from_response, extract_text_block
from modules.rag_builder import build_sql_chain, build_chart_chain, build_insight_chain

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def run_bigquery(question, response_text):
    try:
        query = clean_sql_from_response(response_text)
        executor = SQLExecutor()
        df = executor.execute(query)

        return {
            "question": question,
            "sql_query": query,
            "data": df.to_dict(orient="records") if df is not None else None
        }
    except Exception as e:
        logging.exception("❌ NL2SQL 처리 실패:")
        return None


def run_sql_pipeline(request: QueryRequest, max_retry : int = 5) -> Dict:
    sql_chain, inputs = build_sql_chain(request.question, request.user_department)

    result_dict = None
    for attempt in range(max_retry):
        try:
            logging.info(f"🚀 SQL 생성 시도 (시도 {attempt+1})...")
            
            answer = sql_chain.invoke(inputs)
            print("\n[최종 응답]")
            print(answer, end="\n")
            
            result_dict = run_bigquery(request.question, answer)
            
            if result_dict.get("data", []) != []:
                return {
                    "question":request.question,
                    "sql_query":result_dict["sql_query"],
                    "user_department":request.user_department,
                    "data":result_dict["data"]
                }
            
        except Exception as e:
            logging.warning(f"❌ SQL 검증 및 실행 실패 (시도 {attempt+1}): {e}")
            if attempt == max_retry - 1:
                raise RuntimeError("❌ 모든 재시도 실패: SQL 실행 불가")

    return None


def run_chart_pipeline(chart_request: ChartRequest) -> ChartRequest:
    logging.info("📈 차트 정보 생성 중...")

    chart_chain, inputs = build_chart_chain(chart_request.question, chart_request.data)
    response_text = chart_chain.invoke(inputs)

    chart_spec_raw = clean_json_from_response(response_text)
    chart_spec = json.loads(chart_spec_raw)

    return chart_request.copy(update={
        "chart_spec": chart_spec,
        "data_summary": extract_text_block(response_text)
    })

async def run_insight_pipeline_async(request: InsightRequest, websocket: WebSocket):
    logging.info("🧠 인사이트 추출 중...")
    chain, inputs = build_insight_chain(request.dict())
    result = ""
    generator = chain.astream(inputs)

    try:
        async for chunk in generator:
            try:
                await websocket.send_text(chunk)
                result += chunk
            except (RuntimeError, asyncio.CancelledError, WebSocketDisconnect):
                logging.warning("⚠️ WebSocket 전송 실패 또는 연결 종료")
                break
    except Exception as e:
        logging.exception("❌ 인사이트 추출 중 예외 발생:")
        raise
    finally:
        await generator.aclose()

    return result



# 테스트 코드
if __name__ == "__main__":
    query = QueryRequest(
        uuid="0db08f4d-b1b9-4711-933b-3eccd0828be1",
        question="성과가 부진한 부서의 성과급을 조금 조정해야할 것 같아. 얼마 정도가 적당할까?",
        department="인사팀"
    )
    chart_request = run_sql_pipeline(query, max_retry=5)
    if chart_request:
        updated_chart_request = run_chart_pipeline(chart_request)
        insight_input = InsightRequest(
            question=updated_chart_request.question,
            chart_spec=updated_chart_request.chart_spec,
            data=updated_chart_request.data,
            user_department=updated_chart_request.user_department
        )
        # asyncio.run(...) 으로 호출해야 실제 실행됨
        print("\n📌 최종 인사이트 요청 준비 완료:", insight_input)
