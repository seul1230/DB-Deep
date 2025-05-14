import os
import logging
from config.settings import settings
from google.cloud import bigquery
from google.oauth2 import service_account

class SQLExecutor:
    def __init__(self):
        credentials = service_account.Credentials.from_service_account_file(settings.GOOGLE_APPLICATION_CREDENTIALS)
        if credentials == None:
            self.bq_client = bigquery.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        else:
            self.bq_client = bigquery.Client(credentials=credentials, project=settings.GOOGLE_CLOUD_PROJECT)

    def validate(self, query: str, location: str = "asia-northeast3"):
        job_config = bigquery.QueryJobConfig(dry_run=True, use_query_cache=False)
        logging.info("🔍 SQL 유효성 검사(dry run) 수행 중...")
        self.bq_client.query(query, job_config=job_config, location=location)

    def execute(self, query: str, location: str = "asia-northeast3"):
        try:
            logging.info(f"🚀 SQL 실행 시도...")
            return self.bq_client.query(query, location=location).to_dataframe()
        except Exception as e:
            logging.warning(f"❌ SQL 실행 실패: {e}")
            return None

    def execute_with_retry(self, query: str, retry: int = 3):
        for i in range(retry):
            result = self.execute(query)
            if result is not None:
                return result
        raise RuntimeError("모든 SQL 실행 시도 실패")
