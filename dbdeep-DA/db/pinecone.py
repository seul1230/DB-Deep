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


def get_vectorstore(index_name: str = "schema-index", model_name: str="nlpai-lab/KURE-v1", dimension : int = 1024):
    pc = get_pinecone_client()
    
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud="gcp", region=settings.PINECONE_ENV)
        )
    
    index = pc.Index(index_name)

    embedding = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": "cpu"},
        # encode_kwargs={"normalize_embeddings": True}
    )

    return PineconeVectorStore(
        index=index,
        embedding=embedding,
        text_key="text"
    )
