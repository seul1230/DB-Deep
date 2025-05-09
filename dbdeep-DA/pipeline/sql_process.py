import os
import re
import logging
from google.cloud import bigquery
from google.oauth2 import service_account

# ----------------------------
# 인사팀 여부 판별
# ----------------------------
def is_hr_team(department: str) -> bool:
    hr_keywords = {"인사팀", "인사관리", "인력개발"}
    return department.strip() in hr_keywords

# ----------------------------
# GPT 응답에서 SQL 추출
# ----------------------------
def clean_sql_from_response(response_text: str) -> str:
    match = re.search(r"```sql\s*(.*?)```", response_text, re.DOTALL)
    sql_code = match.group(1) if match else response_text
    lines = sql_code.splitlines()
    return "\n".join([line for line in lines if not line.strip().startswith("--")]).strip()

# GPT 응답에서 JSON 블록 추출
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

# ----------------------------
# BigQuery 실행 + 검증 로직
# ----------------------------
class SQLExecutor:
    def __init__(self):
        credentials_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
        project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        self.bq_client = bigquery.Client(credentials=credentials, project=project_id)

    def validate(self, query: str, location: str = "asia-northeast3"):
        """
        SQL 유효성 검사만 수행합니다. (dry_run)
        유효하지 않으면 BadRequest 예외 발생
        """
        job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
        logging.info("🔍 SQL 유효성 검사(dry run) 수행 중...")
        self.bq_client.query(query, job_config=job_config, location=location)

    def execute(self, query: str, location: str = "asia-northeast3"):
        """
        실제 쿼리 실행 후 DataFrame 반환
        """
        try:
            logging.info(f"🚀 SQL 실행 시도...")
            return self.bq_client.query(query, location=location).to_dataframe()
        except Exception as e:
            logging.warning(f"❌ SQL 실행 실패: {e}")
            return None
