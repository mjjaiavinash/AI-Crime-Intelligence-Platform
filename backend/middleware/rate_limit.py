import time
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from core.logging import get_logger

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # In-memory rate limiting cache: { ip_address: [timestamps] }
        self.request_records = {}

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_ip = request.client.host
        now = time.time()

        # Get request history for this IP
        history = self.request_records.get(client_ip, [])

        # Filter out expired timestamps
        history = [ts for ts in history if now - ts < self.window_seconds]
        
        # Check rate limit
        if len(history) >= self.max_requests:
            logger.warning("Rate limit exceeded for IP: %s (Requests in window: %d)", client_ip, len(history))
            return Response(
                content="Rate limit exceeded. Prohibited burst. Please wait and try again.",
                status_code=429,
                media_type="text/plain"
            )

        # Update history
        history.append(now)
        self.request_records[client_ip] = history

        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, self.max_requests - len(history)))
        response.headers["X-RateLimit-Reset"] = str(int(self.window_seconds - (now - history[0])))
        return response
