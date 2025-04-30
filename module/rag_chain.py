import os
import logging
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate
from langchain_pinecone import PineconeVectorStore

from utils.sql_utils import is_hr_team

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
load_dotenv()


class InsightRequest(BaseModel):
    question: str
    chart_spec: dict
    data: list  # list of dicts (DataFrame to_dict(orient="records"))
    chat_history: str | None = None
    user_department: str | None = None

# ----------------------------
# 프롬프트 생성 함수
# ----------------------------
def get_prompt(user_department):
    logging.info("🧱 프롬프트 생성 중...")

    base_template = """
    당신은 데이터 분석 및 시각화 전문가입니다.

    아래의 규칙을 따라 사용자의 질문에 대한 SQL 쿼리를 작성하고, 해당 쿼리로 얻을 수 있는 데이터를 가장 효과적으로 표현할 수 있는 시각화 차트를 Vega-Lite 형식의 JSON으로 작성하세요.

    # 규칙:
    1. 모든 팀은 temp_dataset에 포함된 테이블(card_members, card_sales, card_credit 등)에 접근할 수 있습니다.
    2. 단, hr_dataset 내 테이블(position, salary 등)은 인사팀만 접근할 수 있습니다. {hr_rule}
    3. 질문자는 일상어로 질문할 수 있으며, 이에 맞는 적절한 SQL 쿼리를 작성해야 합니다.
    4. 가능한 경우 JOIN 키(예: member_no)를 활용하여 필요한 테이블을 연결하세요.
    5. temp_dataset의 각 테이블에 대한 설명은 아래 context_schema에 제공됩니다.
    6. SQL은 BigQuery 기준으로 작성하세요.
    7. 시각화는 표출할 수 있는 컬럼, 데이터의 집계 수준 등을 고려하여 가장 적절한 차트를 선정하세요 (예: 막대, 선, 파이, 꺾은선, 누적 등).
    8. 추후 이 결과를 기반으로 차트를 시각화하고 인사이트를 도출할 예정이므로, 차트 JSON은 반드시 데이터 구조를 명확히 표현해야 합니다.

    # 입력 정보
    [사용자 질문]
    {question}

    [대화 내역]
    {chat_history}

    [테이블 설명]
    {context_schema}

    # 출력 형식
    ```sql
    -- 간단한 설명
    SELECT ...
    FROM ...
    WHERE ...
    ```

    ```json
    // Vega-Lite 포맷
    {
    ...
    }
    ```
    """

    hr_rule = "질문자가 인사팀이 아니면 hr_dataset에 있는 테이블은 절대 사용하지 마세요." if not is_hr_team(user_department) else "(질문자가 인사팀이므로 hr_dataset 사용 가능)"
    template = base_template.format(hr_rule=hr_rule)

    prompt_template = PromptTemplate(
        input_variables=["context_schema", "question", "chat_history"],
        template=template
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    final_prompt = ChatPromptTemplate(messages=[human_prompt])

    return final_prompt

def get_prompt_for_insight(request: InsightRequest):
    prompt = f"""
    당신은 데이터 분석가이며, 비전문가가 이해하기 쉽게 시각화 차트를 해석하고 인사이트를 전달하는 역할을 합니다.

    [사용자 질문]
    {request.question}

    [차트 시각화 스펙 - Vega-Lite JSON]
    {json.dumps(request.chart_spec, indent=2, ensure_ascii=False)}

    [사용자 소속 부서]
    {request.user_department or "(알 수 없음)"}

    [대화 맥락]
    {request.chat_history or "(없음)"}

    [데이터 전체]
    {json.dumps(request.data, indent=2, ensure_ascii=False)}

    위 데이터를 기반으로 사용자의 질문에 대해 다음을 작성하세요:
    1. 어떤 내용을 담고 있는 차트인지 간단한 설명
    2. 가장 주목할 만한 인사이트 요약 (수치 비교, 트렌드 등)
    3. 사용자가 이 데이터를 보고 어떤 결정을 내릴 수 있는지 제안 (사용자 소속 부서 및 사용자 질문 참고)

    이 설명은 뉴스레터나 리포트에 그대로 쓸 수 있도록 포멀하고 명확하게 마크다운 형식으로 작성하세요.
    """

    return prompt

# ----------------------------
# RAG 체인 구성 함수
# ----------------------------
def set_rag_chain(question, user_department, pc):
    logging.info("📥 RAG 체인 구성 시작")

    # Pinecone + Embedding
    logging.info("🔗 Pinecone VectorStore 초기화 중...")
    embedding = ()  # 실제 임베딩 객체로 교체

    schema_vectorstore = PineconeVectorStore(
        index=pc.Index("schema-index"),
        embedding=embedding
    )

    schema_retriever = schema_vectorstore.as_retriever(
        search_type='mmr',
        search_kwargs={"k": 3}
    )

    model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
    compressor = CrossEncoderReranker(model=model, top_n=3)

    schema_retriever_compression = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=schema_retriever
    )

    # Gemini LLM
    logging.info("🤖 Gemini LLM 초기화 중...")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=GEMINI_API_KEY
    )

    # 체인 정의
    rag_chain = (
        {
            "chat_history": RunnableLambda(lambda x: user_department),
            "context_schema": schema_retriever_compression,
            "question": RunnablePassthrough()
        }
        | get_prompt(user_department)
        | llm
        | StrOutputParser()
    )

    return rag_chain.invoke(question)


# import os
# import logging
# from dotenv import load_dotenv

# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.runnables import RunnablePassthrough, RunnableLambda
# from langchain_core.output_parsers import StrOutputParser
# from langchain.retrievers import ContextualCompressionRetriever
# from langchain.retrievers.document_compressors import CrossEncoderReranker
# from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate
# from langchain_pinecone import PineconeVectorStore

# logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
# load_dotenv()


# # ----------------------------
# # 인사팀 여부 판별 함수
# # ----------------------------
# def is_hr_team(department: str) -> bool:
#     return department.strip() == "인사팀"


# # ----------------------------
# # 프롬프트 생성 함수 (팀에 따라 내용 조정)
# # ----------------------------
# def get_prompt(user_department):
#     logging.info("🧱 프롬프트 생성 중...")

#     base_template = """
# 당신은 데이터 전문가입니다. 아래의 규칙을 참고하여 사용자의 질문에 답하기 위한 SQL 쿼리를 작성하세요.

# # 규칙:

# 1. 모든 팀은 temp_dataset에 포함된 테이블(card_members, card_sales, card_credit 등)에 접근할 수 있습니다.
# 2. 단, hr_dataset 내 테이블(position, salary 등)은 인사팀만 접근할 수 있습니다. {hr_rule}
# 3. 질문자가 제공한 질문은 일상어일 수 있습니다. 이 질문을 이해하고, 관련 테이블/컬럼을 분석하여 가장 적절한 SQL을 작성하세요.
# 4. 가능한 경우 JOIN 키(예: member_no)를 활용하여 필요한 테이블을 연결하세요.
# 5. temp_dataset의 각 테이블에 대한 설명은 아래 context_schema에 제공됩니다.
# 6. SQL은 BigQuery 기준으로 작성하세요. 단, 질문자가 결과를 원하면 SELECT 문에 필요한 컬럼을 명시해 주세요.

# # 입력 정보

# [사용자 질문]
# {question}

# [접근 가능한 팀]
# {chat_history}

# [테이블 설명]
# {context_schema}

# # 출력 형식:
# 다음 형식을 따르세요.

# ```sql
# -- 간단한 설명: (이 쿼리가 무엇을 하는지 한 줄 요약)
# SELECT ...
# FROM ...
# WHERE ...
# ```

# 필요 시 ORDER BY, LIMIT 등을 적절히 추가하세요.
# """

#     hr_rule = "질문자가 인사팀이 아니면 hr_dataset에 있는 테이블은 절대 사용하지 마세요." if not is_hr_team(user_department) else "(질문자가 인사팀이므로 hr_dataset 사용 가능)"
#     template = base_template.format(hr_rule=hr_rule)

#     prompt_template = PromptTemplate(
#         input_variables=["context_schema", "question", "chat_history"],
#         template=template
#     )

#     human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
#     final_prompt = ChatPromptTemplate(messages=[human_prompt])

#     return final_prompt


# # ----------------------------
# # RAG 체인 구성 함수
# # ----------------------------
# def set_rag_chain(question, user_department, pc):
#     logging.info("📥 RAG 체인 구성 시작")

#     # 1. VectorStore 설정
#     logging.info("🔗 Pinecone VectorStore 초기화 중...")
#     embedding = ()  # 여기에 실제 임베딩 객체를 넣으세요

#     schema_vectorstore = PineconeVectorStore(
#         index=pc.Index("schema-index"),
#         embedding=embedding
#     )

#     # 2. Retriever 설정
#     logging.info("🔍 문서 검색기 초기화 중 (MMR + ReRanker)")
#     schema_retriever = schema_vectorstore.as_retriever(
#         search_type='mmr',
#         search_kwargs={"k": 3}
#     )

#     model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
#     compressor = CrossEncoderReranker(model=model, top_n=3)

#     schema_retriever_compression = ContextualCompressionRetriever(
#         base_compressor=compressor,
#         base_retriever=schema_retriever
#     )

#     # 3. Gemini LLM 설정
#     logging.info("🤖 Gemini LLM 초기화 중...")
#     GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
#     llm = ChatGoogleGenerativeAI(
#         model="gemini-1.5-pro",
#         google_api_key=GEMINI_API_KEY
#     )

#     # 4. 체인 연결
#     logging.info("🔗 RAG 체인 구성 완료, 질의 수행 중...")
#     rag_chain = (
#         {
#             "chat_history": RunnableLambda(lambda x: user_department),
#             "context_schema": schema_retriever_compression,
#             "question": RunnablePassthrough()
#         }
#         | get_prompt(user_department)
#         | llm
#         | StrOutputParser()
#     )

#     answer = rag_chain.invoke(question)
#     logging.info("✅ 질의 처리 완료")

#     return answer
