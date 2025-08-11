import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

logger = logging.getLogger(__name__)

class SimpleCorsMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Log the request for debugging
        logger.info(f"Simple CORS - Request: {request.method} {request.path}")
        logger.info(f"Simple CORS - Origin: {request.headers.get('Origin', 'No Origin')}")
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = 'https://chat-web-app-mocha.vercel.app'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            logger.info(f"Simple CORS - Preflight response for {request.path}")
            return response
        
        return None

    def process_response(self, request, response):
        # Add CORS headers to all responses
        origin = request.headers.get('Origin')
        
        # Allow requests from your frontend domain
        if origin == 'https://chat-web-app-mocha.vercel.app':
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            
            logger.info(f"Simple CORS - Added headers for {request.path}")
        
        return response 