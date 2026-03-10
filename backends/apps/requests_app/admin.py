from django.contrib import admin
from .models import Request


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "titre",
        "type",
        "statut",
        "createur",
        "date_creation",
    )

    list_filter = (
        "statut",
        "type",
    )

    search_fields = (
        "titre",
        "description",
    )