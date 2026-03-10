from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "email",
        "nom_complet",
        "role",
        "date_creation"
    )

    search_fields = (
        "email",
        "nom_complet"
    )

    list_filter = (
        "role",
    )