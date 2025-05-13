import json
import logging
from typing import Tuple, Any
from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from llm.gemini import GeminiSyncViaGMS, GeminiStreamingViaGMS
from prompts.sql_prompt import get_prompt_for_sql
from prompts.chart_prompt import get_prompt_for_chart
from prompts.insight_prompt import get_prompt_for_insight

def build_sql_chain(question: str, user_department: str, retriever) -> Tuple[Any, dict]:
    prompt = get_prompt_for_sql(user_department)
    llm = GeminiSyncViaGMS()

    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "chat_history": RunnableLambda(lambda x: ""),
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "context_schema": RunnableLambda(lambda x: retriever.invoke(x["question"])),
            "context_sql": RunnableLambda(lambda x: retriever.invoke(x["question"]))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, {
        "question": question,
        "user_department": user_department
    }

def build_chart_chain(question: str, data: list) -> Tuple[Any, dict]:
    prompt = get_prompt_for_chart()
    llm = GeminiSyncViaGMS()

    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "data": RunnableLambda(lambda x: x["data"])
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, {
        "question": question,
        "data": json.dumps(data, ensure_ascii=False)
    }

def build_insight_chain(input_dict: dict) -> Tuple[Any, dict]:
    prompt = get_prompt_for_insight()
    llm = GeminiStreamingViaGMS()
    logging.info("####################")

    chain = (
        {
            "question": RunnableLambda(lambda x: x["question"]),
            "user_department": RunnableLambda(lambda x: x["user_department"]),
            "chat_history": RunnableLambda(lambda x: x.get("chat_history", "")),
            "data": RunnableLambda(lambda x: json.dumps(x["data"], ensure_ascii=False)),
            "chart_spec": RunnableLambda(lambda x: json.dumps(x["chart_spec"], ensure_ascii=False))
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, input_dict
