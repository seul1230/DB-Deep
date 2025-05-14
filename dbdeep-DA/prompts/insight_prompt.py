from langchain.prompts import PromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
import logging

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

    ### 4. 조회된 데이터 및 요약
    {data_summary} {data}

    ### 5. 시각화 차트 (plotly.js JSON)
    ```json
    {chart_spec}
    ```

    ## 출력 형식 (마크다운으로 작성)
    사용자의 질문에 기반하여 다음을 포함해 분석 결과를 작성하세요:

    1. 차트가 있는 경우에만 차트 설명: 차트가 시각적으로 어떤 정보를 보여주는지 간단히 요약합니다. 차트 시각화 할 필요 없이 간단히 조회된 데이터라면 차트 정보가 없을 수 있습니다.
       예: "월별 판매량 추이를 보여주는 선형 차트입니다."

    2. 핵심 인사이트 요약: 조회된 데이터 기반으로 유의미한 패턴, 변화, 차이 등을 서술합니다.  
       예: "3월 이후 급격한 감소세", "A팀이 평균보다 20% 높은 실적을 기록함"

    3. 추천 및 해석: 사용자 부서와 질문을 고려하여, 어떤 의사결정이나 행동이 가능할지 제안합니다.  
       예: "성과 부진 부서(예: 기획팀)에는 추가 교육 프로그램을 추천합니다."

    문장은 리포트에 그대로 사용할 수 있을 정도로 명확하고 포멀하게 작성하세요.  
    분석 전문가의 시각으로, 수치와 근거 기반으로 설명하는 것이 좋습니다.
    """

    prompt_template = PromptTemplate(
        input_variables=[
            "question",
            "user_department",
            "chat_history",
            "data",
            "data_summary",
            "chart_spec"
        ],
        template=base_template
    )

    human_prompt = HumanMessagePromptTemplate(prompt=prompt_template)
    return ChatPromptTemplate.from_messages([human_prompt])
