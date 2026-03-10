from rest_framework import serializers
from apps.comments.models import Comment


class NotificationAuteurSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)


class NotificationDemandeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    titre = serializers.CharField(read_only=True)
    statut = serializers.CharField(read_only=True)


class NotificationSerializer(serializers.ModelSerializer):
    auteur = NotificationAuteurSerializer(read_only=True)
    demande = NotificationDemandeSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "contenu",
            "date_creation",
            "auteur",
            "demande",
        ]