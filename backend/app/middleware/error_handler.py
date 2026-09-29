"""JSON error responses that avoid leaking internal exception details."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, error: Exception) -> JSONResponse:
        logger.exception("Unhandled error for %s", request.url.path, exc_info=error)
        return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
