from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "demande",
        "auteur",
        "date_creation",
    )

    search_fields = (
        "contenu",
    )