from datetime import datetime
from db.firestore import get_firestore_client

def save_glossary_term(member_id: str, key: str, value: str):
    db = get_firestore_client()
    db.collection("glossary_terms").add({
        "member_id": member_id,
        "key": key,
        "value": value
    })

def save_glossary_terms_batch(member_id: str, terms: list[dict]):
    db = get_firestore_client()
    batch = db.batch()

    for term in terms:
        doc_ref = db.collection("glossary_terms").document()  # 자동 ID 생성
        batch.set(doc_ref, {
            "member_id": member_id,
            "key": term["key"],
            "value": term["value"]
        })

    batch.commit()
