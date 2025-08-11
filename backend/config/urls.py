from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
def health_check(request):
    """Health check endpoint for Render"""
    return JsonResponse({
        "status": "healthy",
        "message": "Chat API is running",
        "version": "1.0.0"
    })

@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def cors_test(request):
    """Test endpoint to check CORS configuration"""
    print(f"🔧 CORS Test - Request method: {request.method}")
    print(f"🔧 CORS Test - Request origin: {request.headers.get('Origin', 'No origin header')}")
    print(f"🔧 CORS Test - Request headers: {dict(request.headers)}")
    
    if request.method == "OPTIONS":
        # Handle preflight request
        response = JsonResponse({"message": "Preflight request handled"})
        response["Access-Control-Allow-Origin"] = "https://chat-web-app-mocha.vercel.app"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        print(f"🔧 CORS Test - Preflight response headers: {dict(response.headers)}")
        return response
    
    return JsonResponse({
        "status": "ok", 
        "message": "CORS test successful",
        "method": request.method,
        "origin": request.headers.get('Origin', 'No origin header'),
        "headers": dict(request.headers)
    })

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def auth_test(request):
    """Test endpoint that mimics the auth endpoint"""
    print(f"🔧 Auth Test - Request method: {request.method}")
    print(f"🔧 Auth Test - Request origin: {request.headers.get('Origin', 'No origin header')}")
    
    if request.method == "OPTIONS":
        # Handle preflight request
        response = JsonResponse({"message": "Auth preflight handled"})
        response["Access-Control-Allow-Origin"] = "https://chat-web-app-mocha.vercel.app"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        print(f"🔧 Auth Test - Preflight response headers: {dict(response.headers)}")
        return response
    
    # Simulate auth response
    return JsonResponse({
        "access": "test_access_token",
        "message": "Auth test successful"
    })

urlpatterns = [
    path("", health_check, name="health_check"),
    path("cors-test/", cors_test, name="cors_test"),
    path("auth-test/", auth_test, name="auth_test"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("chat.urls")),
]
