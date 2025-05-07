import os
import logging
from dotenv import load_dotenv

from config.setup import init_pinecone

from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Pinecone
from langchain.embeddings import HuggingFaceEmbeddings


load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logging.info("📦 문서 임베딩 및 Pinecone 업로드 시작")

# ----------------------------
#  Pinecone 초기화
# ----------------------------

init_pinecone()
index_name = "schema-index"             # 인덱스 이름

logging.info("📦 Pinecone 초기화")

# ----------------------------
#  문서 로드 및 출처 메타데이터 추가
# ----------------------------
text_files = ["1.card_members.txt", "2.card_credit.txt", "3.card_sales.txt"]  # 다중 문서 목록
docs = []

for file_path in text_files:
    logging.info(f"📄 문서 로드 중: {file_path}")
    loader = TextLoader(file_path, encoding="utf-8")
    loaded_docs = loader.load()
    for doc in loaded_docs:
        doc.metadata["source"] = os.path.basename(file_path)
    docs.extend(loaded_docs)

# ----------------------------
#  문서 분할 (chunk 단위)
# ----------------------------
logging.info("✂️ 문서 chunk 분할 중...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

# ----------------------------
#  KURE-v1 임베딩 (Hugging Face 모델 사용)
# ----------------------------
logging.info("🔍 KURE 임베딩 생성 중...")
embedding = HuggingFaceEmbeddings(
    model_name="nlpai-lab/KURE-v1",
    model_kwargs={"device": "cpu"},  # GPU 사용 가능 시 "cuda"
    encode_kwargs={"normalize_embeddings": True}
)

# ----------------------------
#  Pinecone에 업로드
# ----------------------------
logging.info("📡 Pinecone에 벡터 업로드 중...")
vectorstore = Pinecone.from_documents(
    documents=splits,
    embedding=embedding,
    index_name=index_name
)

logging.info("✅ 모든 작업 완료: 문서 임베딩 → Pinecone 업로드 완료")

