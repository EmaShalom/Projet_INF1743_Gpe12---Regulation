from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Comment
from .serializers import CommentSerializer
from apps.requests_app.models import Request


class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        try:
            demande = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response({"error": "Demande introuvable"}, status=404)

        if request.user.role != "gestionnaire" and demande.createur != request.user:
            return Response({"error": "Accès refusé"}, status=403)

        commentaires = Comment.objects.filter(demande=demande).order_by("date_creation")
        serializer = CommentSerializer(commentaires, many=True)
        return Response({"comments": serializer.data})

    def post(self, request, request_id):
        try:
            demande = Request.objects.get(pk=request_id)
        except Request.DoesNotExist:
            return Response({"error": "Demande introuvable"}, status=404)

        if request.user.role != "gestionnaire" and demande.createur != request.user:
            return Response({"error": "Accès refusé"}, status=403)

        if demande.statut == "CLOSED":
            return Response(
                {"error": "Impossible d'ajouter un commentaire sur une demande fermée"},
                status=400
            )

        serializer = CommentSerializer(data=request.data)

        if serializer.is_valid():
            commentaire = serializer.save(
                auteur=request.user,
                demande=demande
            )
            return Response(
                {"comment": CommentSerializer(commentaire).data},
                status=status.HTTP_201_CREATED
            )

        return Response({"erreurs": serializer.errors}, status=400)