import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경변수에서 URL 읽기
es_url = os.getenv("ELASTICSEARCH_URL")

# Elasticsearch 클라이언트 생성
es = Elasticsearch(es_url)