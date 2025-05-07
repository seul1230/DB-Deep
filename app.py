import os
import re
import json
import logging
import pinecone
import aiohttp
import asyncio

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from module.rag_chain import set_rag_chain, get_prompt_for_insight
from module.sql_utils import clean_sql_from_response, clean_json_from_response, SQLExecutor
from module.setup import init_pinecone

# 환경 변수 로드 및 설정
load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Pinecone 초기화
pc = init_pinecone()

def get_required_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(f"❌ 필수 환경 변수 '{key}'가 설정되지 않았습니다.")
    return value


# GMS 기반 Gemini API 정보
GEMINI_API_KEY = get_required_env("GEMINI_API_KEY")
GEMINI_API_BASE = get_required_env("GEMINI_API_BASE")
MODEL_NAME = "gemini-2.0-flash-lite"

# 요청 데이터 모델
class QueryRequest(BaseModel):
    question: str
    department: str

class InsightRequest(BaseModel):
    question: str
    chart_spec: dict
    data: list  # list of dicts (DataFrame to_dict(orient="records"))
    chat_history: str | None = None
    user_department: str | None = None

# NL2SQL + Chart 생성 API
@app.post("/api/nl2sql")
def run_nl2sql(request: QueryRequest):
    try:
        # 1. 자연어 질문 → SQL + 시각화 JSON 생성
        response_text = set_rag_chain(
            question=request.question,
            user_department=request.department,
            pc=pc
        )
        query = clean_sql_from_response(response_text)
        chart_spec_raw = clean_json_from_response(response_text)
        chart_spec = None
        try:
            chart_spec = json.loads(chart_spec_raw)
        except Exception as json_error:
            logging.warning(f"⚠️ 시각화 JSON 파싱 실패: {json_error}")

        logging.info(f"✅ 생성된 SQL:\n{query}")

        # 2. SQL 실행
        executor = SQLExecutor()
        df = executor.execute_with_retry(query)

        # 3. 결과 반환
        return {
            "query": query,
            "data": df.to_dict(orient="records"),
            "chart": chart_spec
        }

    except Exception as e:
        logging.exception("❌ 처리 실패:")
        raise HTTPException(status_code=500, detail=str(e))

# 인사이트 생성 API (Gemini Streaming 기반)
@app.post("/api/insight")
async def generate_insight(request: InsightRequest):
    try:
        prompt = get_prompt_for_insight(request)

        # Gemini Native API 호출
        url = f"{GEMINI_API_BASE}/{MODEL_NAME}:streamGenerateContent"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        }
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "topP": 0.95
            }
        }

        result_text = ""

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as resp:
                async for line in resp.content:
                    line = line.decode("utf-8").strip()
                    if line.startswith("data: "):
                        data = line[len("data: "):]
                        if data == "[DONE]":
                            break
                        try:
                            content = json.loads(data)
                            parts = content.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                            for part in parts:
                                if "text" in part:
                                    result_text += part["text"]
                        except Exception as parse_err:
                            logging.warning(f"🔸 파싱 실패: {parse_err}")

        return {"insight": result_text}

    except Exception as e:
        logging.exception("❌ 인사이트 생성 실패:")
        raise HTTPException(status_code=500, detail=str(e))



#### 
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from module.rag_chain import set_rag_chain, get_prompt_for_insight
# from module.sql_utils import clean_sql_from_response, clean_json_from_response, SQLExecutor
# from module.setup import init_pinecone

# import pinecone
# import logging
# import re
# import json
# import os
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI()
# logging.basicConfig(level=logging.INFO)

# # Pinecone 초기화
# pc = init_pinecone()

# GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
# GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE", "https://gms.p.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta")
# MODEL_NAME = "models/gemini-pro"

# # 요청 데이터 모델
# class QueryRequest(BaseModel):
#     question: str
#     department: str

# class InsightRequest(BaseModel):
#     question: str
#     chart_spec: dict
#     data: list  # list of dicts (DataFrame to_dict(orient="records"))
#     chat_history: str | None = None
#     user_department: str | None = None

# @app.post("/api/nl2sql")
# def run_nl2sql(request: QueryRequest):
#     try:
#         # 1. 자연어 질문 → SQL + 시각화 JSON 생성
#         response_text = set_rag_chain(
#             question=request.question,
#             user_department=request.department,
#             pc=pc
#         )
#         query = clean_sql_from_response(response_text)
#         chart_spec_raw = clean_json_from_response(response_text)
#         chart_spec = None
#         try:
#             chart_spec = json.loads(chart_spec_raw)
#         except Exception as json_error:
#             logging.warning(f"⚠️ 시각화 JSON 파싱 실패: {json_error}")

#         logging.info(f"✅ 생성된 SQL:\n{query}")

#         # 2. SQL 실행
#         executor = SQLExecutor()
#         df = executor.execute_with_retry(query)

#         # 3. 결과 반환
#         return {
#             "query": query,
#             "data": df.to_dict(orient="records"),
#             "chart": chart_spec  # 프론트에서 Vega-Lite 등으로 시각화 가능
#         }

#     except Exception as e:
#         logging.exception("❌ 처리 실패:")
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/api/insight")
# def generate_insight(request: InsightRequest):
#     try:
#         prompt = get_prompt_for_insight(request)
#         result = llm.invoke(prompt)
#         return {"insight": result}

#     except Exception as e:
#         logging.exception("❌ 인사이트 생성 실패:")
#         raise HTTPException(status_code=500, detail=str(e))