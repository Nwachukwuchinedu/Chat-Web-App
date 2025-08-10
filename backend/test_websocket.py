#!/usr/bin/env python
"""
Test script to verify WebSocket setup is working correctly.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_imports():
    """Test that all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from channels.routing import ProtocolTypeRouter, URLRouter
        print("✅ channels.routing imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import channels.routing: {e}")
        return False
    
    try:
        from channels.auth import AuthMiddlewareStack
        print("✅ channels.auth imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import channels.auth: {e}")
        return False
    
    try:
        from chat.routing import websocket_urlpatterns
        print("✅ chat.routing imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import chat.routing: {e}")
        return False
    
    try:
        from chat.middleware import JWTAuthMiddleware
        print("✅ chat.middleware imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import chat.middleware: {e}")
        return False
    
    try:
        from chat.consumers import ChatConsumer
        print("✅ chat.consumers imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import chat.consumers: {e}")
        return False
    
    return True

def test_models():
    """Test that models can be imported and used"""
    print("\n🔍 Testing models...")
    
    try:
        from chat.models import Conversation, Message
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        print("✅ All models imported successfully")
        
        # Test model creation (without saving)
        user = User(username="test_user", email="test@example.com")
        conversation = Conversation(title="Test Conversation")
        message = Message(content="Test message", sender=user, conversation=conversation)
        
        print("✅ Model instances created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to test models: {e}")
        return False

def test_asgi_config():
    """Test ASGI configuration"""
    print("\n🔍 Testing ASGI configuration...")
    
    try:
        from config.asgi import application
        print("✅ ASGI application created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create ASGI application: {e}")
        return False

def main():
    print("🚀 WebSocket Setup Test")
    print("=" * 40)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please install missing dependencies.")
        return False
    
    # Test models
    if not test_models():
        print("\n❌ Model tests failed. Check your model definitions.")
        return False
    
    # Test ASGI config
    if not test_asgi_config():
        print("\n❌ ASGI configuration failed. Check your ASGI setup.")
        return False
    
    print("\n🎉 All tests passed! WebSocket setup is working correctly.")
    print("\nNext steps:")
    print("1. Start the server: python manage.py runserver 0.0.0.0:8000")
    print("2. Test WebSocket connection in the frontend")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 