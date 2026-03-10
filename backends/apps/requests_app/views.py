from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Request
from .serializers import RequestSerializer


class RequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "gestionnaire":
            demandes = Request.objects.all().order_by("-date_creation")
        else:
            demandes = Request.objects.filter(
                createur=request.user
            ).order_by("-date_creation")

        serializer = RequestSerializer(demandes, many=True)
        return Response({"requests": serializer.data})

    def post(self, request):
        serializer = RequestSerializer(data=request.data)

        if serializer.is_valid():
            demande = serializer.save(createur=request.user)
            return Response(
                {"request": RequestSerializer(demande).data},
                status=status.HTTP_201_CREATED
            )

        return Response({"erreurs": serializer.errors}, status=400)


class RequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Request.objects.get(pk=pk)
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
                status=403
            )

        serializer = RequestSerializer(demande, data=request.data, partial=True)

        if serializer.is_valid():
            demande = serializer.save()
            return Response({"request": RequestSerializer(demande).data})

        return Response({"erreurs": serializer.errors}, status=400)


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

        demande.statut = statut
        demande.save()

        return Response({"message": "Statut mis à jour"})