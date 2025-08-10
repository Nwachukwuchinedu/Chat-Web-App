from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Conversation, Message


User = get_user_model()


class UserSlimSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "display_name"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSlimSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "created_at"]
        read_only_fields = ["id", "sender", "conversation", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSlimSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True, required=False
    )
    display_title = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "display_title",
            "participants",
            "participant_ids",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_display_title(self, obj):
        """Get the appropriate title for the current user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.title
        
        # For direct messages (2 participants), show the other person's name
        if obj.participants.count() == 2:
            other_user = obj.participants.exclude(id=request.user.id).first()
            if other_user:
                return other_user.display_name or other_user.username
        
        # For group chats, use the stored title
        return obj.title

    def create(self, validated_data):
        # Remove participant_ids from validated_data before creating the model
        participant_ids = validated_data.pop('participant_ids', [])
        
        # Create the conversation
        conversation = Conversation.objects.create(**validated_data)
        
        # Add participants
        for user in participant_ids:
            conversation.participants.add(user)
        
        return conversation

