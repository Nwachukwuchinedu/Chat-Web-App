#!/usr/bin/env python
"""
Database clearing script for the chat application.
This script will clear all data from the database while preserving the structure.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from chat.models import Conversation, Message
from django.db import connection

User = get_user_model()


def clear_all_data():
    """Clear all data from the database."""
    print("🗑️  Database Clearing Script")
    print("=" * 40)
    
    # Show current data counts
    user_count = User.objects.count()
    conversation_count = Conversation.objects.count()
    message_count = Message.objects.count()
    
    print(f"Current data in database:")
    print(f"  Users: {user_count}")
    print(f"  Conversations: {conversation_count}")
    print(f"  Messages: {message_count}")
    print()
    
    if user_count == 0 and conversation_count == 0 and message_count == 0:
        print("✅ Database is already empty!")
        return
    
    # Confirmation
    print("⚠️  WARNING: This will permanently delete all data from the database!")
    print("This action cannot be undone.")
    confirm = input('\nType "YES" to confirm: ')
    
    if confirm != 'YES':
        print("❌ Operation cancelled.")
        return
    
    try:
        # Clear all data
        Message.objects.all().delete()
        Conversation.objects.all().delete()
        User.objects.all().delete()
        
        print(f"✅ Deleted {message_count} messages")
        print(f"✅ Deleted {conversation_count} conversations")
        print(f"✅ Deleted {user_count} users")
        print("\n🎉 Database cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing database: {str(e)}")
        raise


def clear_conversations_only():
    """Clear only conversations and messages, keep users."""
    print("🗑️  Clearing Conversations and Messages Only")
    print("=" * 40)
    
    conversation_count = Conversation.objects.count()
    message_count = Message.objects.count()
    
    print(f"Current data:")
    print(f"  Conversations: {conversation_count}")
    print(f"  Messages: {message_count}")
    print()
    
    if conversation_count == 0 and message_count == 0:
        print("✅ No conversations or messages to clear!")
        return
    
    confirm = input('Type "YES" to confirm clearing conversations and messages: ')
    
    if confirm != 'YES':
        print("❌ Operation cancelled.")
        return
    
    try:
        Message.objects.all().delete()
        Conversation.objects.all().delete()
        
        print(f"✅ Deleted {message_count} messages")
        print(f"✅ Deleted {conversation_count} conversations")
        print("\n🎉 Conversations and messages cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing data: {str(e)}")
        raise


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--conversations-only':
        clear_conversations_only()
    else:
        clear_all_data() 