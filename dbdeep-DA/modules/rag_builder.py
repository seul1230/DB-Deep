import json
import logging
from typing import Tuple, Any

from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder


from llm.gemini import GeminiSyncViaGMS, GeminiStreamingViaGMS
from db.pinecone import get_vectorstore
from modules.chat_summary import summarize_history_if_needed
from prompts.sql_prompt import get_prompt_for_sql
from prompts.chart_prompt import get_prompt_for_chart, get_prompt_for_chart_summary
from prompts.insight_prompt import get_prompt_for_insight

with open("assets/RAG_docs/bigquery_sql.txt", "r", encoding="utf-8") as f:
    STATIC_SQL_GUIDE = f.read()

def build_sql_chain(question: str, user_department: str) -> Tuple[Any, dict]:
    
    logging.info("📥 RAG 체인 구성 시작")
    vectorstore = get_vectorstore()
    
    schema_retriever = vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3, "filter": {"type": {"$in": ["schema_description", "sql_guide"]}}}
    )

    term_retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "filter": {"type": {"$in": ["business_term"]}}}
    )

    # Reranker + Retriever 압축기 구성
    model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
    compressor = CrossEncoderReranker(model=model, top_n=3)

    schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=schema_retriever
    )
    
    term_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=term_retriever
    )

    llm = GeminiSyncViaGMS()

    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: summarize_history_if_needed(x.get("chat_history", ""))),
            "user_department": RunnableLambda(lambda x: x.get("user_department", "없음")),
            "context_schema": RunnableLambda(lambda x: schema_retriever_compression.invoke(x["question"])),
            "context_term": RunnableLambda(lambda x: term_retriever_compression.invoke(x["question"])),
            "context_sql": RunnableLambda(lambda x: STATIC_SQL_GUIDE)
        }
        | get_prompt_for_sql(user_department)
        | llm
        | StrOutputParser()
    )

    inputs = {
        "question": question,
        "user_department": user_department
    }

    return chain, inputs

def build_chart_chain(question: str, data: list) -> Tuple[Any, dict]:
    logging.info("📊 차트 스펙 생성용 RAG 체인 구성 시작")
        
    llm = GeminiSyncViaGMS()
    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "data": RunnableLambda(lambda x: x["data"])
        }
        | get_prompt_for_chart_summary()
        | llm
        | StrOutputParser()
    )

    return chain, {
        "question": question,
        "data": json.dumps(data, ensure_ascii=False)
    }

def build_insight_chain(input_dict: dict) -> Tuple[Any, dict]:
    logging.info("🧠 인사이트 요약용 RAG 체인 구성 시작")

    llm = GeminiStreamingViaGMS()
    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "chat_history": RunnableLambda(lambda x: x.get("chat_history", "")),
            "data": RunnableLambda(lambda x: x.get("data", "")),
            "data_summary": RunnableLambda(lambda x: x.get("data_summary", "")),
            "chart_spec": RunnableLambda(lambda x: json.dumps(x["chart_spec"], ensure_ascii=False))
        }
        | get_prompt_for_insight()
        | llm
        | StrOutputParser()
    )

    return chain, input_dict
