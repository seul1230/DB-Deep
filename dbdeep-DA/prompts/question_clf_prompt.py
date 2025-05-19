from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
import logging

def get_question_classification_prompt():
    prompt_template = PromptTemplate(
        input_variables=["user_question", "chat_history"],
        template="""
당신은 사용자의 질문을 분류하는 시스템입니다. 아래 조건에 따라 질문의 유형을 판단해주세요:

1. 질문이 직전 대화에 의존하는 내용이면 'follow_up'으로 분류합니다.
2. 데이터 분석이 필요하거나, SQL/차트/통계 분석이 필요한 질문이면 'analysis'로 분류합니다.
3. 이해가 되지 않아서 다시 묻는 질문이면 'confused'로 분류합니다.

[질문]
{user_question}

[대화 내역 요약]
{chat_history}

출력 형식은 아래처럼 JSON 형태로 반환하세요:
{{
  "classification": "follow_up"  // 또는 "analysis", "confused"
}}
        """.strip()
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    chat_prompt = ChatPromptTemplate.from_messages([human_prompt])
    return chat_prompt

def get_follow_up_prompt():
    template = """
    당신은 사용자의 질문 흐름을 이해하는 AI 비서입니다.

    아래 대화 맥락과 최근 질문을 바탕으로 사용자의 질문에 자연스럽게 이어지는 답변을 제공하세요. 
    단, 질문이 데이터 분석이나 SQL 실행이 필요하지 않은 follow-up이라면 친절하고 간결하게 텍스트로만 답변하세요.

    [대화 내역]
    {chat_history}

    [사용자의 현재 질문]
    {question}

    [답변]
    """
    prompt_template = PromptTemplate(
        input_variables=["question", "chat_history"],
        template=template.strip()
    )
    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])
