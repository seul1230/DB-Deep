from google.cloud import firestore
from google.oauth2 import service_account
from config.settings import settings
from functools import lru_cache

@lru_cache(maxsize=1)
def get_firestore_client():
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_APPLICATION_CREDENTIALS
    )
    return firestore.Client(credentials=credentials, project=settings.GOOGLE_CLOUD_PROJECT)