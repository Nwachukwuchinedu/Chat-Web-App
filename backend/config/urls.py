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
    print(f"🔧 Auth Test - All headers: {dict(request.headers)}")
    
    # Simulate auth response
    response = JsonResponse({
        "access": "test_access_token",
        "message": "Auth test successful"
    })
    print(f"🔧 Auth Test - Final response headers: {dict(response.headers)}")
    return response

urlpatterns = [
    path("", health_check, name="health_check"),
    path("cors-test/", cors_test, name="cors_test"),
    path("auth-test/", auth_test, name="auth_test"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("chat.urls")),
]
