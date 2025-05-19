from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from utils.policy_utils import is_hr_team
import logging

def get_prompt_for_sql(user_department):
    logging.info("🧱 프롬프트 생성 중...")
    
    hr_schema_info = (
    """
    퇴사 날짜가 null인 경우는 아직 재직 중인 사원입니다. 기억하세요.
    -  ✅ Dimension 테이블 기준 JOIN 관계

        ### 📘 dim_employee (직원 정보)
        - 다수의 Fact 테이블이 `employee_id`를 통해 이 테이블과 연결됨
        ```sql
        -- 상여금 분석 시 예시
        FROM hr_dataset.fact_bonus fb
        JOIN hr_dataset.dim_employee e ON fb.employee_id = e.employee_id
        ```

        📘 dim_department (부서 정보)
        - `dim_employee.department_id` → `dim_department.department_id`
        ```sql
        JOIN hr_dataset.dim_department d ON e.department_id = d.department_id
        ```

        📘 dim_position (직급 정보)
        - `dim_employee.position_id` → `dim_position.position_id`
        ```sql
        JOIN hr_dataset.dim_position p ON e.position_id = p.position_id
        ```

        📘 dim_date (날짜 정보)
        - `fact_*` 테이블의 `date_id` → `dim_date.date_id`
        ```sql
        JOIN hr_dataset.dim_date dt ON f.date_id = dt.date_id
        ```
        ---

    - ✅ Fact 테이블 기준 JOIN 관계

        | Fact 테이블 | 주요 Dimension 조인 |
        |-------------|----------------------|
        | **fact_salary** | `employee_id → dim_employee`<br>`date_id → dim_date` |
        | **fact_bonus** | `employee_id → dim_employee`<br>`date_id → dim_date` |
        | **fact_attendance** | `employee_id → dim_employee`<br>`date_id → dim_date` |
        | **fact_performance** | `employee_id → dim_employee`<br>`date_id → dim_date` |
        | **fact_department_performance** | `department_id → dim_department`<br>`date_id → dim_date` |
        | **fact_survey_response** | `employee_id → dim_employee`<br>`question_id → dim_survey_question`<br>`date_id → dim_date` |

        예시 1: 직원 상여금과 부서명을 함께 조회
        ```sql
        FROM hr_dataset.fact_bonus b
        JOIN hr_dataset.dim_employee e ON b.employee_id = e.employee_id
        JOIN hr_dataset.dim_department d ON e.department_id = d.department_id
        ```

        예시 2: 연봉과 직급별 평균 연봉 비교
        ```sql
        FROM hr_dataset.fact_salary s
        JOIN hr_dataset.dim_employee e ON s.employee_id = e.employee_id
        JOIN hr_dataset.dim_position p ON e.position_id = p.position_id
        ```

        예시 3: 날짜와 함께 출결 분석
        ```sql
        FROM hr_dataset.fact_attendance a
        JOIN hr_dataset.dim_employee e ON a.employee_id = e.employee_id
        JOIN hr_dataset.dim_date dt ON a.date_id = dt.date_id
        ```

        ---

        🔁 전체 JOIN 흐름 요약 (스타 스키마)
        ```
        fact_xxx
        ├── employee_id ──▶ dim_employee
        │                     ├── department_id ──▶ dim_department
        │                     └── position_id ──▶ dim_position
        └── date_id     ──▶ dim_date
        ```

        ---

        💡 팁
        - `position_id`는 `fact_salary`에 직접 존재하지 않음 → 반드시 `dim_employee` 통해 JOIN
        - `fact_*` 테이블은 날짜 기준 분석 시 `dim_date`와 조인 필수
        - 의미적 흐름은 "fact 중심 → dimension 보강" 구조로 설계
        """
    )
    
    hr_rule = (
        f"""
        9. 단, hr_dataset 내 테이블(position, salary 등)에 접근할 수 없습니다. 질문자가 인사팀이 아니므로 hr_dataset에 있는 테이블은 절대 사용하지 마세요.
        """
        if not is_hr_team(user_department)
        else f"""
        9. 질문자가 인사팀이므로 hr_dataset 사용 가능합니다. 사용자 질문에 맞는 데이터셋을 사용하여 원하는 대답을 들을 수 있도록 도와주세요.
        {hr_schema_info}
        
        아래는 hr_schema 테이블 JSON 구조입니다. 자료형과 필드명을 참고하세요:
        ```json
        {{hr_schema_json_str}}
        ```
        """
    )
    


    base_template = """
    당신은 데이터 분석 및 시각화 전문가입니다.
    아래의 지침을 따라, 단순 데이터 조회가 아니라 **의사결정에 활용 가능한 분석적 SQL 쿼리**를 생성하세요.

    ## 목적
    사용자가 질문을 통해 궁금해하는 **핵심 판단 기준**을 도출하고, 그 기준에 따라 데이터를 **분석 및 분류(CASE WHEN)**하며, **해석 가능한 새로운 칼럼**과 **의사결정에 도움이 되는 형태의 결과**를 반환하는 SQL을 작성합니다.

    ## 전제: 오늘 날짜 (사용자 쿼리가 들어오는 날 기준)
    사용자 질문이 들어오는 날, 즉 오늘은 2018년 12월 15일입니다. 최근 1년이라 함은 2017-2018 데이터를 말합니다.

    ## SQL 작성 규칙:
    1. 질문자는 일상어로 질문하며, 이에 맞는 SQL을 작성하세요.
    2. 필요한 경우 **조건문(CASE WHEN), CTE, JOIN, 윈도우 함수** 등을 적극 활용하세요.
    3. 분석의 대상은 단순 집계가 아닌 **비즈니스 분류, 정책 적용, 시나리오 해석**입니다.
       - 예: '성과가 부진한 부서를 찾고, 삭감률을 판단해서 알려줘' → 각 부서별 부진 직원 비율을 기준으로 5% 삭감, 10% 삭감, 유지 등으로 구분
    4. **정책 판단 기준**이 질문에 명확히 제시되지 않은 경우, 다음과 같은 일반 기준을 가정해도 좋습니다:
       - 하위 10% 미만이면 ‘위험’, 하위 5% 이하면 ‘심각’ 등
    5. SQL은 BigQuery 기준으로 작성하며 아래 BigQuery SQL 문법 가이드와 용어를 참고하세요.
        - `date_id`는 `INT64` 형식으로, 날짜 연산(EXTRACT 등)에 직접 사용할 수 없습니다. 날짜 정보가 필요할 경우, 반드시 `dim_date` 테이블의 `full_date` 컬럼을 JOIN해서 사용하세요.
            - 예: `EXTRACT(YEAR FROM dd.full_date)` 처럼 사용하세요.
            - `fs.date_id` 등 `INT64` 타입 필드에 `EXTRACT`를 직접 사용하는 것은 금지합니다.
        - NTILE, MEDIAN 등은 사용 금지
        - 반드시 dataset.table 형식(예: hr_dataset.dim_employee, card_dataset.card_members) 명시
        - "BigQuery에서는 OVER 절과 GROUP BY를 함께 사용할 수 없습니다. 둘 중 하나를 선택하세요."
        - "NTILE, MEDIAN, PERCENTILE_CONT는 BigQuery에서 지원되지 않습니다. 대신 APPROX_QUANTILES(column, 100)[OFFSET(n)]을 사용하세요."
        - "APPROX_QUANTILES(...)는 단순 컬럼에만 적용해야 하며, 복잡한 표현식이나 집계된 값에는 사용할 수 없습니다."
        - "PARTITION BY에 포함된 컬럼은 반드시 GROUP BY나 SELECT에 포함되어야 합니다."
        - 반환되는 JSON 내 모든 숫자 타입은 반드시 소수점 이하를 포함하지 않는 **Python의 float 또는 int 형식**으로 작성해주세요.
            - Decimal, Fraction, 기타 특수한 숫자 타입은 절대 사용하지 마세요.
            - 숫자는 항상 JSON에서 직렬화 가능한 형식으로 작성되어야 하며, 예: 123.0, 45 등으로 표현되어야 합니다.
        - 사용자가 의도한 바가 잘 보일 수 있도록 정렬하고 데이터 행이 50개가 넘어간다면 제한하세요.
        - BigQuery에서는 윈도우 함수(analytic function)를 또 다른 윈도우 함수 안에 중첩해서 사용할 수 없습니다. CTE로 먼저 분리한 후 계산하세요.

    6. 쿼리 결과에는 다음을 포함해야 합니다:
       - 원본 필드 + 새로 계산된 판단 기준 필드
       - 최종 결과를 요약해주는 부서별/카테고리별 행
       - 의미 있는 결과를 이끌어내야 합니다. 다 같은 값이거나 조회되는 데이터가 없다면 다시 한 번 생각해보세요.
       - 쿼리 최적화를 항상 염두에 두고 작성하세요.
    7. 
    8. 테이블 및 컬럼명은 절대 한글로 작성하지 말고, 반드시 스키마(context_schema)를 그대로 사용하세요.
    9. 존재하지 않는 컬럼명을 한글로 새로 만들어 쓰지 마세요. (예: 직원ID, 상여금 등)
       - 주의: LLM이 자주 실수하는 점 중 하나는 fact 테이블에서 직접 position_id나 department_id 등을 찾는 것입니다. 이 컬럼들은 반드시 dim_employee를 통해 JOIN하여 가져와야 합니다.
    {hr_rule}

    ## 입력 정보
    [사용자 질문]
    {question}

    [사용자 부서]
    {user_department}

    [대화 내역]
    {chat_history}

    [데이터셋 및 스키마 설명 - hr_schema]
    이 데이터베이스(`hr_dataset`)는 **스타 스키마(Star Schema)**로 구성되어 있으며, 중심에는 측정 데이터를 담는 Fact 테이블이 있고, 이를 설명하는 Dimension 테이블들과 연결되어 있습니다.
    ❗❗❗주의: 인사팀이 아니면 hr_schema는 사용할 수 없습니다. 그럼에도 이 스키마를 이용해야하는 질문이면 "접근 권한이 없습니다"를 출력하세요.
    ❗❗❗주의: 실제 존재하지 않는 필드/컬럼명은 절대 사용하지 마세요. 아래 hr_schema 문서를 참고하여, 정확한 테이블명과 컬럼명, 그리고 자료형을 사용하세요. 존재하지 않는 컬럼(e.g. first_name, title, name 등)을 생성하지 마세요. 테이블명에 별칭을 쓸 때, 꼭 있는지 확인하고 쓰세요.
    - `date_id`는 실제 날짜가 아닌 날짜 인덱스(INT)입니다. 날짜 필터링이나 집계를 하려면 반드시 `dim_date` 테이블을 JOIN해서 `full_date`, `year`, `month` 등의 필드를 사용하세요.
      - EXTRACT 사용 시에는 `EXTRACT(YEAR FROM dd.full_date)`처럼 명시하세요.

    {hr_schema}

    [데이터셋 요약 - card_dataset]
    - 총 8개 테이블(card_members, card_credit, card_sales, card_invoice, card_balance, card_channels, card_marketing, card_performance)로 구성
    - 각 테이블은 '기준년월(job_mon)', '회원번호(member_no)'로 공통 연결 가능
      - job_mon의 자료형은 INTEGER입니다.
      - ratio_로 시작하는 필드의 자료형은 FLOAT입니다.
    - 컬럼명은 영어 식별자를 사용 (예: code_gender, amt_use 등)
    - 자료형: 대부분 STRING / FLOAT / INTEGER 로 구성됨
    - 코드형 필드는 유효값 존재 (예: code_gender = 1:남, 2:여)
    ※ 정확한 테이블명 및 필드명을 사용할 것. 존재하지 않는 필드(예: name, id 등) 사용 금지.

    [데이터셋 및 스키마 설명 - card_schema]
    ❗❗❗주의: 실제 존재하지 않는 필드/컬럼명은 절대 사용하지 마세요. 아래 card_schema 문서를 참고하여, 정확한 테이블명과 컬럼명, 그리고 자료형을 사용하세요. 존재하지 않는 컬럼(e.g. first_name, title, name 등)을 생성하지 마세요. 테이블명에 별칭을 쓸 때, 꼭 있는지 확인하고 쓰세요.
    {card_schema}

    
    [비즈니스 용어 및 판단 기준 정의]
    {context_term}
    
    [사용자별 용어 사전]
    {customer_dict}

    [BigQuery SQL 문법 가이드 및 용어 정의]
    {context_sql}

    ## 출력 형식
    아래와 같은 순서로 작성하세요. 전체 출력 형식은 json 형식으로, 각각의 값은 괄호 안의 keyword로 작성해줘.
    1. [사용자의 질문을 스키마를 참고해 조정 (question)]
    2. [분석 방향 요약(analysis_direction)] 질문의 핵심 의도와 판단 기준 해석
    3. [SQL 사고 흐름 요약(sql_thinking_flow)] 어떤 방식으로 쿼리를 구성할 것인지 간단히 설명
    4. 조회된 데이터를 차트로 시각화 하는 과정이 필요한지 (need_chart: bool) - True 혹은 False로 나타내세요. 첫 번째 문자는 대문자로 하세요.
    5. [SQL 코드(sql_code)]

    """
    # {card_schema_json_str}

    prompt_template = PromptTemplate(
        input_variables=["question", "chat_history", "user_department", "hr_schema", "hr_schema_json_str", # "card_schema_json_str",
                         "card_schema", "context_term", "customer_dict", "context_sql"],
        template=base_template.replace("{hr_rule}", hr_rule)
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])

