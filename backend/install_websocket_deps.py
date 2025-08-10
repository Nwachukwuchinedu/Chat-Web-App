#!/usr/bin/env python
"""
Script to install WebSocket dependencies for the chat application.
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    print("🔧 Installing WebSocket dependencies...")
    
    packages = [
        "channels==4.0.0",
        "channels-redis==4.2.0", 
        "redis==5.0.1"
    ]
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n📊 Installation Summary:")
    print(f"Successfully installed: {success_count}/{len(packages)} packages")
    
    if success_count == len(packages):
        print("🎉 All WebSocket dependencies installed successfully!")
        print("\nNext steps:")
        print("1. Run migrations: python manage.py migrate")
        print("2. Start the server: python manage.py runserver 0.0.0.0:8000")
        print("3. Test WebSocket functionality in the frontend")
    else:
        print("⚠️  Some packages failed to install. Please check the errors above.")

if __name__ == "__main__":
    main() 