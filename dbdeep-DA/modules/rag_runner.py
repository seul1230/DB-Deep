import json
from typing import Dict

from fastapi import WebSocket
from services.sql_executor import SQLExecutor
from db.pinecone import get_vectorstore
from utils.response_utils import clean_sql_from_response, clean_json_from_response
from modules.rag_builder import build_sql_chain, build_chart_chain, build_insight_chain

def run_sql_pipeline(question: str, department: str) -> Dict:
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 3})
    sql_chain, inputs = build_sql_chain(question, department, retriever)

    sql_text = sql_chain.invoke(inputs)
    sql = clean_sql_from_response(sql_text)
    df = SQLExecutor().execute_with_retry(sql)

    chart_chain, chart_inputs = build_chart_chain(question, df.to_dict(orient="records"))
    chart_raw = chart_chain.invoke(chart_inputs)
    chart = json.loads(clean_json_from_response(chart_raw))

    return {
        "query": sql,
        "data": df.to_dict(orient="records"),
        "chart": chart
    }

async def run_insight_pipeline_async(request_dict, websocket: WebSocket):
    chain, inputs = build_insight_chain(request_dict)
    result = ""
    async for chunk in chain.astream(inputs):
        await websocket.send_text(chunk)
        result += chunk
    return result
