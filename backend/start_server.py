#!/usr/bin/env python
"""
Script to start the Django server with Daphne for WebSocket support.
"""

import os
import sys
import subprocess
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    try:
        import channels
        print("✅ channels installed")
    except ImportError:
        print("❌ channels not installed. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "channels==4.0.0"])
    
    try:
        import daphne
        print("✅ daphne installed")
    except ImportError:
        print("❌ daphne not installed. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "daphne"])
    
    try:
        import redis
        print("✅ redis installed")
    except ImportError:
        print("❌ redis not installed. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "redis==5.0.1"])

def start_daphne_server():
    """Start the server with Daphne"""
    print("\n🚀 Starting Django server with Daphne...")
    print("📍 Server will be available at: http://localhost:8000")
    print("🔌 WebSocket endpoint: ws://localhost:8000/ws/chat/{conversation_id}/")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start Daphne server
        subprocess.run([
            sys.executable, "-m", "daphne",
            "-b", "0.0.0.0",
            "-p", "8000",
            "config.asgi:application"
        ])
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

def main():
    print("🎯 Django Chat Server with WebSocket Support")
    print("=" * 50)
    
    # Check and install dependencies
    check_dependencies()
    
    # Start server
    start_daphne_server()

if __name__ == "__main__":
    main() 