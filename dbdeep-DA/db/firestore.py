from google.cloud import firestore
from google.oauth2 import service_account
from config.settings import settings
from functools import lru_cache
import os

@lru_cache(maxsize=1)
def get_firestore_client():
    credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS

    if credentials_path:
        if os.path.exists(credentials_path):
            credentials = service_account.Credentials.from_service_account_file(credentials_path)
            return firestore.Client(credentials=credentials, project=settings.GOOGLE_CLOUD_PROJECT)
        else:
            print(f"⚠️ [Firestore] 경로가 존재하지 않습니다: {credentials_path}, ADC로 fallback 합니다.")

    return firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)
