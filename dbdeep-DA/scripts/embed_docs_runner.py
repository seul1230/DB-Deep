import os
import logging
from uuid import uuid4
from typing import List
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from config.settings import settings

def embed_and_upload_documents(
    root_dir: str = "assets/RAG_docs",
    text_files: List[str] = None,
    index_name: str = "schema-index",
    embedding_model_name: str = "nlpai-lab/KURE-v1"
):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    logging.info("📦 문서 임베딩 시작")

    if text_files is None:
        text_files = ["hr_dataset_description.txt", "business_term.txt", "bigquery_sql.txt"]

    document_types = {
        "hr_dataset_description.txt": "schema_description",
        "business_term.txt": "business_term",
        "bigquery_sql.txt": "sql_guide"
    }

    # 1. 문서 로드
    docs = []
    for filename in text_files:
        filepath = os.path.join(root_dir, filename)
        logging.info(f"📄 문서 로드 중: {filename}")
        loader = TextLoader(filepath, encoding="utf-8")
        for doc in loader.load():
            doc.metadata["source"] = filename
            doc.metadata["type"] = document_types.get(filename, "unknown")
            docs.append(doc)

    # 2. 분할
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    splits = splitter.split_documents(docs)
    logging.info(f"✂️ 분할 완료: {len(splits)}개")

    # 3. 임베딩 생성
    embedding = HuggingFaceEmbeddings(
        model_name=embedding_model_name,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    # 4. Pinecone 연결
    pinecone = Pinecone(api_key=settings.PINECONE_API_KEY)
    if index_name not in pinecone.list_indexes().names():
        pinecone.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="gcp", region=settings.PINECONE_ENV)
        )
    index = pinecone.Index(index_name)

    vectorstore = PineconeVectorStore(index=index, embedding=embedding)

    # 5. 업로드
    documents = [Document(page_content=d.page_content, metadata=d.metadata) for d in splits]
    ids = [str(uuid4()) for _ in documents]
    vectorstore.add_documents(documents=documents, ids=ids)

    logging.info("✅ 임베딩 및 업로드 완료")


if __name__ == "__main__":
    embed_and_upload_documents()
