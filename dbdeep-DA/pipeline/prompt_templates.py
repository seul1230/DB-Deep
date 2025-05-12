import os
import json
import logging

from pipeline.sql_process import is_hr_team
from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate

# ----------------------------
# 프롬프트 생성 함수
# ----------------------------
def get_prompt_for_sql(user_department):
    logging.info("🧱 프롬프트 생성 중...")
    
    hr_rule = (
        "9. 단, hr_dataset 내 테이블(position, salary 등)은 인사팀만 접근할 수 있습니다. 질문자가 인사팀이 아니면 hr_dataset에 있는 테이블은 절대 사용하지 마세요."
        if not is_hr_team(user_department)
        else "(질문자가 인사팀이므로 hr_dataset 사용 가능)"
    )

    base_template = """
    당신은 데이터 분석 및 시각화 전문가입니다.
    아래의 지침을 따라, 단순 데이터 조회가 아니라 **의사결정에 활용 가능한 분석적 SQL 쿼리**를 생성하세요.

    ## 목적
    사용자가 질문을 통해 궁금해하는 **핵심 판단 기준**을 도출하고, 그 기준에 따라 데이터를 **분석 및 분류(CASE WHEN)**하며, **해석 가능한 새로운 칼럼**과 **의사결정에 도움이 되는 형태의 결과**를 반환하는 SQL을 작성합니다.

    ## SQL 작성 규칙:
    1. 질문자는 일상어로 질문하며, 이에 맞는 SQL을 작성하세요.
    2. 필요한 경우 **조건문(CASE WHEN), CTE, JOIN, 윈도우 함수** 등을 적극 활용하세요.
    3. 분석의 대상은 단순 집계가 아닌 **비즈니스 분류, 정책 적용, 시나리오 해석**입니다.
       - 예: '성과가 부진한 부서를 찾고, 삭감률을 판단해서 알려줘'
       - → 각 부서별 부진 직원 비율을 기준으로 5% 삭감, 10% 삭감, 유지 등으로 구분
    4. **정책 판단 기준**이 질문에 명확히 제시되지 않은 경우, 다음과 같은 일반 기준을 가정해도 좋습니다:
       - 하위 10% 미만이면 ‘위험’, 하위 5% 이하면 ‘심각’ 등
    5. SQL은 BigQuery 기준으로 작성하며 아래 BigQuery SQL 문법 가이드와 용어를 참고하세요.
        - NTILE, MEDIAN 등은 사용 금지
        - 반드시 dataset.table 형식(예: hr_dataset.dim_employee, card_dataset.card_members) 명시
        - "BigQuery에서는 OVER 절과 GROUP BY를 함께 사용할 수 없습니다. 둘 중 하나를 선택하세요."
        - "NTILE, MEDIAN, PERCENTILE_CONT는 BigQuery에서 지원되지 않습니다. 대신 APPROX_QUANTILES(column, 100)[OFFSET(n)]을 사용하세요."
        - "APPROX_QUANTILES(...)는 단순 컬럼에만 적용해야 하며, 복잡한 표현식이나 집계된 값에는 사용할 수 없습니다."
        - "PARTITION BY에 포함된 컬럼은 반드시 GROUP BY나 SELECT에 포함되어야 합니다."
    6. 쿼리 결과에는 다음을 포함해야 합니다:
       - 원본 필드 + 새로 계산된 판단 기준 필드
       - 최종 결과를 요약해주는 부서별/카테고리별 행
       - 의미 있는 결과를 이끌어내야 합니다. 다 같은 값이면 다시 한 번 생각해보세요.
    7. 질문이 데이터 분석과 무관할 경우, "데이터와 관련된 질문만 이해할 수 있어요!"를 반환하세요.
    {hr_rule}

    ## 입력 정보
    [사용자 질문]
    {question}

    [사용자 부서]
    {user_department}

    [대화 내역]
    {chat_history}

    [데이터셋 및 용어 설명]
    {context_schema}
    
    [BigQuery SQL 문법 가이드 및 용어 정의]
    {context_sql}

    ## 출력 형식
    아래와 같은 순서로 작성하세요.
    
    1. [분석 방향 요약] 질문의 핵심 의도와 판단 기준 해석
    2. [SQL 사고 흐름 요약] 어떤 방식으로 쿼리를 구성할 것인지 간단히 설명
    3. [SQL 코드]
    
    ```sql
    -- 판단 기준과 분석 로직이 포함된 쿼리
    ```

    """

    prompt_template = PromptTemplate(
        input_variables=["question", "chat_history", "user_department", "context_schema", "context_sql"],
        template=base_template.replace("{hr_rule}", hr_rule)
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])


def get_prompt_for_chart():
    logging.info("📊 Plotly 차트 프롬프트 생성 중...")

    base_template = """
    당신은 데이터 분석과 시각화에 능숙한 전문가입니다. 아래 사용자 질문과 SQL 쿼리 결과 데이터를 기반으로, 
    사용자가 궁극적으로 이해하고자 하는 인사이트를 가장 효과적으로 보여주는 **plotly.js용 JSON 차트 사양**을 설계해 주세요.

    # 출력 규칙:
    - 반드시 plotly.js에서 사용할 수 있는 형식의 JSON을 반환합니다.
    - 형식 예시는 다음과 같습니다:
    ```json
    {{
        "chart_type": "bar",
        "x": ["2021", "2022", "2023"],
        "y": [100, 150, 130],
        "x_label": "연도",
        "y_label": "총매출액",
        "title": "연도별 총매출 비교"
    }}
    ```
    
    - chart_type은 다음 중 하나로만 설정: "bar", "line", "pie", "scatter", "area", "heatmap"
    - chart_type은 질문 의도와 data 구조를 고려해 **가장 적합한 형태로 자동 선택**합니다. 시각화는 표출할 수 있는 컬럼, 데이터의 집계 수준 등을 고려하여 가장 적절한 차트를 선정하세요 (예: 막대, 선, 파이, 꺾은선, 누적 등)
    - label과 title은 한국어로 자연스럽고 명확하게 작성하세요.
    - 출력은 반드시 위 JSON 형식 하나만 포함된 **코드 블록 안에 출력**하세요. 추후 이 결과를 기반으로 차트를 시각화하고 인사이트를 도출할 예정이므로, 차트 JSON은 반드시 데이터 구조를 명확히 표현해야 합니다.

    ----
    # 입력 정보
    [사용자 질문]
    {question}

    [SQL 조회 결과 데이터]
    {data}

    ----
    # 출력
    plotly.js에서 바로 사용할 수 있는 JSON 차트 사양을 json 코드 블록 안에 반환하세요.
    """
    
    prompt_template = PromptTemplate(
        input_variables=["question", "data"],
        template=base_template
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])




def get_prompt_for_insight():
    logging.info("🧠 인사이트 요약용 프롬프트 생성 중...")

    base_template = """
    당신은 데이터 분석가입니다. 
    당신의 역할은 비전문가도 쉽게 이해할 수 있도록, 시각화 차트와 데이터 분석 결과를 해석하고 통찰력 있는 인사이트를 제공하는 것입니다.

    ## 입력 정보

    ### 1. 사용자 질문
    {question}

    ### 2. 사용자 소속 부서
    {user_department}

    ### 3. 대화 맥락
    {chat_history}

    ### 4. 조회된 데이터
    {data}

    ### 5. 시각화 차트 (plotly.js JSON)
    ```json
    {chart_spec}
    ```

    ## 출력 형식 (마크다운으로 작성)
    사용자의 질문에 기반하여 다음을 포함해 분석 결과를 작성하세요:

    1. 차트 설명: 차트가 시각적으로 어떤 정보를 보여주는지 간단히 요약합니다.  
       예: "월별 판매량 추이를 보여주는 선형 차트입니다."

    2. 핵심 인사이트 요약: 조회된 데이터 기반으로 유의미한 패턴, 변화, 차이 등을 서술합니다.  
       예: "3월 이후 급격한 감소세", "A팀이 평균보다 20% 높은 실적을 기록함"

    3. 추천 및 해석: 사용자 부서와 질문을 고려하여, 어떤 의사결정이나 행동이 가능할지 제안합니다.  
       예: "성과 부진 부서에는 추가 교육 프로그램이 필요할 수 있습니다."

    문장은 리포트에 그대로 사용할 수 있을 정도로 명확하고 포멀하게 작성하세요.  
    분석 전문가의 시각으로, 수치와 근거 기반으로 설명하는 것이 좋습니다.
    """

    prompt_template = PromptTemplate(
        input_variables=["question", "user_department", "chat_history", "data", "chart_spec"],
        template=base_template
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])