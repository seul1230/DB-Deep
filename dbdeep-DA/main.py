from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from api.router import router as api_router

import json
import logging
import os
from dotenv import load_dotenv

from config.setup import init_pinecone
from llm.gemini import GeminiStreamingViaGMS
# from pipeline.rag_chain import set_rag_chain, get_prompt_for_insight
from pipeline.sql_process import clean_sql_from_response, clean_json_from_response, SQLExecutor
from api.glossary_term_controller import router as glossary_router

from middleware.member_id_middleware import MemberIdMiddleware  # 추가

app = FastAPI()
app.add_middleware(MemberIdMiddleware)
app.include_router(api_router)
app.include_router(glossary_router)

load_dotenv()
logging.basicConfig(level=logging.INFO)

# 환경 변수
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_API_BASE = os.environ["GEMINI_API_BASE"]

# Pinecone 클라이언트
pc = init_pinecone()

# 요청 모델
class QueryRequest(BaseModel):
    question: str
    department: str

class InsightRequest(BaseModel):
    question: str
    chart_spec: dict
    data: list
    chat_history: str | None = None
    user_department: str | None = None

# root handler
@app.get("/")
async def liveness_probe():
    return {"status": "ok"}

# NL2SQL + Vega-Lite JSON 반환
# @app.post("/api/nl2sql")
# def run_nl2sql(request: QueryRequest):
#     try:
#         vectorstore = pc.Index("schema-index")
#         response_text = set_rag_chain(
#             question=request.question,
#             user_department=request.department,
#             schema_vectorstore=vectorstore
#         )

#         query = clean_sql_from_response(response_text)
#         chart_spec_raw = clean_json_from_response(response_text)

#         chart_spec = None
#         try:
#             chart_spec = json.loads(chart_spec_raw)
#         except Exception as e:
#             logging.warning(f"⚠️ JSON 파싱 실패: {e}")

#         executor = SQLExecutor()
#         df = executor.execute_with_retry(query)

#         return {
#             "query": query,
#             "data": df.to_dict(orient="records"),
#             "chart": chart_spec
#         }
#     except Exception as e:
#         logging.exception("❌ NL2SQL 처리 실패:")
#         raise HTTPException(status_code=500, detail=str(e))

# # 인사이트 스트리밍
# @app.post("/api/insight")
# async def generate_insight(request: InsightRequest):
#     try:
#         prompt = get_prompt_for_insight(request)
#         llm = GeminiStreamingViaGMS(
#             api_key=GEMINI_API_KEY,
#             api_base=GEMINI_API_BASE
#         )

#         stream = llm.astream(prompt)
#         insight_text = ""
#         async for chunk in stream:
#             insight_text += chunk.text

#         return {"insight": insight_text}
#     except Exception as e:
#         logging.exception("❌ 인사이트 생성 실패:")
#         raise HTTPException(status_code=500, detail=str(e))
