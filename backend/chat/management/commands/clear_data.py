from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from chat.models import Conversation, Message
from django.db import connection

User = get_user_model()


class Command(BaseCommand):
    help = 'Clear all data from the database (users, conversations, messages)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt',
        )
        parser.add_argument(
            '--users-only',
            action='store_true',
            help='Clear only users (this will also clear conversations and messages)',
        )
        parser.add_argument(
            '--conversations-only',
            action='store_true',
            help='Clear only conversations and messages',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  WARNING: This will permanently delete all data from the database!'
                )
            )
            self.stdout.write('This action cannot be undone.')
            
            if options['users_only']:
                self.stdout.write('You have selected to clear USERS ONLY.')
            elif options['conversations_only']:
                self.stdout.write('You have selected to clear CONVERSATIONS AND MESSAGES ONLY.')
            else:
                self.stdout.write('You have selected to clear ALL DATA.')
            
            confirm = input('\nType "YES" to confirm: ')
            if confirm != 'YES':
                self.stdout.write(
                    self.style.ERROR('Operation cancelled.')
                )
                return

        try:
            if options['users_only']:
                # Clear users (this will cascade to conversations and messages)
                user_count = User.objects.count()
                User.objects.all().delete()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {user_count} users')
                )
            elif options['conversations_only']:
                # Clear conversations and messages only
                message_count = Message.objects.count()
                conversation_count = Conversation.objects.count()
                
                Message.objects.all().delete()
                Conversation.objects.all().delete()
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {message_count} messages')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {conversation_count} conversations')
                )
            else:
                # Clear everything
                message_count = Message.objects.count()
                conversation_count = Conversation.objects.count()
                user_count = User.objects.count()
                
                Message.objects.all().delete()
                Conversation.objects.all().delete()
                User.objects.all().delete()
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {message_count} messages')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {conversation_count} conversations')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Deleted {user_count} users')
                )

            self.stdout.write(
                self.style.SUCCESS('\n🎉 Database cleared successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error clearing database: {str(e)}')
            )
            raise 