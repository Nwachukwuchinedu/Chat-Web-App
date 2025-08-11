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
    if request.method == "OPTIONS":
        # Handle preflight request
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    return JsonResponse({
        "status": "ok", 
        "message": "CORS test successful",
        "method": request.method,
        "origin": request.headers.get('Origin', 'No origin header')
    })

urlpatterns = [
    path("", health_check, name="health_check"),
    path("cors-test/", cors_test, name="cors_test"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/", include("chat.urls")),
]
