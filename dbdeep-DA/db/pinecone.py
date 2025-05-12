from pinecone import Pinecone, ServerlessSpec
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from config.settings import settings
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_pinecone_client = None

def get_pinecone_client():
    global _pinecone_client
    if _pinecone_client:
        return _pinecone_client

    if not settings.PINECONE_API_KEY:
        raise ValueError("❌ PINECONE_API_KEY 누락됨")

    _pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
    logging.info("✅ Pinecone 클라이언트 초기화 완료")
    return _pinecone_client


def get_vectorstore():
    pc = get_pinecone_client()
    index = pc.Index("schema-index")

    embedding = HuggingFaceEmbeddings(
        model_name="nlpai-lab/KURE-v1",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    return PineconeVectorStore(
        index=index,
        embedding=embedding,
        text_key="text"
    )
