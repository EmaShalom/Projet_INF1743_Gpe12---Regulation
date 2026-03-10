from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.comments.models import Comment
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "gestionnaire":
            return Response({"notifications": []})

        notifications = Comment.objects.filter(
            demande__createur=request.user,
            auteur__role="gestionnaire"
        ).select_related(
            "auteur",
            "demande"
        ).order_by("-date_creation")

        serializer = NotificationSerializer(notifications, many=True)
        return Response({"notifications": serializer.data})