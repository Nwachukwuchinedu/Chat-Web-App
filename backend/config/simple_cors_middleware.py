import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

logger = logging.getLogger(__name__)

print("🔧 SimpleCorsMiddleware module loaded successfully")

class SimpleCorsMiddleware(MiddlewareMixin):
    def __init__(self, get_response=None):
        super().__init__(get_response)
        print("🔧 SimpleCorsMiddleware initialized")
    
    def process_request(self, request):
        # Log the request for debugging
        print(f"🔧 Simple CORS - Request: {request.method} {request.path}")
        print(f"🔧 Simple CORS - Origin: {request.headers.get('Origin', 'No Origin')}")
        logger.info(f"Simple CORS - Request: {request.method} {request.path}")
        logger.info(f"Simple CORS - Origin: {request.headers.get('Origin', 'No Origin')}")
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            print(f"🔧 Simple CORS - Handling OPTIONS preflight for {request.path}")
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = '*'  # Temporarily allow all origins
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'  # 24 hours
            print(f"🔧 Simple CORS - Preflight response headers: {dict(response.headers)}")
            logger.info(f"Simple CORS - Preflight response for {request.path}")
            return response
        
        return None

    def process_response(self, request, response):
        # Add CORS headers to all responses
        origin = request.headers.get('Origin')
        print(f"🔧 Simple CORS - Processing response for {request.path}")
        print(f"🔧 Simple CORS - Response origin: {origin}")
        
        # Temporarily allow all origins for debugging
        if origin:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
            
            print(f"🔧 Simple CORS - Added headers for {request.path}")
            print(f"🔧 Simple CORS - Final response headers: {dict(response.headers)}")
            logger.info(f"Simple CORS - Added headers for {request.path}")
        else:
            print(f"🔧 Simple CORS - No origin header found")
        
        return response 