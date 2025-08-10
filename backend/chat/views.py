from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user).order_by("-created_at")

    def perform_create(self, serializer):
        # Add current user to participant_ids if not already included
        participant_ids = self.request.data.get("participant_ids") or []
        if self.request.user.id not in participant_ids:
            participant_ids.append(self.request.user.id)
        
        # Create conversation with all participants
        conversation = serializer.save(participant_ids=participant_ids)
        
        # For direct messages, we don't need to set a specific title
        # The display_title will be calculated dynamically in the serializer


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        conversation_id = self.kwargs["conversation_id"]
        conversation = Conversation.objects.get(pk=conversation_id)
        if not conversation.participants.filter(pk=user.pk).exists():
            raise PermissionDenied("Not a participant of this conversation")
        return Message.objects.filter(conversation=conversation)

    def perform_create(self, serializer):
        user = self.request.user
        conversation_id = self.kwargs["conversation_id"]
        conversation = Conversation.objects.get(pk=conversation_id)
        if not conversation.participants.filter(pk=user.pk).exists():
            raise PermissionDenied("Not a participant of this conversation")
        
        print(f"Creating message: conversation_id={conversation_id}, sender={user.username}, content={serializer.validated_data.get('content')}")
        message = serializer.save(conversation=conversation, sender=user)
        print(f"Message created successfully: id={message.id}")
        return message

from django.shortcuts import render

# Create your views here.
