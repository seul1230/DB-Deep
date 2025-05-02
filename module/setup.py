import os
import pinecone
from dotenv import load_dotenv

load_dotenv()

# Pinecone 초기화 함수 (모든 모듈에서 import 가능)
def init_pinecone():
    api_key = os.environ.get("PINECONE_API_KEY")
    environment = os.environ.get("PINECONE_ENV")
    if not api_key or not environment:
        raise ValueError("❌ PINECONE_API_KEY 또는 PINECONE_ENV 누락됨")
    pinecone.init(api_key=api_key, environment=environment)
    return pinecone
