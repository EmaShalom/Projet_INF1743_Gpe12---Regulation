from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Request
from .serializers import RequestSerializer
from apps.comments.models import Comment


# Pre-built queryset used by both list and detail views to eliminate N+1 queries.
# Replaces: 1 + N (creaturs) + N (comment sets) + N*M (comment authors) queries
# With:     3 queries regardless of dataset size
def _request_qs():
    return (
        Request.objects
        .select_related("createur")
        .prefetch_related(
            Prefetch(
                "comments",
                queryset=Comment.objects.select_related("auteur").order_by("date_creation"),
            )
        )
    )


class RequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "gestionnaire":
            demandes = _request_qs().order_by("-date_modification")
        else:
            demandes = _request_qs().filter(createur=request.user).order_by("-date_modification")

        serializer = RequestSerializer(demandes, many=True)
        return Response({"requests": serializer.data})

    def post(self, request):
        serializer = RequestSerializer(data=request.data)

        if serializer.is_valid():
            demande = serializer.save(createur=request.user)
            # Re-fetch with prefetch so response data is consistent
            demande = _request_qs().get(pk=demande.pk)
            return Response(
                {"request": RequestSerializer(demande).data},
                status=status.HTTP_201_CREATED,
            )

        return Response({"erreurs": serializer.errors}, status=400)


class RequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return _request_qs().get(pk=pk)
        except Request.DoesNotExist:
            return None

    def get(self, request, pk):
        demande = self.get_object(pk)

        if not demande:
            return Response({"error": "Demande introuvable."}, status=404)

        if request.user.role != "gestionnaire" and demande.createur != request.user:
            return Response({"error": "Accès refusé"}, status=403)

        serializer = RequestSerializer(demande)
        return Response({"request": serializer.data})

    def put(self, request, pk):
        demande = self.get_object(pk)

        if not demande:
            return Response({"error": "Demande introuvable."}, status=404)

        if demande.createur != request.user:
            return Response({"error": "Modification non autorisée."}, status=403)

        if demande.statut != "SUBMITTED":
            return Response(
                {"error": "Seules les demandes SUBMITTED peuvent être modifiées."},
                status=403,
            )

        serializer = RequestSerializer(demande, data=request.data, partial=True)

        if serializer.is_valid():
            demande = serializer.save()
            demande = _request_qs().get(pk=demande.pk)
            return Response({"request": RequestSerializer(demande).data})

        return Response({"erreurs": serializer.errors}, status=400)

    def delete(self, request, pk):
        demande = self.get_object(pk)

        if not demande:
            return Response({"error": "Demande introuvable."}, status=404)

        if demande.createur != request.user:
            return Response({"error": "Suppression non autorisée."}, status=403)

        if demande.statut != "SUBMITTED":
            return Response(
                {"error": "Seules les demandes SUBMITTED peuvent être supprimées."},
                status=403,
            )

        demande.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RequestStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            demande = Request.objects.get(pk=pk)
        except Request.DoesNotExist:
            return Response({"error": "Demande introuvable."}, status=404)

        if request.user.role != "gestionnaire":
            return Response({"error": "Accès refusé"}, status=403)

        statut = request.data.get("statut")

        if not statut:
            return Response({"error": "Le statut est requis."}, status=400)

        valid_statuts = [s for s, _ in Request.STATUTS]
        if statut not in valid_statuts:
            return Response({"error": f"Statut invalide. Valeurs acceptées : {valid_statuts}"}, status=400)

        demande.statut = statut
        demande.save()

        return Response({"message": "Statut mis à jour", "statut": statut})
