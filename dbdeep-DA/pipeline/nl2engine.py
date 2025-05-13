import os
import re
import json
import logging
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_huggingface import HuggingFaceEmbeddings

from llm.gemini import GeminiStreamingViaGMS, GeminiSyncViaGMS, GeminiEmbeddingViaGMS
from modules.chat_summary import summarize_history_if_needed
from pipeline.prompt_templates import get_prompt_for_sql, get_prompt_for_chart, get_prompt_for_insight, get_prompt_for_chart_summary

from config.setup import init_pinecone
from pipeline.sql_process import clean_sql_from_response, clean_json_from_response, SQLExecutor

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


# 환경 변수
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_API_BASE = os.environ["GEMINI_API_BASE"]

# Pinecone 클라이언트
pc = init_pinecone()

import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)  # 또는 int(o) if o == int(o) else float(o)
        return super().default(o)
    
# -----------------------------------------------
#  1. NL2SQL - RAG 체인 구성 함수
# -----------------------------------------------

with open("assets/RAG_docs/bigquery_sql.txt", "r", encoding="utf-8") as f:
    STATIC_SQL_GUIDE = f.read()

def set_rag_chain_for_sql(question, user_department, vectorstore):
    logging.info("📥 RAG 체인 구성 시작")

    # Pinecone + Embedding
    logging.info("🔗 Pinecone VectorStore 초기화 중...")

    schema_retriever = vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3, "filter": {"type": {"$in": ["schema_description", "sql_guide"]}}}
    )
    
    # sql_retriever = vectorstore.as_retriever(
    #     search_type="mmr",
    #     search_kwargs={"k": 5, "filter": {"type": {"$in": ["schema_description", "sql_guide"]}}}
    # )
    
    term_retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "filter": {"type": {"$in": ["business_term"]}}}
    )

    # Reranker + Retriever 압축기 구성
    model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
    compressor = CrossEncoderReranker(model=model, top_n=3)

    schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=schema_retriever
    )
    
    # sql_retriever_compression = ContextualCompressionRetriever(
    #     base_compressor=compressor,
    #     base_retriever=sql_retriever
    # )
    
    term_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=term_retriever
    )

    # Gemini LLM
    logging.info("🤖 Gemini LLM 초기화 중...")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE")
    
    llm = GeminiSyncViaGMS(api_key=GEMINI_API_KEY, api_base=GEMINI_API_BASE)

    # 체인 정의
    # "question", "chat_history", "user_department", "context_schema"
    rag_chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: summarize_history_if_needed(x.get("chat_history", ""))),
            "user_department": RunnableLambda(lambda x: x.get("user_department", "없음")),
            "context_schema": RunnableLambda(lambda x: schema_retriever_compression.invoke(x["question"])),
            "context_term": RunnableLambda(lambda x: term_retriever_compression.invoke(x["question"])),
            "context_sql": RunnableLambda(lambda x: STATIC_SQL_GUIDE)
        }
        | get_prompt_for_sql(user_department)
        | llm
        | StrOutputParser()
    )
    
    inputs = {
        "question": question,
        "user_department": user_department
    }

    return rag_chain, inputs


# -----------------------------------------------
#  2. NL2SQL - SQL validation & Run BigQuery
# -----------------------------------------------

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


# -----------------------------------------------
#  3. NL2Chart 
# -----------------------------------------------

def set_rag_chain_for_chart(question, data):
    logging.info("📊 차트 스펙 생성용 RAG 체인 구성 시작")

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE")

    llm = GeminiSyncViaGMS(api_key=GEMINI_API_KEY, api_base=GEMINI_API_BASE)

    # prompt = get_prompt_for_chart()
    prompt = get_prompt_for_chart_summary()

    chart_chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "data": RunnableLambda(lambda x: x["data"]),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    inputs = {
        "question": question,
        "data": json.dumps(data, cls=DecimalEncoder, ensure_ascii=False)
    }

    return chart_chain, inputs


# -----------------------------------------------
#  4. Insight
# -----------------------------------------------

def set_rag_chain_for_insight(input_dict):
    logging.info("🧠 인사이트 요약용 RAG 체인 구성 시작")

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE")

    llm = GeminiSyncViaGMS(api_key=GEMINI_API_KEY, api_base=GEMINI_API_BASE)

    prompt = get_prompt_for_insight()  # ChatPromptTemplate 형태

    insight_chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "chat_history": RunnableLambda(lambda x: x.get("chat_history", "")),
            "data_summary": RunnableLambda(lambda x: x.get("data_summary", "")),
            # "data": RunnableLambda(lambda x: json.dumps(x["data"], cls=DecimalEncoder, ensure_ascii=False)),
            "chart_spec": RunnableLambda(lambda x: json.dumps(x["chart_spec"], cls=DecimalEncoder, ensure_ascii=False))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return insight_chain, input_dict


# -----------------------------------------------
#  Run Functions
# -----------------------------------------------

def run_nl2sql(question="성과가 부진한 부서의 성과급을 조금 조정해야할 것 같아. 얼마 정도가 적당할까?", user_department="인사팀", max_retry: int = 3, index_name="schema-index"):
    from pinecone import Pinecone
    from langchain_pinecone import PineconeVectorStore
    from langchain.embeddings import HuggingFaceEmbeddings

    # 환경변수에서 API 정보 불러오기
    PINECONE_API_KEY = os.environ["PINECONE_API_KEY"]

    # Pinecone 클라이언트 및 인덱스 로드
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(index_name)

    if index_name=="schema-index":
        # HuggingFace 임베딩 로드
        embedding = HuggingFaceEmbeddings(
            model_name="nlpai-lab/KURE-v1",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
    else:
        embedding = GeminiEmbeddingViaGMS(api_key=os.environ["GEMINI_API_KEY"])

    # 기존 인덱스에 연결된 벡터스토어 불러오기
    schema_vectorstore = PineconeVectorStore(
        index=index,
        embedding=embedding,
    )

    # RAG 체인 실행
    rag_chain, inputs = set_rag_chain_for_sql(question, user_department, schema_vectorstore)
    result_dict = None
    for attempt in range(max_retry):
        try:
            logging.info(f"🚀 SQL 생성 시도 (시도 {attempt+1})...")
            
            answer = rag_chain.invoke(inputs)
            print("\n[최종 응답]")
            print(answer, end="\n")
            
            result_dict = run_bigquery(question, answer)
            
            if result_dict.get("data") is not None and result_dict.get("data")!=[]:
                print(result_dict)
                break  # ✅ 성공하면 반복 중단
            
        except Exception as e:
            logging.warning(f"❌ SQL 검증 및 실행 실패 (시도 {attempt+1}): {e}")
            if attempt == max_retry - 1:
                raise RuntimeError("❌ 모든 재시도 실패: SQL 실행 불가")

    return result_dict


def run_nl2chartInfo(result_dict, user_department):
    try:
        logging.info("📈 차트 정보 생성 중...")
        
        question = result_dict.get("question")
        data = result_dict.get("data")

        chart_chain, inputs = set_rag_chain_for_chart(question, data)
        response_text = chart_chain.invoke(inputs)
        print(response_text)
        
        text_match = re.search(r"```text\s*(.*?)```", response_text, re.DOTALL)
        text_block = text_match.group(1).strip() if text_match else ""
        print(text_block)
        
        chart_spec_raw = clean_json_from_response(response_text)
        chart_spec = None
        
        try:
            chart_spec = json.loads(chart_spec_raw)
        except Exception as e:
            logging.warning(f"⚠️ JSON 파싱 실패: {e}")

        print("\n[차트 JSON 출력]")
        print(json.dumps(chart_spec, indent=2, cls=DecimalEncoder, ensure_ascii=False))
        
        return {
            "question": result_dict["question"],
            "sql_query": result_dict["sql_query"],
            "user_department": user_department,
            "data": result_dict["data"],
            "data_summary": text_block,
            "chart_spec": chart_spec
        }

    except Exception as e:
        logging.exception("❌ 차트 JSON 생성 실패:")
        return None

def run_nl2insight(result_dict):
    try:
        insight_chain, inputs = set_rag_chain_for_insight(result_dict)
        insight_text = insight_chain.invoke(inputs)

        print("\n📌 인사이트 요약 결과:")
        print(insight_text)

        return insight_text

    except Exception as e:
        logging.exception("❌ 인사이트 생성 실패:")
        return None


if __name__ == "__main__":
    
    user_department = "인사팀"
    question = "성과가 부진한 부서의 성과급을 조금 조정해야할 것 같아. 얼마 정도가 적당할까?"
    result_dict = run_nl2sql(question=question, user_department=user_department, max_retry=5)
    if result_dict is not None and result_dict.get("data") is not None:
        input_dict = run_nl2chartInfo(result_dict, user_department)
        if input_dict is not None:
            run_nl2insight(input_dict)
            
