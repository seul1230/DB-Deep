from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    uuid: str
    question: str
    user_department: str

class ChartRequest(BaseModel):
    question: str
    sql_query: str
    user_department: str
    data: List[dict]
    data_summary: Optional[str] = None
    chart_spec: Optional[dict] = None

class InsightRequest(BaseModel):
    question: str
    chart_spec: dict
    data: List[dict]
    chat_history: Optional[str] = None
    user_department: Optional[str] = None
