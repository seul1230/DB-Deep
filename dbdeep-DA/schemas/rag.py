from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    question: str
    department: str

class InsightRequest(BaseModel):
    question: str
    chart_spec: dict
    data: List[dict]
    chat_history: Optional[str] = None
    user_department: Optional[str] = None
