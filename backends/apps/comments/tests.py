"""
Tests des commentaires — apps.comments
Couvre : ajout de commentaires, restrictions d'accès, règle métier (demande fermée).
"""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.requests_app.models import Request
from .models import Comment

User = get_user_model()

COMMENTS_URL = lambda request_id: f"/api/requests/{request_id}/comments/"


class BaseTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="etudiant@uqo.ca", nom_complet="Étudiant", password="Pass123"
        )
        self.user2 = User.objects.create_user(
            email="etudiant2@uqo.ca", nom_complet="Étudiant 2", password="Pass123"
        )
        self.gestionnaire = User.objects.create_user(
            email="gestionnaire@uqo.ca",
            nom_complet="Gestionnaire",
            password="Pass123",
            role="gestionnaire",
        )
        self.demande = Request.objects.create(
            titre="Demande de test",
            description="Description de test.",
            type="Technique",
            createur=self.user,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class TestAjoutCommentaire(BaseTestCase):
    """Tests d'ajout de commentaires."""

    def test_utilisateur_peut_commenter_sa_propre_demande(self):
        """L'auteur d'une demande peut ajouter un commentaire."""
        self.authenticate(self.user)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk),
            {"contenu": "J'ai des informations supplémentaires."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["comment"]["contenu"], "J'ai des informations supplémentaires.")

    def test_gestionnaire_peut_commenter_nimporte_quelle_demande(self):
        """Un gestionnaire peut commenter n'importe quelle demande."""
        self.authenticate(self.gestionnaire)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk),
            {"contenu": "Votre demande est en cours de traitement."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_commentaire_vide_rejete(self):
        """Un commentaire sans contenu est refusé."""
        self.authenticate(self.user)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk), {"contenu": ""}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_utilisateur_ne_peut_pas_commenter_demande_dautrui(self):
        """Un utilisateur ne peut pas commenter la demande d'un autre."""
        self.authenticate(self.user2)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk),
            {"contenu": "Message non autorisé."},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_impossible_de_commenter_demande_fermee(self):
        """RÈGLE MÉTIER : on ne peut pas commenter une demande CLOSED."""
        self.demande.statut = "CLOSED"
        self.demande.save()

        self.authenticate(self.user)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk),
            {"contenu": "Je veux encore commenter."},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_commentaire_sur_demande_inexistante(self):
        """Commenter une demande inexistante retourne 404."""
        self.authenticate(self.user)
        response = self.client.post(COMMENTS_URL(99999), {"contenu": "Test."}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_auteur_commentaire_est_utilisateur_connecte(self):
        """L'auteur du commentaire est automatiquement l'utilisateur authentifié."""
        self.authenticate(self.gestionnaire)
        response = self.client.post(
            COMMENTS_URL(self.demande.pk),
            {"contenu": "Réponse officielle."},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["comment"]["auteur"]["email"], "gestionnaire@uqo.ca")
        self.assertEqual(response.data["comment"]["auteur"]["role"], "gestionnaire")


class TestLectureCommentaires(BaseTestCase):
    """Tests de lecture des commentaires."""

    def setUp(self):
        super().setUp()
        Comment.objects.create(
            demande=self.demande, auteur=self.gestionnaire, contenu="Message du gestionnaire"
        )
        Comment.objects.create(
            demande=self.demande, auteur=self.user, contenu="Réponse de l'étudiant"
        )

    def test_proprietaire_peut_lire_commentaires(self):
        """Le propriétaire peut lire les commentaires de sa demande."""
        self.authenticate(self.user)
        response = self.client.get(COMMENTS_URL(self.demande.pk))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["comments"]), 2)

    def test_gestionnaire_peut_lire_tous_les_commentaires(self):
        """Un gestionnaire peut lire les commentaires de n'importe quelle demande."""
        self.authenticate(self.gestionnaire)
        response = self.client.get(COMMENTS_URL(self.demande.pk))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["comments"]), 2)

    def test_autre_utilisateur_ne_peut_pas_lire(self):
        """Un utilisateur tiers ne peut pas lire les commentaires d'une demande."""
        self.authenticate(self.user2)
        response = self.client.get(COMMENTS_URL(self.demande.pk))
        self.assertEqual(response.status_code, 403)

    def test_commentaires_non_authentifie(self):
        """Un utilisateur non connecté ne peut pas lire les commentaires."""
        response = self.client.get(COMMENTS_URL(self.demande.pk))
        self.assertEqual(response.status_code, 401)
