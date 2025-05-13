from pydantic import BaseModel
from typing import Any, Optional

class BaseResponse(BaseModel):
    success: bool
    message: Optional[str] = "요청이 정상 처리되었습니다."
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
