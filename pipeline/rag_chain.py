import os
import json
import logging
from dotenv import load_dotenv

from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_huggingface import HuggingFaceEmbeddings

from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

from llm.gemini import GeminiStreamingViaGMS, GeminiSyncViaGMS
from pipeline.propmt_templates import get_prompt, get_prompt_for_insight

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# ----------------------------
# RAG 체인 구성 함수
# ----------------------------

def set_rag_chain(question, user_department, schema_vectorstore):
    logging.info("📥 RAG 체인 구성 시작")

    # Pinecone + Embedding
    logging.info("🔗 Pinecone VectorStore 초기화 중...")
    embedding = HuggingFaceEmbeddings(
        model_name="nlpai-lab/KURE-v1",
        model_kwargs={"device": "cpu"},  # GPU 사용 가능 시 "cuda"
        encode_kwargs={"normalize_embeddings": True}
    )

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
    rag_chain = (
        {
            "chat_history": RunnableLambda(lambda x: ""),  # 현재 대화 기록이 없으면 빈 문자열
            "context_schema": RunnableLambda(lambda x: schema_retriever_compression.invoke(x["question"])),
            "question": RunnableLambda(lambda x: x["question"]),
            "user_department": RunnableLambda(lambda x: x["user_department"])
        }
        | get_prompt(user_department)
        | llm
        | StrOutputParser()
    )
    
    inputs = {
        "question": question,
        "user_department": user_department,
    }

    answer = rag_chain.invoke(inputs)

    # print("\n[참고된 문서 출처]:")
    # for doc in rag_chain.last_run["source_documents"]:
    #     print("-", doc.metadata.get("source"))

    return answer

def run():
    from pinecone import Pinecone
    from langchain_pinecone import PineconeVectorStore
    from langchain.embeddings import HuggingFaceEmbeddings

    # 환경변수에서 API 정보 불러오기
    PINECONE_API_KEY = os.environ["PINECONE_API_KEY"]
    PINECONE_ENV = os.environ.get("PINECONE_ENV", "us-east-1")  # 기본값 설정
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    GEMINI_API_BASE = os.environ["GEMINI_API_BASE"]

    # Pinecone 클라이언트 및 인덱스 로드
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index("schema-index")

    # HuggingFace 임베딩 로드
    embedding = HuggingFaceEmbeddings(
        model_name="nlpai-lab/KURE-v1",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # 기존 인덱스에 연결된 벡터스토어 불러오기
    schema_vectorstore = PineconeVectorStore(
        index=index,
        embedding=embedding,
        text_key="page_content"
    )

    # RAG 체인 실행
    question = "성과가 부진한 부서의 성과급을 조금 조정해야할 것 같아. 얼마 정도가 적당할까?"
    user_department = "인사팀"

    answer = set_rag_chain(question, user_department, schema_vectorstore)

    print("\n[최종 응답]")
    print(answer)

if __name__ == "__main__":
    run()
