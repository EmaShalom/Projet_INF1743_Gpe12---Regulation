from rest_framework import serializers
from .models import Comment


class CommentAuteurSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)


class CommentSerializer(serializers.ModelSerializer):
    auteur = CommentAuteurSerializer(read_only=True)
    demande = serializers.IntegerField(source="demande.id", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "demande",
            "auteur",
            "contenu",
            "date_creation",
        ]
        read_only_fields = [
            "demande",
            "auteur",
            "date_creation",
        ]