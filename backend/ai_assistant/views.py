from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer
from .services import AIService

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, company=self.request.user.company)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        session = self.get_object()
        user_content = request.data.get('content')
        
        if not user_content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Save User Message
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_content
        )

        # 2. Get AI Response
        ai_response_content = AIService.process_query(self.request.user, user_content)

        # 3. Save AI Message
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=ai_response_content
        )

        # 4. Update session title if it's the first message
        if session.messages.count() <= 2:
            session.title = user_content[:50]
            session.save()

        return Response(ChatMessageSerializer(ai_msg).data)
