from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rag_chain import set_rag_chain, get_prompt_for_insight
from utils.sql_utils import clean_sql_from_response, clean_json_from_response, SQLExecutor

import pinecone
import logging
import re
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Pinecone 초기화
pinecone.init(
    api_key=os.environ.get("PINECONE_API_KEY"),
    environment=os.environ.get("PINECONE_ENV")
)
pc = pinecone

# 요청 데이터 모델
class QueryRequest(BaseModel):
    question: str
    department: str



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
            "chart": chart_spec  # 프론트에서 Vega-Lite 등으로 시각화 가능
        }

    except Exception as e:
        logging.exception("❌ 처리 실패:")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/insight")
def generate_insight(request: InsightRequest):
    try:
        prompt = get_prompt_for_insight(request)
        result = llm.invoke(prompt)
        return {"insight": result}

    except Exception as e:
        logging.exception("❌ 인사이트 생성 실패:")
        raise HTTPException(status_code=500, detail=str(e))