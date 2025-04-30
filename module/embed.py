# 1. 필수 패키지 설치 필요
# pip install langchain pinecone-client transformers sentence-transformers openai

import os
from dotenv import load_dotenv

from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Pinecone
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI  # 또는 HuggingFaceHub 등 대체 가능
# from pinecone import Pinecone, ServerlessSpec
import pinecone

import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

load_dotenv()

logging.info("📦 문서 임베딩 및 Pinecone 업로드 시작")

# ----------------------------
# 2. Pinecone 초기화
# ----------------------------

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("❌ PINECONE_API_KEY가 설정되어 있지 않습니다")
pinecone.init(
    api_key=PINECONE_API_KEY,      
    # environment="YOUR_PINECONE_ENV"      # "us-west4-gcp"
)
index_name = "schema-index"             # 인덱스 이름

logging.info("📦 Pinecone 초기화")

# ----------------------------
# 3. 문서 로드 및 출처 메타데이터 추가
# ----------------------------
text_files = ["card_members.txt", "card_credit.txt", "card_sales.txt"]  # 다중 문서 목록
docs = []

for file_path in text_files:
    logging.info(f"📄 문서 로드 중: {file_path}")
    loader = TextLoader(file_path, encoding="utf-8")
    loaded_docs = loader.load()
    for doc in loaded_docs:
        doc.metadata["source"] = os.path.basename(file_path)
    docs.extend(loaded_docs)

# ----------------------------
# 4. 문서 분할 (chunk 단위)
# ----------------------------
logging.info("✂️ 문서 chunk 분할 중...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

# ----------------------------
# 5. KURE-v1 임베딩 (Hugging Face 모델 사용)
# ----------------------------
logging.info("🔍 KURE 임베딩 생성 중...")
embedding = HuggingFaceEmbeddings(
    model_name="nlpai-lab/KURE-v1",
    model_kwargs={"device": "cpu"},  # GPU 사용 가능 시 "cuda"
    encode_kwargs={"normalize_embeddings": True}
)

# ----------------------------
# 6. Pinecone에 업로드
# ----------------------------
logging.info("📡 Pinecone에 벡터 업로드 중...")
vectorstore = Pinecone.from_documents(
    documents=splits,
    embedding=embedding,
    index_name=index_name
)

logging.info("✅ 모든 작업 완료: 문서 임베딩 → Pinecone 업로드 완료")


# # ----------------------------
# # 7. 질의 → 문서 검색 → 답변 생성
# # ----------------------------
# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# qa_chain = RetrievalQA.from_chain_type(
#     llm=OpenAI(temperature=0),  # 🔑 OpenAI API 키가 환경변수로 설정되어 있어야 함
#     retriever=retriever,
#     return_source_documents=True
# )

# # ----------------------------
# # 8. 예시 질의 실행
# # ----------------------------
# query = "VIP 고객 중 최근 3개월간 카드론을 많이 쓴 사람은?"
# result = qa_chain.run(query)

# # ----------------------------
# # 9. 결과 출력
# # ----------------------------
# print("\n[답변]:")
# print(result)

# print("\n[참고된 문서 출처]:")
# for doc in qa_chain.last_run["source_documents"]:
#     print("-", doc.metadata.get("source"))
