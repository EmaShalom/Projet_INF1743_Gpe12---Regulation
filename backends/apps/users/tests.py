"""
Tests d'authentification — apps.users
Couvre : inscription, connexion 2FA, réinitialisation de mot de passe
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import VerificationCode

User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
VERIFY_URL = "/api/auth/verify-login/"
FORGOT_URL = "/api/auth/forgot-password/"
VERIFY_RESET_URL = "/api/auth/verify-reset-code/"
RESET_URL = "/api/auth/reset-password/"


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestInscription(APITestCase):
    """Critère bonus : inscription d'un utilisateur"""

    VALID_DATA = {
        "email": "etudiant@uqo.ca",
        "nom_complet": "Marie Dupont",
        "password": "SecurePass123",
        "confirmation": "SecurePass123",
    }

    def test_inscription_reussie(self):
        """Un nouvel utilisateur peut s'inscrire avec des données valides."""
        response = self.client.post(REGISTER_URL, self.VALID_DATA, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "etudiant@uqo.ca")
        self.assertEqual(response.data["user"]["role"], "utilisateur")
        self.assertTrue(User.objects.filter(email="etudiant@uqo.ca").exists())

    def test_inscription_email_en_double(self):
        """L'inscription échoue si l'email est déjà pris."""
        User.objects.create_user(
            email="etudiant@uqo.ca", nom_complet="Existant", password="Pass123"
        )
        response = self.client.post(REGISTER_URL, self.VALID_DATA, format="json")
        self.assertEqual(response.status_code, 400)

    def test_inscription_mots_de_passe_differents(self):
        """L'inscription échoue si les mots de passe ne correspondent pas."""
        data = {**self.VALID_DATA, "confirmation": "AutreMdp999"}
        response = self.client.post(REGISTER_URL, data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("erreurs", response.data)

    def test_inscription_champs_manquants(self):
        """L'inscription échoue si des champs obligatoires sont absents."""
        response = self.client.post(REGISTER_URL, {"email": "x@uqo.ca"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_inscription_email_invalide(self):
        """L'inscription échoue avec un email malformé."""
        data = {**self.VALID_DATA, "email": "pas-un-email"}
        response = self.client.post(REGISTER_URL, data, format="json")
        self.assertEqual(response.status_code, 400)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestAuthentification2FA(APITestCase):
    """Critère bonus : authentification"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="user@uqo.ca", nom_complet="Jean Test", password="Password123"
        )

    def _login_and_get_code(self):
        """Déclenche la connexion et retourne le code de vérification créé."""
        self.client.post(LOGIN_URL, {"email": "user@uqo.ca", "password": "Password123"}, format="json")
        return VerificationCode.objects.filter(user=self.user, type="login", used=False).last()

    def test_connexion_cree_code_verification(self):
        """Une connexion valide crée un VerificationCode en base."""
        response = self.client.post(
            LOGIN_URL, {"email": "user@uqo.ca", "password": "Password123"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.data)
        self.assertTrue(
            VerificationCode.objects.filter(user=self.user, type="login", used=False).exists()
        )

    def test_connexion_envoie_un_email(self):
        """La connexion envoie un email avec le code."""
        self.client.post(
            LOGIN_URL, {"email": "user@uqo.ca", "password": "Password123"}, format="json"
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("user@uqo.ca", mail.outbox[0].to)

    def test_connexion_identifiants_invalides(self):
        """La connexion échoue avec un mauvais mot de passe."""
        response = self.client.post(
            LOGIN_URL, {"email": "user@uqo.ca", "password": "MauvaisMdp"}, format="json"
        )
        self.assertEqual(response.status_code, 401)

    def test_verification_code_retourne_jwt(self):
        """La vérification du bon code retourne un token JWT."""
        verification = self._login_and_get_code()
        response = self.client.post(
            VERIFY_URL, {"email": "user@uqo.ca", "code": verification.code}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["email"], "user@uqo.ca")

    def test_verification_code_incorrect(self):
        """La vérification échoue avec un mauvais code."""
        self._login_and_get_code()
        response = self.client.post(
            VERIFY_URL, {"email": "user@uqo.ca", "code": "000000"}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_verification_code_expire(self):
        """La vérification échoue si le code est expiré."""
        verification = self._login_and_get_code()
        verification.expires_at = timezone.now() - timedelta(minutes=1)
        verification.save()

        response = self.client.post(
            VERIFY_URL, {"email": "user@uqo.ca", "code": verification.code}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_verification_code_deja_utilise(self):
        """La vérification échoue si le code a déjà été consommé."""
        verification = self._login_and_get_code()
        verification.used = True
        verification.save()

        response = self.client.post(
            VERIFY_URL, {"email": "user@uqo.ca", "code": verification.code}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_connexion_utilisateur_inconnu(self):
        """La connexion échoue pour un email inexistant."""
        response = self.client.post(
            LOGIN_URL, {"email": "inconnu@uqo.ca", "password": "Password123"}, format="json"
        )
        self.assertEqual(response.status_code, 401)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class TestReinitialisationMotDePasse(APITestCase):
    """Critère bonus : authentification — flux mot de passe oublié"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="user@uqo.ca", nom_complet="Jean Test", password="AncienMdp123"
        )

    def _creer_code_reset(self):
        code = VerificationCode.generate_code()
        VerificationCode.objects.create(
            user=self.user,
            code=code,
            type="reset",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        return code

    def test_demande_reinitialisation_email_connu(self):
        """Une demande de reset pour un email connu répond 200 (sans révéler l'existence)."""
        response = self.client.post(FORGOT_URL, {"email": "user@uqo.ca"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_demande_reinitialisation_email_inconnu(self):
        """Une demande de reset pour un email inconnu répond 200 (pas d'information fuité)."""
        response = self.client.post(FORGOT_URL, {"email": "inconnu@uqo.ca"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_reinitialisation_reussie(self):
        """Le mot de passe est modifié avec un code valide."""
        code = self._creer_code_reset()
        response = self.client.post(
            RESET_URL,
            {"email": "user@uqo.ca", "code": code, "password": "NouveauMdp456"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NouveauMdp456"))

    def test_reinitialisation_code_invalide(self):
        """La réinitialisation échoue avec un mauvais code."""
        self._creer_code_reset()
        response = self.client.post(
            RESET_URL,
            {"email": "user@uqo.ca", "code": "000000", "password": "NouveauMdp456"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
