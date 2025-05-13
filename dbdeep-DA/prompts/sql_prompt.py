from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from utils.policy_utils import is_hr_team
import logging

def get_prompt_for_sql(user_department: str) -> ChatPromptTemplate:
    logging.info("🧱 프롬프트 생성 중...")
    hr_rule = (
        "9. 단, hr_dataset 내 테이블(position, salary 등)은 인사팀만 접근할 수 있습니다."
        if not is_hr_team(user_department)
        else "(질문자가 인사팀이므로 hr_dataset 사용 가능)"
    )

    template = """
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
        template=template.replace("{hr_rule}", hr_rule)
    )

    return ChatPromptTemplate.from_messages([HumanMessagePromptTemplate(prompt=prompt_template)])
