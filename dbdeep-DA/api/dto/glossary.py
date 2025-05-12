from pydantic import BaseModel, Field
from typing import List

class SaveGlossaryTermRequest(BaseModel):
    key: str
    value: str

class SaveGlossaryTermListRequest(BaseModel):
    terms: List[SaveGlossaryTermRequest]

class UpdateGlossaryTermRequest(BaseModel):
    key: str = Field(..., example="NL2SQL")
    value: str = Field(..., example="자연어를 SQL로 바꾸는 기술")