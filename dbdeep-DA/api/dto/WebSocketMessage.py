from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class WebSocketMessage(BaseModel):
    type: str
    payload: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str = datetime.now().isoformat()
