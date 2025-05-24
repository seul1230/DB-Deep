from fastapi import Request
from fastapi.responses import JSONResponse
from exceptions.custom_exceptions import ChatroomNotFoundException, SQLExecutionException

def register_exception_handlers(app):
    @app.exception_handler(ChatroomNotFoundException)
    async def chatroom_not_found_handler(request: Request, exc: ChatroomNotFoundException):
        return JSONResponse(status_code=404, content={"success": False, "message": exc.message})

    @app.exception_handler(SQLExecutionException)
    async def sql_error_handler(request: Request, exc: SQLExecutionException):
        return JSONResponse(status_code=500, content={"success": False, "message": exc.message})
