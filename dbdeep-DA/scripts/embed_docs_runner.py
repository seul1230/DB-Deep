import os
import logging
from uuid import uuid4
from typing import List
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.embeddings import HuggingFaceEmbeddings

from config.settings import settings
from db.pinecone import get_vectorstore

def embed_and_upload_documents(
    root_dir: str = "assets/RAG_docs",
    text_files: List[str] = None,
    index_name: str = "schema-index",
    embedding_model_name: str = "nlpai-lab/KURE-v1"
):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    logging.info("📦 문서 임베딩 시작")

    if text_files is None:
        text_files = ["hr_dataset_description.txt", "card_dataset_description.txt", "business_term.txt", "bigquery_sql.txt"]

    document_types = {
        "hr_dataset_description.txt": "hr_schema_description",
        "business_term.txt": "business_term",
        "card_dataset_description.txt": "card_schema_description",
        "bigquery_sql.txt": "sql_guide"
    }

    # ----------------------------
    #  문서 로드 및 출처 메타데이터 추가
    # ----------------------------
    docs = []
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
        model_name=embedding_model_name,
        model_kwargs={"device": "cpu"},
        # encode_kwargs={"normalize_embeddings": True}
    )

    # ----------------------------
    #  Pinecone 초기화
    # ----------------------------
    vectorstore = get_vectorstore(index_name=index_name, model_name=embedding_model_name)

    # ----------------------------
    #  Pinecone에 업로드
    # ----------------------------
    logging.info("📡 Pinecone에 벡터 업로드 중...")

    documents = [Document(page_content=d.page_content, metadata=d.metadata) for d in splits]
    ids = [str(uuid4()) for _ in documents]
    vectorstore.add_documents(documents=documents, ids=ids)

    logging.info("✅ 임베딩 및 업로드 완료")


if __name__ == "__main__":
    embed_and_upload_documents(index_name="schema-index-v3")
    # embed_and_upload_documents(index_name="kanana-index", embedding_model_name="kakaocorp/kanana-nano-2.1b-embedding")
