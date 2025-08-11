from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Q

from .serializers import RegisterSerializer, UserSerializer


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        # Debug logging
        print(f"🔧 Token view - Request method: {request.method}")
        print(f"🔧 Token view - Request origin: {request.headers.get('Origin', 'No Origin')}")
        print(f"🔧 Token view - Response status: {response.status_code}")
        print(f"🔧 Token view - Response headers before: {dict(response.headers)}")
        
        # Get the tokens from the response
        if response.status_code == 200:
            data = response.data
            access_token = data.get('access')
            refresh_token = data.get('refresh')
            
            print(f"Setting refresh token cookie: {refresh_token[:20]}...")  # Debug log
            
            # Set refresh token as HTTP-only cookie
            response.set_cookie(
                'refresh_token',
                refresh_token,
                httponly=True,
                secure=False,  # Set to False for development
                samesite='Lax',
                max_age=60 * 60 * 24 * 7,  # 7 days
                path='/'
            )
            
            # Return only access token in response body
            response.data = {'access': access_token}
            
            print(f"Cookie set successfully. Response data: {response.data}")  # Debug log
        
        final_response = super().finalize_response(request, response, *args, **kwargs)
        print(f"🔧 Token view - Final response headers: {dict(final_response.headers)}")
        return final_response


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Successfully logged out."})
        # Clear the refresh token cookie
        response.delete_cookie('refresh_token')
        return response


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query or not query.strip():
            return User.objects.none()
        
        query = query.strip()
        
        # Search by username, display_name, or email
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(display_name__icontains=query) |
            Q(email__icontains=query)
        ).exclude(id=self.request.user.id)  # Exclude current user
