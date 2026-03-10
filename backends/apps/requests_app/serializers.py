from rest_framework import serializers
from .models import Request


class CreateurMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)


class RequestSerializer(serializers.ModelSerializer):
    createur = CreateurMiniSerializer(read_only=True)
    createur_id = serializers.IntegerField(source="createur.id", read_only=True)
    commentaires = serializers.SerializerMethodField()
    historique = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            "id",
            "titre",
            "description",
            "type",
            "statut",
            "createur",
            "createur_id",
            "date_creation",
            "date_modification",
            "commentaires",
            "historique",
        ]
        read_only_fields = [
            "createur",
            "createur_id",
            "statut",
            "date_creation",
            "date_modification",
            "commentaires",
            "historique",
        ]

    def get_commentaires(self, obj):
        from apps.comments.serializers import CommentSerializer
        commentaires = obj.comments.all().order_by("date_creation")
        return CommentSerializer(commentaires, many=True).data

    def get_historique(self, obj):
        return []