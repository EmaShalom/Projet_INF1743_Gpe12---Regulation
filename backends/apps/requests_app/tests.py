"""
Tests des demandes — apps.requests_app
Couvre : CRUD, permissions par rôle, règle métier (no edit after IN_PROGRESS),
         et preuve de l'optimisation N+1 via assertNumQueries.
"""
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Request
from apps.comments.models import Comment

User = get_user_model()

LIST_URL = "/api/requests/"
DETAIL_URL = lambda pk: f"/api/requests/{pk}/"
STATUS_URL = lambda pk: f"/api/requests/{pk}/status/"


class BaseTestCase(APITestCase):
    """Classe de base : crée deux utilisateurs et fournit des helpers d'authentification."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="etudiant@uqo.ca", nom_complet="Étudiant Test", password="Pass123"
        )
        self.user2 = User.objects.create_user(
            email="etudiant2@uqo.ca", nom_complet="Étudiant Deux", password="Pass123"
        )
        self.gestionnaire = User.objects.create_user(
            email="gestionnaire@uqo.ca",
            nom_complet="Gestionnaire Test",
            password="Pass123",
            role="gestionnaire",
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def creer_demande(self, user=None, **kwargs):
        defaults = {"titre": "Problème VPN", "description": "Je ne peux plus me connecter.", "type": "Technique"}
        defaults.update(kwargs)
        return Request.objects.create(createur=user or self.user, **defaults)


# ──────────────────────────────────────────────────────────────
#  Permissions : non authentifié
# ──────────────────────────────────────────────────────────────

class TestPermissionsNonAuthentifie(BaseTestCase):
    """Un utilisateur non connecté ne peut accéder à aucun endpoint."""

    def test_liste_refusee(self):
        response = self.client.get(LIST_URL)
        self.assertEqual(response.status_code, 401)

    def test_detail_refuse(self):
        demande = self.creer_demande()
        response = self.client.get(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 401)

    def test_creation_refusee(self):
        response = self.client.post(LIST_URL, {}, format="json")
        self.assertEqual(response.status_code, 401)


# ──────────────────────────────────────────────────────────────
#  Critère bonus : lecture des demandes
# ──────────────────────────────────────────────────────────────

class TestLectureDemandes(BaseTestCase):
    """Critère bonus : lecture des demandes + permissions selon le rôle"""

    def test_utilisateur_voit_uniquement_ses_demandes(self):
        """Un utilisateur ne reçoit que ses propres demandes."""
        self.creer_demande(user=self.user, titre="Ma demande")
        self.creer_demande(user=self.user2, titre="Sa demande")

        self.authenticate(self.user)
        response = self.client.get(LIST_URL)

        self.assertEqual(response.status_code, 200)
        titres = [r["titre"] for r in response.data["requests"]]
        self.assertIn("Ma demande", titres)
        self.assertNotIn("Sa demande", titres)

    def test_gestionnaire_voit_toutes_les_demandes(self):
        """Un gestionnaire reçoit les demandes de tous les utilisateurs."""
        self.creer_demande(user=self.user, titre="Demande A")
        self.creer_demande(user=self.user2, titre="Demande B")

        self.authenticate(self.gestionnaire)
        response = self.client.get(LIST_URL)

        self.assertEqual(response.status_code, 200)
        titres = [r["titre"] for r in response.data["requests"]]
        self.assertIn("Demande A", titres)
        self.assertIn("Demande B", titres)

    def test_utilisateur_ne_peut_pas_voir_demande_dun_autre(self):
        """Un utilisateur ne peut pas consulter la demande d'un autre."""
        demande = self.creer_demande(user=self.user2)

        self.authenticate(self.user)
        response = self.client.get(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 403)

    def test_gestionnaire_peut_voir_nimporte_quelle_demande(self):
        """Un gestionnaire peut consulter la demande de n'importe quel utilisateur."""
        demande = self.creer_demande(user=self.user)

        self.authenticate(self.gestionnaire)
        response = self.client.get(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 200)

    def test_detail_introuvable(self):
        """Une demande inexistante retourne 404."""
        self.authenticate(self.user)
        response = self.client.get(DETAIL_URL(99999))
        self.assertEqual(response.status_code, 404)

    def test_reponse_inclut_commentaires(self):
        """La réponse d'une demande inclut ses commentaires."""
        demande = self.creer_demande()
        Comment.objects.create(demande=demande, auteur=self.gestionnaire, contenu="Nous avons bien reçu.")

        self.authenticate(self.user)
        response = self.client.get(DETAIL_URL(demande.pk))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["request"]["commentaires"]), 1)
        self.assertEqual(response.data["request"]["commentaires"][0]["contenu"], "Nous avons bien reçu.")


# ──────────────────────────────────────────────────────────────
#  Critère bonus : création d'une demande
# ──────────────────────────────────────────────────────────────

class TestCreationDemande(BaseTestCase):
    """Critère bonus : création d'une demande"""

    VALID_DATA = {
        "titre": "Problème d'accès à Moodle",
        "description": "Je ne parviens pas à me connecter depuis ce matin.",
        "type": "Technique",
    }

    def test_creation_reussie(self):
        """Un utilisateur authentifié peut créer une demande."""
        self.authenticate(self.user)
        response = self.client.post(LIST_URL, self.VALID_DATA, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["request"]["statut"], "SUBMITTED")
        self.assertEqual(response.data["request"]["createur"]["email"], "etudiant@uqo.ca")
        self.assertTrue(Request.objects.filter(titre="Problème d'accès à Moodle").exists())

    def test_creation_champs_manquants(self):
        """La création échoue si des champs obligatoires sont absents."""
        self.authenticate(self.user)
        response = self.client.post(LIST_URL, {"titre": "Seulement le titre"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("erreurs", response.data)

    def test_statut_initial_est_submitted(self):
        """Le statut initial d'une demande créée est toujours SUBMITTED."""
        self.authenticate(self.user)
        data = {**self.VALID_DATA, "statut": "RESOLVED"}  # tentative de forcer le statut
        response = self.client.post(LIST_URL, data, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["request"]["statut"], "SUBMITTED")


# ──────────────────────────────────────────────────────────────
#  Critère bonus : modification d'une demande
# ──────────────────────────────────────────────────────────────

class TestModificationDemande(BaseTestCase):
    """Critère bonus : modification + impossibilité de modifier après IN_PROGRESS"""

    def test_proprietaire_peut_modifier_demande_submitted(self):
        """Le propriétaire peut modifier une demande au statut SUBMITTED."""
        demande = self.creer_demande()

        self.authenticate(self.user)
        response = self.client.put(
            DETAIL_URL(demande.pk),
            {"titre": "Nouveau titre", "description": "Nouvelle description.", "type": "Bug"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["request"]["titre"], "Nouveau titre")

    def test_impossible_de_modifier_apres_in_progress(self):
        """RÈGLE MÉTIER : modification interdite dès que le statut passe à IN_PROGRESS."""
        demande = self.creer_demande(statut="IN_PROGRESS")

        self.authenticate(self.user)
        response = self.client.put(
            DETAIL_URL(demande.pk),
            {"titre": "Tentative", "description": "Essai.", "type": "Bug"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("SUBMITTED", response.data["error"])

    def test_impossible_de_modifier_apres_resolved(self):
        """RÈGLE MÉTIER : modification interdite au statut RESOLVED."""
        demande = self.creer_demande(statut="RESOLVED")

        self.authenticate(self.user)
        response = self.client.put(DETAIL_URL(demande.pk), {"titre": "X", "description": "Y.", "type": "Bug"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_impossible_de_modifier_apres_closed(self):
        """RÈGLE MÉTIER : modification interdite au statut CLOSED."""
        demande = self.creer_demande(statut="CLOSED")

        self.authenticate(self.user)
        response = self.client.put(DETAIL_URL(demande.pk), {"titre": "X", "description": "Y.", "type": "Bug"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_utilisateur_ne_peut_pas_modifier_demande_dautrui(self):
        """Un utilisateur ne peut pas modifier la demande d'un autre."""
        demande = self.creer_demande(user=self.user2)

        self.authenticate(self.user)
        response = self.client.put(
            DETAIL_URL(demande.pk),
            {"titre": "Intrusion", "description": "Tentative.", "type": "Bug"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)


# ──────────────────────────────────────────────────────────────
#  Critère bonus : suppression d'une demande
# ──────────────────────────────────────────────────────────────

class TestSuppressionDemande(BaseTestCase):
    """Suppression d'une demande (uniquement par le propriétaire au statut SUBMITTED)"""

    def test_proprietaire_peut_supprimer_demande_submitted(self):
        """Le propriétaire peut supprimer sa demande si statut = SUBMITTED."""
        demande = self.creer_demande()

        self.authenticate(self.user)
        response = self.client.delete(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Request.objects.filter(pk=demande.pk).exists())

    def test_impossible_de_supprimer_apres_in_progress(self):
        """La suppression est refusée si la demande est IN_PROGRESS."""
        demande = self.creer_demande(statut="IN_PROGRESS")

        self.authenticate(self.user)
        response = self.client.delete(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 403)

    def test_utilisateur_ne_peut_pas_supprimer_demande_dautrui(self):
        """Un utilisateur ne peut pas supprimer la demande d'un autre."""
        demande = self.creer_demande(user=self.user2)

        self.authenticate(self.user)
        response = self.client.delete(DETAIL_URL(demande.pk))
        self.assertEqual(response.status_code, 403)


# ──────────────────────────────────────────────────────────────
#  Critère bonus : permissions selon le rôle (changement de statut)
# ──────────────────────────────────────────────────────────────

class TestChangementStatut(BaseTestCase):
    """Critère bonus : permissions selon le rôle"""

    def test_gestionnaire_peut_changer_statut(self):
        """Un gestionnaire peut faire avancer le statut d'une demande."""
        demande = self.creer_demande()

        self.authenticate(self.gestionnaire)
        response = self.client.patch(STATUS_URL(demande.pk), {"statut": "IN_PROGRESS"}, format="json")

        self.assertEqual(response.status_code, 200)
        demande.refresh_from_db()
        self.assertEqual(demande.statut, "IN_PROGRESS")

    def test_utilisateur_ne_peut_pas_changer_statut(self):
        """Un utilisateur ordinaire ne peut pas changer le statut."""
        demande = self.creer_demande()

        self.authenticate(self.user)
        response = self.client.patch(STATUS_URL(demande.pk), {"statut": "IN_PROGRESS"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_statut_invalide_rejete(self):
        """Un statut hors des valeurs acceptées est rejeté."""
        demande = self.creer_demande()

        self.authenticate(self.gestionnaire)
        response = self.client.patch(STATUS_URL(demande.pk), {"statut": "BROUILLON"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_cycle_complet_des_statuts(self):
        """Le gestionnaire peut parcourir tout le cycle SUBMITTED→IN_PROGRESS→RESOLVED→CLOSED."""
        demande = self.creer_demande()
        self.authenticate(self.gestionnaire)

        for statut in ("IN_PROGRESS", "RESOLVED", "CLOSED"):
            response = self.client.patch(STATUS_URL(demande.pk), {"statut": statut}, format="json")
            self.assertEqual(response.status_code, 200)
            demande.refresh_from_db()
            self.assertEqual(demande.statut, statut)


# ──────────────────────────────────────────────────────────────
#  Preuve de l'optimisation N+1
# ──────────────────────────────────────────────────────────────

class TestOptimisationRequetes(BaseTestCase):
    """
    Prouve l'optimisation select_related / prefetch_related.

    Configuration :  2 demandes × 2 commentaires chacune.

    Sans optimisation :
        1 (auth JWT) + 1 (demandes) + 2 (creaturs) + 2 (sets commentaires) + 4 (auteurs) = 10 requêtes

    Avec optimisation :
        1 (auth JWT) + 1 (demandes + createur JOIN) + 1 (commentaires + auteur JOIN) = 3 requêtes
    """

    def setUp(self):
        super().setUp()
        demande1 = self.creer_demande(user=self.user, titre="D1")
        demande2 = self.creer_demande(user=self.user, titre="D2")
        for demande in (demande1, demande2):
            Comment.objects.create(demande=demande, auteur=self.gestionnaire, contenu="Réponse 1")
            Comment.objects.create(demande=demande, auteur=self.gestionnaire, contenu="Réponse 2")

    def test_liste_executee_en_3_requetes(self):
        """
        La liste des demandes s'exécute en exactement 3 requêtes SQL
        (indépendamment du nombre de demandes et de commentaires).
        """
        self.authenticate(self.gestionnaire)

        with self.assertNumQueries(3):
            response = self.client.get(LIST_URL)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["requests"]), 2)
        # Vérifie que les commentaires sont bien inclus sans requête supplémentaire
        for req in response.data["requests"]:
            self.assertEqual(len(req["commentaires"]), 2)
