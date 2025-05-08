import os
import logging
from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_pinecone_client = None

def init_pinecone():
    global _pinecone_client
    if _pinecone_client:
        return _pinecone_client

    api_key = os.environ.get("PINECONE_API_KEY")
    if not api_key:
        raise ValueError("❌ PINECONE_API_KEY 누락됨")

    _pinecone_client = Pinecone(api_key=api_key)
    logging.info("✅ Pinecone 클라이언트 초기화 완료")
    return _pinecone_client
