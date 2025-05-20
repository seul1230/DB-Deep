import json
import logging
from typing import Tuple, Any

from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder


from llm.gemini import GeminiSyncViaGMS, GeminiStreamingViaGMS
from db.pinecone import get_vectorstore
from modules.chat_summary import summarize_history_if_needed
from prompts.question_clf_prompt import get_question_classification_prompt, get_follow_up_prompt
from prompts.sql_prompt import get_prompt_for_sql
from prompts.chart_prompt import get_prompt_for_chart, get_prompt_for_chart_summary
from prompts.insight_prompt import get_prompt_for_insight

def build_question_clf_chain(question: str) -> tuple:
    logging.info("🤖 질문 분류 체인 구성 시작")

    llm = GeminiSyncViaGMS()
    prompt = get_question_classification_prompt()

    chain = (
        {
            "user_question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: summarize_history_if_needed(x.get("chat_history", "")))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain

def build_follow_up_chain(question: str, chat_history: str, custom_dict: dict) -> str:
    prompt = f"""
당신은 사용자의 질문 흐름을 이해하는 AI 비서입니다.

아래 대화 맥락과 최근 질문을 바탕으로 사용자의 질문에 자연스럽게 이어지는 답변을 제공하세요. 
단, 질문이 데이터 분석이나 SQL 실행이 필요하지 않은 follow-up이라면 친절하고 간결하게 텍스트로만 답변하세요.

[대화 내역]
{chat_history}

[사용자의 현재 질문]
{question}

[사용자별 용어 사전]
{custom_dict}

[답변]
"""
    llm = GeminiStreamingViaGMS()
    response = llm.invoke(prompt)
    return response

with open("assets/RAG_docs/bigquery_sql.txt", "r", encoding="utf-8") as f:
    STATIC_SQL_GUIDE = f.read()
    
with open("assets/RAG_docs/card_schema_json.txt", "r", encoding="utf-8") as f:
    STATIC_CARD_SCHEMA = f.read()

def build_sql_chain(question: str, user_department: str, custom_dict: dict) -> Tuple[Any, dict]:
    
    logging.info("📥 RAG 체인 구성 시작")
    vectorstore = get_vectorstore(index_name="schema-index-v2")
    
    hr_schema_retriever = vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3, "filter": {"type": {"$in": ["hr_schema_description"]}}}
    )
    
    card_schema_retriever = vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 5, "filter": {"type": {"$in": ["card_schema_description"]}}}
    )

    term_retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "filter": {"type": {"$in": ["business_term"]}}}
    )

    # Reranker + Retriever 압축기 구성
    model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
    compressor = CrossEncoderReranker(model=model, top_n=5)

    hr_schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=hr_schema_retriever
    )
    
    card_schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=card_schema_retriever
    )
    
    term_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=term_retriever
    )
    
    hr_schema_json = """{
        "tables": [
            {
            "table_name": "dim_employee",
            "description": "직원 기본 정보 및 조직 정보",
            "fields": [
                {"name": "employee_id", "is_code": False, "description": "직원 고유 ID"},
                {"name": "name", "is_code": False, "description": "직원 이름"},
                {"name": "gender", "is_code": True, "description": "성별 (남/여)"},
                {"name": "birth_date", "is_code": False, "description": "생년월일"},
                {"name": "employment_status", "is_code": True, "description": "고용 상태 (재직/퇴사)"},
                {"name": "hire_date", "is_code": False, "description": "입사일"},
                {"name": "resignation_date", "is_code": False, "description": "퇴사일"},
                {"name": "is_resigned", "is_code": True, "description": "퇴사 여부 (0: 재직, 1: 퇴사)"},
                {"name": "is_married", "is_code": True, "description": "결혼 여부 (0: 미혼, 1: 기혼)"},
                {"name": "department_id", "is_code": True, "description": "부서 ID (외래키)"},
                {"name": "position_id", "is_code": True, "description": "직급 ID (외래키)"},
                {"name": "manager_id", "is_code": False, "description": "상위 매니저 ID"},
                {"name": "address", "is_code": False, "description": "주소"},
                {"name": "recruitment_source", "is_code": True, "description": "채용 경로 (예: 추천, 공채)"}
            ]
            },
            {
            "table_name": "dim_position",
            "description": "직급 정보",
            "fields": [
                {"name": "position_id", "is_code": True, "description": "직급 ID"},
                {"name": "position_name", "is_code": False, "description": "직급명 (사원, 주임 등)"}
            ]
            },
            {
            "table_name": "dim_department",
            "description": "부서 정보",
            "fields": [
                {"name": "department_id", "is_code": True, "description": "부서 고유 ID"},
                {"name": "department_name", "is_code": False, "description": "부서 이름"},
                {"name": "location", "is_code": False, "description": "부서 위치"}
            ]
            },
            {
            "table_name": "dim_date",
            "description": "날짜 차원 테이블",
            "fields": [
                {"name": "date_id", "is_code": True, "description": "날짜 고유 ID"},
                {"name": "full_date", "is_code": False, "description": "실제 날짜"},
                {"name": "year", "is_code": False, "description": "연도"},
                {"name": "month", "is_code": False, "description": "월"},
                {"name": "quarter", "is_code": False, "description": "분기"},
                {"name": "day_of_week", "is_code": True, "description": "요일 (월요일 ~ 일요일)"}
            ]
            },
            {
            "table_name": "fact_salary",
            "description": "직원 연봉 데이터",
            "fields": [
                {"name": "salary_id", "is_code": False, "description": "연봉 기록 고유 ID"},
                {"name": "employee_id", "is_code": True, "description": "직원 ID"},
                {"name": "date_id", "is_code": True, "description": "날짜 ID"},
                {"name": "salary_amount", "is_code": False, "description": "연봉 금액"}
            ]
            },
            {
            "table_name": "fact_bonus",
            "description": "직원 상여금 정보",
            "fields": [
                {"name": "employee_id", "is_code": True, "description": "직원 ID"},
                {"name": "date_id", "is_code": True, "description": "지급일"},
                {"name": "bonus_amount", "is_code": False, "description": "상여금"},
                {"name": "bonus_id", "is_code": False, "description": "보너스 레코드 ID"},
                {"name": "remark", "is_code": False, "description": "비고"}
            ]
            },
            {
            "table_name": "fact_attendance",
            "description": "근태 정보",
            "fields": [
                {"name": "attendance_id", "is_code": False, "description": "출결 ID"},
                {"name": "employee_id", "is_code": True, "description": "직원 ID"},
                {"name": "date_id", "is_code": True, "description": "날짜 ID"},
                {"name": "check_in_time", "is_code": False, "description": "출근 시각"},
                {"name": "check_out_time", "is_code": False, "description": "퇴근 시각"},
                {"name": "remark", "is_code": True, "description": "출결 특이사항 (정상, 지각 등)"}
            ]
            },
            {
            "table_name": "fact_performance",
            "description": "직원 성과 평가 정보",
            "fields": [
                {"name": "performance_id", "is_code": False, "description": "평가 ID"},
                {"name": "employee_id", "is_code": True, "description": "직원 ID"},
                {"name": "date_id", "is_code": True, "description": "평가일"},
                {"name": "score", "is_code": False, "description": "평가 점수 (1~5)"},
                {"name": "content", "is_code": False, "description": "평가 코멘트"}
            ]
            },
            {
            "table_name": "fact_department_performance",
            "description": "부서 단위 분기별 평가 결과",
            "fields": [
                {"name": "id", "is_code": False, "description": "부서 평가 레코드 ID"},
                {"name": "department_id", "is_code": True, "description": "부서 ID"},
                {"name": "date_id", "is_code": True, "description": "평가일"},
                {"name": "score", "is_code": False, "description": "평가 점수"},
                {"name": "content", "is_code": True, "description": "평가 형태 (상승 곡선 등)"}
            ]
            },
            {
            "table_name": "dim_survey_question",
            "description": "직원 만족도 설문 문항 정의",
            "fields": [
                {"name": "question_id", "is_code": True, "description": "문항 ID"},
                {"name": "question_text", "is_code": False, "description": "문항 내용"}
            ]
            },
            {
            "table_name": "fact_survey_response",
            "description": "설문 응답 결과",
            "fields": [
                {"name": "response_id", "is_code": False, "description": "응답 ID"},
                {"name": "employee_id", "is_code": True, "description": "직원 ID"},
                {"name": "date_id", "is_code": True, "description": "설문일"},
                {"name": "question_id", "is_code": True, "description": "문항 ID"},
                {"name": "score", "is_code": False, "description": "응답 점수"},
                {"name": "comment", "is_code": False, "description": "의견"}
            ]
            }
        ]
    }"""

    llm = GeminiSyncViaGMS()

    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: summarize_history_if_needed(x.get("chat_history", ""))),
            "user_department": RunnableLambda(lambda x: x.get("user_department", "없음")),
            "hr_schema": RunnableLambda(lambda x: hr_schema_retriever_compression.invoke(x["question"])),
            "card_schema": RunnableLambda(lambda x: card_schema_retriever_compression.invoke(x["question"])),
            "context_term": RunnableLambda(lambda x: term_retriever_compression.invoke(x["question"])),
            "context_sql": RunnableLambda(lambda x: STATIC_SQL_GUIDE),
            "card_schema_json_str" : RunnableLambda(lambda x: json.dumps(STATIC_CARD_SCHEMA, indent=4, ensure_ascii=False)),
            "hr_schema_json_str": RunnableLambda(lambda x: json.dumps(hr_schema_json, indent=4, ensure_ascii=False)),
            "custom_dict" : RunnableLambda(lambda x: custom_dict if custom_dict is not None else {})
        }
        | get_prompt_for_sql(user_department)
        | llm
        | StrOutputParser()
    )

    inputs = {
        "question": question,
        "user_department": user_department
    }

    return chain, inputs

def build_chart_chain(question: str, data: list) -> Tuple[Any, dict]:
    logging.info("📊 차트 스펙 생성용 RAG 체인 구성 시작")
        
    llm = GeminiSyncViaGMS()
    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "data": RunnableLambda(lambda x: x["data"])
        }
        | get_prompt_for_chart_summary()
        | llm
        | StrOutputParser()
    )

    return chain, {
        "question": question,
        "data": json.dumps(data, ensure_ascii=False)
    }

def build_insight_chain(input_dict: dict) -> Tuple[Any, dict]:
    logging.info("🧠 인사이트 요약용 RAG 체인 구성 시작")

    llm = GeminiStreamingViaGMS()
    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "chat_history": RunnableLambda(lambda x: x.get("chat_history", "")),
            "data": RunnableLambda(lambda x: x.get("data", "")),
            "data_summary": RunnableLambda(lambda x: x.get("data_summary", "")),
            "chart_spec": RunnableLambda(lambda x: json.dumps(x["chart_spec"], ensure_ascii=False))
        }
        | get_prompt_for_insight()
        | llm
        | StrOutputParser()
    )

    return chain, input_dict


def build_follow_up_chain():
    llm = GeminiStreamingViaGMS()
    prompt = get_follow_up_prompt()
    
    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: x.get("chat_history", ""))
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain