import os
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
from pipeline.propmt_templates import get_prompt_for_sql, get_prompt_for_chart, get_prompt_for_insight

from config.setup import init_pinecone
from pipeline.sql_process import clean_sql_from_response, clean_json_from_response, SQLExecutor

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# -----------------------------------------------
#  1. NL2SQL - RAG 체인 구성 함수
# -----------------------------------------------

def set_rag_chain_for_sql(question, user_department, schema_vectorstore):
    logging.info("📥 RAG 체인 구성 시작")

    # Pinecone + Embedding
    logging.info("🔗 Pinecone VectorStore 초기화 중...")

    schema_retriever = schema_vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3}
    )

    # Reranker + Retriever 압축기 구성
    model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
    compressor = CrossEncoderReranker(model=model, top_n=3)

    schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=schema_retriever
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
            "chat_history": RunnableLambda(lambda x: ""),  # 현재 대화 기록이 없으면 빈 문자열
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "context_schema": RunnableLambda(lambda x: schema_retriever_compression.invoke(x["question"]))
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
#  NL2Chart 
# -----------------------------------------------

def set_rag_chain_for_chart(question, data):
    logging.info("📊 차트 스펙 생성용 RAG 체인 구성 시작")

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_API_BASE = os.environ.get("GEMINI_API_BASE")

    llm = GeminiSyncViaGMS(api_key=GEMINI_API_KEY, api_base=GEMINI_API_BASE)

    prompt = get_prompt_for_chart()  # get_prompt_for_chart()로 정의된 프롬프트 함수

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
        "data": json.dumps(data, ensure_ascii=False)  # 데이터는 JSON 문자열로 넘김
    }

    return chart_chain, inputs


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
            
            if result_dict.get("data") is not None or result_dict.get("data")==[]:
                print(result_dict)
                break  # ✅ 성공하면 반복 중단
            
        except Exception as e:
            logging.warning(f"❌ SQL 검증 및 실행 실패 (시도 {attempt+1}): {e}")
            if attempt == max_retry - 1:
                raise RuntimeError("❌ 모든 재시도 실패: SQL 실행 불가")

    return result_dict


def run_nl2chartInfo(result_dict):
    try:
        logging.info("📈 차트 정보 생성 중...")
        
        question = result_dict.get("question")
        data = result_dict.get("data")

        chart_chain, inputs = set_rag_chain_for_chart(question, data)
        response_text = chart_chain.invoke(inputs)
        
        chart_spec_raw = clean_json_from_response(response_text)
        chart_spec = None
        
        try:
            chart_spec = json.loads(chart_spec_raw)
        except Exception as e:
            logging.warning(f"⚠️ JSON 파싱 실패: {e}")

        print("\n[차트 JSON 출력]")
        print(json.dumps(chart_spec, indent=2, ensure_ascii=False))
        return chart_spec

    except Exception as e:
        logging.exception("❌ 차트 JSON 생성 실패:")
        return None

if __name__ == "__main__":
    result_dict = run_nl2sql(max_retry=5)
    if result_dict is not None:
        run_nl2chartInfo(result_dict)
