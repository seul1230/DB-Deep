# from fastapi import APIRouter
# from schemas.base_response import BaseResponse
# from schemas.rag import QueryRequest, InsightRequest
# from modules.rag_runner import run_sql_pipeline, run_insight_pipeline_async

# router = APIRouter(prefix="/api", tags=["RAG"])

# @router.post("/nl2sql", response_model=BaseResponse)
# def run_nl2sql_endpoint(request: QueryRequest):
#     result = run_sql_pipeline(request.question, request.department)
#     return BaseResponse(success=True, data=result)

# @router.post("/insight", response_model=BaseResponse)
# async def run_insight_endpoint(request: InsightRequest):
#     insight_text = await run_insight_pipeline_async(request)
#     return BaseResponse(success=True, data={"insight": insight_text})
