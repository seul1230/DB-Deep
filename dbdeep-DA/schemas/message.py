from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime
import time

class Timestamp(BaseModel):
    seconds: int = Field(default_factory=lambda: int(time.time()))
    nanos: int = Field(default_factory=lambda: datetime.now().microsecond * 1000)

class Message(BaseModel):
    id: str
    senderType: str
    content: Dict[str, Any]
    timestamp: Timestamp
