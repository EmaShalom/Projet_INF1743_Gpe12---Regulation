from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "nom_complet",
            "role",
            "date_creation",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "nom_complet",
            "password",
            "confirmation",
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmation"]:
            raise serializers.ValidationError({
                "confirmation": ["Les mots de passe ne correspondent pas."]
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirmation")
        return User.objects.create_user(
            email=validated_data["email"],
            nom_complet=validated_data["nom_complet"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()