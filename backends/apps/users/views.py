from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import VerificationCode

User = get_user_model()


def send_code_email(user, code, type):
    if type == "login":
        subject = "Votre code de connexion"
        message = f"Votre code de connexion est : {code}\n\nCe code est valide 15 minutes."
    else:
        subject = "Réinitialisation de mot de passe"
        message = f"Votre code de réinitialisation est : {code}\n\nCe code est valide 15 minutes."

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Utilisateur créé", "user": UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response({"erreurs": serializer.errors}, status=400)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"erreurs": serializer.errors}, status=400)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(username=email, password=password)

        if not user:
            return Response({"error": "Identifiants invalides"}, status=401)

        VerificationCode.objects.filter(user=user, type="login", used=False).update(used=True)

        code = VerificationCode.generate_code()
        VerificationCode.objects.create(
            user=user,
            code=code,
            type="login",
            expires_at=timezone.now() + timedelta(minutes=15)
        )

        send_code_email(user, code, "login")

        return Response(
            {"message": "Code envoyé par email", "email": email},
            status=200
        )


class VerifyLoginCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"error": "Email et code requis"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)

        verification = VerificationCode.objects.filter(
            user=user, code=code, type="login", used=False
        ).last()

        if not verification or not verification.is_valid():
            return Response({"error": "Code invalide ou expiré"}, status=400)

        verification.used = True
        verification.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            },
            status=200
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email requis"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Si cet email existe, un code a été envoyé."}, status=200)

        VerificationCode.objects.filter(user=user, type="reset", used=False).update(used=True)

        code = VerificationCode.generate_code()
        VerificationCode.objects.create(
            user=user,
            code=code,
            type="reset",
            expires_at=timezone.now() + timedelta(minutes=15)
        )

        send_code_email(user, code, "reset")

        return Response({"message": "Si cet email existe, un code a été envoyé."}, status=200)


class VerifyResetCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"error": "Données manquantes"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)

        verification = VerificationCode.objects.filter(
            user=user, code=code, type="reset", used=False
        ).last()

        if not verification or not verification.is_valid():
            return Response({"error": "Code invalide ou expiré"}, status=400)

        return Response({"message": "Code valide"}, status=200)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("password")

        if not all([email, code, new_password]):
            return Response({"error": "Données manquantes"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)

        verification = VerificationCode.objects.filter(
            user=user, code=code, type="reset", used=False
        ).last()

        if not verification or not verification.is_valid():
            return Response({"error": "Code invalide ou expiré"}, status=400)

        verification.used = True
        verification.save()

        user.set_password(new_password)
        user.save()

        return Response({"message": "Mot de passe réinitialisé avec succès"}, status=200)