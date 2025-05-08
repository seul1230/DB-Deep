import os
import json
import logging

from pipeline.sql_process import is_hr_team
from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate

# ----------------------------
# 프롬프트 생성 함수
# ----------------------------
def get_prompt(user_department):
    logging.info("🧱 프롬프트 생성 중...")
    
    hr_rule = (
        "8. 단, hr_dataset 내 테이블(position, salary 등)은 인사팀만 접근할 수 있습니다. 질문자가 인사팀이 아니면 hr_dataset에 있는 테이블은 절대 사용하지 마세요."
        if not is_hr_team(user_department)
        else "(질문자가 인사팀이므로 hr_dataset 사용 가능)"
    )

    base_template = """
    당신은 데이터 분석 및 시각화 전문가입니다.
    아래의 규칙을 따라 사용자의 질문에 대한 SQL 쿼리를 작성하고, 해당 쿼리로 얻을 수 있는 데이터를 가장 효과적으로 표현할 수 있는 시각화 차트를 Vega-Lite 형식의 JSON으로 작성하세요.

    # 규칙:
    1. 모든 팀은 temp_dataset에 포함된 테이블(card_members, card_sales, card_credit 등)에 접근할 수 있습니다.
    2. 질문자는 일상어로 질문할 수 있으며, 이에 맞는 적절한 SQL 쿼리를 작성해야 합니다.
    3. 가능한 경우 JOIN 키(예: member_no)를 활용하여 필요한 테이블을 연결하세요.
    4. temp_dataset의 각 테이블에 대한 설명은 아래 context_schema에 제공됩니다.
    5. SQL은 BigQuery 기준으로 작성하세요.
    6. 시각화는 표출할 수 있는 컬럼, 데이터의 집계 수준 등을 고려하여 가장 적절한 차트를 선정하세요 (예: 막대, 선, 파이, 꺾은선, 누적 등).
    7. 추후 이 결과를 기반으로 차트를 시각화하고 인사이트를 도출할 예정이므로, 차트 JSON은 반드시 데이터 구조를 명확히 표현해야 합니다.
    {hr_rule}

    # 입력 정보
    [사용자 질문]
    {question}
    
    [사용자 부서]
    {user_department}

    [대화 내역]
    {chat_history}

    [테이블 설명]
    {context_schema}

    # 출력 형식
    [사용자 질문을 이해하고 의도 파악한 후, 앞으로 해야할 과정을 논리적으로 사용자에게 간단하게 브리핑]
    
    ```sql
    -- 간단한 설명
    SELECT ...
    FROM ...
    WHERE ...
    ```

    ```json
    // Vega-Lite 포맷
    {{
    ...
    }}
    ```
    """

    prompt_template = PromptTemplate(
        input_variables=["question", "chat_history", "user_department", "context_schema"],
        template=base_template.replace("{hr_rule}", hr_rule)
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])


def get_prompt_for_insight(request):
    prompt = f"""
    당신은 데이터 분석가입니다. 
    당신의 역할은 비전문가도 쉽게 이해할 수 있도록, 시각화 차트와 데이터 분석 결과를 해석하고 통찰력 있는 인사이트를 제공하는 것입니다.

    ## 입력 정보

    ### 1. 사용자 질문
    {request.question}

    ### 2. 사용자 소속 부서
    {request.user_department or "(알 수 없음)"}

    ### 3. 대화 맥락
    {request.chat_history or "(없음)"}

    ### 4. 시각화 차트 (Vega-Lite JSON)
    ```json
    {json.dumps(request.chart_spec, indent=2, ensure_ascii=False)}
    ```
    
    
    

    ## 출력 형식 (마크다운으로 작성)
    사용자의 질문에 기반하여 다음을 포함해 분석 결과를 작성하세요:

    1. 차트 설명: 차트가 시각적으로 어떤 정보를 보여주는지 간단히 요약합니다. 예: "월별 판매량 추이를 보여주는 선형 차트입니다."
    2. 핵심 인사이트 요약: 데이터 기반으로 유의미한 패턴, 변화, 차이 등을 서술합니다. 예: "3월 이후 급격한 감소세", "A팀이 평균보다 20% 높은 실적을 기록함"
    3. 추천 및 해석: 사용자 부서와 질문을 고려하여, 어떤 의사결정이나 행동이 가능할지 제안합니다. 예: "성과 부진 부서에는 추가 교육 프로그램이 필요할 수 있습니다."
    
    문장은 리포트에 그대로 사용할 수 있을 정도로 명확하고 포멀하게 작성하세요. 분석 전문가의 시각으로, 수치와 근거 기반으로 설명하는 것이 좋습니다.
    """

    return prompt