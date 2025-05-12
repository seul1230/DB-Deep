import os
import logging
from uuid import uuid4
from dotenv import load_dotenv

from config.setup import init_pinecone
from llm.gemini import GeminiEmbeddingViaGMS

from pinecone import Pinecone, ServerlessSpec
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore 
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logging.info("📦 문서 임베딩 및 Pinecone 업로드 시작")

# ----------------------------
#  Pinecone 초기화
# ----------------------------

init_pinecone()

index_name = "schema-index" # "schema-index-google", "schema-index"
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
if index_name not in pc.list_indexes().names():
    dimension = 1024 if index_name=="schema-index" else 768
    pc_index = pc.create_index(
        name=index_name,
        dimension=dimension,  # 모델에 맞는 차원으로 설정 (예: 384, 768, 1536 등)
        metric="cosine",
        spec=ServerlessSpec(
            cloud="gcp",
            region=os.environ.get("PINECONE_ENV", "us-east-1")
        )
    )
    
index = pc.Index(index_name)
logging.info("📦 Pinecone 초기화")

# ----------------------------
#  문서 로드 및 출처 메타데이터 추가
# ----------------------------
root_dir = "assets/RAG_docs"
# text_files = ["1.card_members.txt", "2.card_credit.txt", "3.card_sales.txt"]  # 다중 문서 목록
text_files = ["hr_dataset_description.txt", "business_term.txt", "bigquery_sql.txt"]

document_types = {
    "hr_dataset_description.txt": "schema_description",
    "business_term.txt": "business_term",
    "bigquery_sql.txt": "sql_guide"
}

docs = []

# for file_path in text_files:
#     logging.info(f"📄 문서 로드 중: {file_path}")
#     loader = TextLoader(f"{root_dir}/{file_path}", encoding="utf-8")
#     loaded_docs = loader.load()
#     for doc in loaded_docs:
#         doc.metadata["source"] = os.path.basename(file_path)
#     docs.extend(loaded_docs)

for filename, doc_type in document_types.items():
    filepath = os.path.join(root_dir, filename)
    logging.info(f"📄 문서 로드 중: {filename}")
    loader = TextLoader(filepath, encoding="utf-8")
    loaded_docs = loader.load()
    for doc in loaded_docs:
        doc.metadata["source"] = filename
        doc.metadata["type"] = doc_type
    docs.extend(loaded_docs)

# ----------------------------
#  문서 분할 (chunk 단위)
# ----------------------------
logging.info("✂️ 문서 chunk 분할 중...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
splits = text_splitter.split_documents(docs)

logging.info(f"🔢 총 split 문서 수: {len(splits)}")


# ----------------------------
#  KURE-v1 임베딩 (Hugging Face 모델 사용)
# ----------------------------
logging.info("🔍 임베딩 생성 중...")

embedding = HuggingFaceEmbeddings(
    model_name="nlpai-lab/KURE-v1",
    model_kwargs={"device": "cpu"},  # GPU 사용 가능 시 "cuda"
    encode_kwargs={"normalize_embeddings": True}
)

# embedding = GeminiEmbeddingViaGMS(api_key=os.environ["GEMINI_API_KEY"])


# ----------------------------
#  Pinecone에 업로드
# ----------------------------
logging.info("📡 Pinecone에 벡터 업로드 중...")

documents = [
    Document(page_content=doc.page_content, metadata=doc.metadata)
    for doc in splits
]
ids = [str(uuid4()) for _ in documents]

vectorstore = PineconeVectorStore(index=index, embedding=embedding)
vectorstore.add_documents(documents=documents, ids=ids)

logging.info("✅ 모든 작업 완료: 문서 임베딩 → Pinecone 업로드 완료")

