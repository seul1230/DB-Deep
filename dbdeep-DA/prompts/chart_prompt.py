from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
import logging

def get_prompt_for_chart() -> ChatPromptTemplate:
    logging.info("📊 Plotly 차트 프롬프트 생성 중...")

    template = """
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
        template=template
    )
    return ChatPromptTemplate.from_messages([HumanMessagePromptTemplate(prompt=prompt_template)])
