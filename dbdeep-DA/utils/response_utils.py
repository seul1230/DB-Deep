import re
import json
import logging

def clean_sql_from_response(response_text: str) -> str:
    """
    LLM 응답에서 SQL 코드만 추출하고 실행 가능하도록 정제
    """
    sql_code = None
    response_text = response_text.strip()

    # 0. ```json 감싸진 응답 정리
    if response_text.startswith("```json"):
        response_text = re.sub(r"^```json", "", response_text)
        response_text = re.sub(r"```$", "", response_text).strip()

    # 1. JSON 파싱 시도
    try:
        json_obj = json.loads(response_text)
        if isinstance(json_obj, dict):
            # ✅ answer → sql_code 경로 우선 시도
            sql_code = (
                json_obj.get("sql_code") or
                json_obj.get("answer", {}).get("sql_code") or
                json_obj.get("query", {}).get("sql_code")
            )

    except json.JSONDecodeError:
        logging.warning("⚠️ JSON 파싱 실패, 코드블럭 추출로 fallback")

    # 2. 코드블럭에서 추출
    if not sql_code:
        match = re.search(r"```(?:sql)?\s*(.*?)```", response_text, re.DOTALL)
        sql_code = match.group(1).strip() if match else ""

    if not sql_code:
        logging.error("❌ SQL 추출 실패: 응답에서 SQL 코드를 찾을 수 없습니다.")
        return ""

    # 3. 이스케이프 및 마크다운 정리
    sql_code = sql_code.replace("\\n", "\n").replace("\\t", "\t").replace("\\\\", "\\")
    sql_code = sql_code.replace("``", "").replace("`", "").strip()

    # 4. 주석 제거
    lines = sql_code.splitlines()
    cleaned_lines = [line for line in lines if not line.strip().startswith("--")]
    cleaned_sql = "\n".join(cleaned_lines).strip()

    # 5. 시작 검증
    if not re.match(r"^\s*(SELECT|WITH|DECLARE)", cleaned_sql, re.IGNORECASE):
        logging.warning("⚠️ SQL이 SELECT 또는 WITH로 시작하지 않음. 잘못된 응답일 수 있음.")
        logging.debug(f"🔍 cleaned_sql: {cleaned_sql}")

    return cleaned_sql


def clean_json_from_response(response_text: str) -> str:
    match = re.search(r"```json\n(.*?)```", response_text, re.DOTALL)
    response_text = re.sub(r"//.*", "", response_text)
    response_text = remove_json_line_comments(response_text)
    if match:
        return match.group(1).strip()
    return response_text.strip()

def remove_json_line_comments(json_str):
    cleaned_lines = []
    for line in json_str.splitlines():
        if '//' in line:
            quote_open = False
            new_line = ''
            i = 0
            while i < len(line):
                if line[i] == '"':
                    quote_open = not quote_open
                    new_line += line[i]
                    i += 1
                elif not quote_open and line[i:i+2] == '//':
                    break
                else:
                    new_line += line[i]
                    i += 1
            cleaned_lines.append(new_line.rstrip())
        else:
            cleaned_lines.append(line.rstrip())
            
    return '\n'.join(cleaned_lines)


def extract_text_block(response_text: str) -> str:
    text_match = re.search(r"```text\s*(.*?)```", response_text, re.DOTALL)
    return text_match.group(1).strip() if text_match else ""

def extract_need_chart_flag(response_text: str) -> bool:
    try:
        match = re.search(r'"need_chart"\s*:\s*(true|false)', response_text, re.IGNORECASE)
        return match and match.group(1).lower() == "true"
    except:
        return False
