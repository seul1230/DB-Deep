from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
import logging

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

def get_prompt_for_chart_summary():
    logging.info("📊 Plotly 차트 + 요약 설명 프롬프트 생성 중...")

    base_template = """
    당신은 데이터 분석과 시각화에 능숙한 전문가입니다. 아래 사용자 질문과 SQL 쿼리 결과 데이터를 기반으로,
    사용자가 궁극적으로 이해하고자 하는 인사이트를 가장 효과적으로 보여주는 **plotly.js용 JSON 차트 사양**을 설계해 주세요.

    # 출력 형식
    1. 먼저 아래 형식처럼 `plotly.js`에서 사용할 수 있는 차트 사양을 JSON 코드 블록으로 작성하세요:
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

    2. 차트 코드 아래에는, 이 차트에서 **사용자가 주목해야 할 주요 수치나 트렌드**, **간단한 설명 또는 의미 해석**을 한 문단 이내로 추가해 주세요.
       - 예: "2022년 총매출이 전년 대비 급감한 것이 눈에 띕니다."
       - 설명은 반드시 한국어로 자연스럽게 작성하세요.
       - 분석적 관찰이나 이상치(highlight), 패턴 강조 중심이면 더 좋습니다.
       - 출력 형식은 다음과 같습니다.
       ```text
       영업부는 타 부서 대비 현저히 높은 성과급을 받은 것으로 나타납니다. 특히 인사부와는 두 배 이상 차이가 납니다.
       ```

    # 제약 조건
    - chart_type은 반드시 다음 중 하나: `"bar"`, `"line"`, `"pie"`, `"scatter"`, `"area"`, `"heatmap"`
    - chart_type은 질문 의도와 data 구조를 고려해 가장 적절하게 선택하세요.
    - label과 title은 반드시 한국어로 명확하게 작성하세요.
    - JSON은 반드시 코드 블록(```json```) 안에만 들어가도록 하세요. 사용자가 주목해야할 주요 수치나 트렌드, 간단한 설명 또는 의미 해석은 코드 블록(```text```) 안에 들어가도록 하세요. 그 외 설명은 코드 블록 외부에 작성하세요.

    ----
    # 입력 정보
    [사용자 질문]
    {question}

    [SQL 조회 결과 데이터]
    {data}

    ----
    # 출력
    위 형식을 반드시 따르세요. 
    먼저 JSON 코드 블록, 그 아래 설명 문장 순으로 출력하세요.
    """

    prompt_template = PromptTemplate(
        input_variables=["question", "data"],
        template=base_template
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])

