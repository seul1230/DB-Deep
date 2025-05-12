from pydantic import BaseModel
from typing import List

class SaveGlossaryTermRequest(BaseModel):
    key: str
    value: str

class SaveGlossaryTermListRequest(BaseModel):
    terms: List[SaveGlossaryTermRequest]
