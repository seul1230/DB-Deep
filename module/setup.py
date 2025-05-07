import os
import pinecone
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_pinecone_initialized = False


def init_pinecone():
    global _pinecone_initialized
    if _pinecone_initialized:
        return pinecone

    api_key = os.environ.get("PINECONE_API_KEY")
    environment = os.environ.get("PINECONE_ENV")
    if not api_key or not environment:
        raise ValueError("❌ PINECONE_API_KEY 또는 PINECONE_ENV 누락됨")

    pinecone.init(api_key=api_key, environment=environment)
    logging.info("✅ 벡터스토어 초기화 완료!")
    _pinecone_initialized = True
    return pinecone
