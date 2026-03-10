from django.db import models
from django.conf import settings


class Request(models.Model):

    STATUTS = [
        ("SUBMITTED", "Soumis"),
        ("IN_PROGRESS", "En cours"),
        ("RESOLVED", "Résolu"),
        ("CLOSED", "Fermé"),
    ]

    TYPES = [
        ("Technique", "Technique"),
        ("Bug", "Bug"),
        ("Fonctionnalité", "Fonctionnalité"),
        ("Question", "Question"),
        ("Amélioration", "Amélioration"),
        ("Performance", "Performance"),
        ("Autre", "Autre"),
    ]

    titre = models.CharField(max_length=200)

    description = models.TextField()

    type = models.CharField(
        max_length=50,
        choices=TYPES
    )

    statut = models.CharField(
        max_length=50,
        choices=STATUTS,
        default="SUBMITTED"
    )

    createur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="requests"
    )

    date_creation = models.DateTimeField(auto_now_add=True)

    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titre