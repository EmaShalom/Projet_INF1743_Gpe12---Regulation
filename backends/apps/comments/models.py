from django.db import models
from django.conf import settings
from apps.requests_app.models import Request


class Comment(models.Model):

    demande = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    contenu = models.TextField()

    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commentaire #{self.id} - {self.auteur}"