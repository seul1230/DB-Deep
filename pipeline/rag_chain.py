import os
import json
import logging
from dotenv import load_dotenv

from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

from langchain_pinecone import PineconeVectorStore

from llm.gemini import GeminiViaGMS
from pipeline.propmt_templates import get_prompt, get_prompt_for_insight

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# ----------------------------
# RAG 체인 구성 함수
# ----------------------------

def set_rag_chain(question, user_department, pc):
    logging.info("📥 RAG 체인 구성 시작")

    # Pinecone + Embedding
    logging.info("🔗 Pinecone VectorStore 초기화 중...")
    embedding = HuggingFaceEmbeddings(
        model_name="nlpai-lab/KURE-v1",
        model_kwargs={"device": "cpu"},  # GPU 사용 가능 시 "cuda"
        encode_kwargs={"normalize_embeddings": True}
    )

    schema_vectorstore = PineconeVectorStore(
        index=pc.Index("schema-index"),
        embedding=embedding
    )

    schema_retriever = schema_vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3}
    )

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
    
    llm = GeminiViaGMS("gemini-2.0-flash-lite", api_key=GEMINI_API_KEY, api_base=GEMINI_API_BASE)

    # 체인 정의
    rag_chain = (
        {
            "chat_history": RunnableLambda(lambda x: user_department),
            "context_schema": schema_retriever_compression,
            "question": RunnablePassthrough()
        }
        | get_prompt(user_department)
        | llm
        | StrOutputParser()
    )

    answer = rag_chain.invoke(question)

    print("\n[참고된 문서 출처]:")
    for doc in rag_chain.last_run["source_documents"]:
        print("-", doc.metadata.get("source"))

    return answer

