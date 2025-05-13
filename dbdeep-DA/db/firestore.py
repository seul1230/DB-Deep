from google.cloud import firestore
from config.settings import settings
from functools import lru_cache

@lru_cache(maxsize=1)
def get_firestore_client():
    return firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)