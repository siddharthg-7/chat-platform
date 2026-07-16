import uuid
from contextvars import ContextVar

# Context var to hold the correlation ID
correlation_id_var = ContextVar('correlation_id', default='-')

class CorrelationIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))
        token = correlation_id_var.set(correlation_id)
        
        try:
            response = self.get_response(request)
            response['X-Correlation-ID'] = correlation_id
            return response
        finally:
            correlation_id_var.reset(token)
