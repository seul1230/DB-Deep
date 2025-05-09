from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/api/hello")
async def hello(request: Request):
    member_id = request.state.member_id
    return {"member_id": member_id}
