from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def test_api(request):
    return JsonResponse({"message": "Connexion React → Django OK"})


urlpatterns = [
    path("admin/", admin.site.urls),

    # Route de test API
    path("api/test", test_api),

    # Auth
    path("api/auth/", include("apps.users.urls")),

    # Requests
    path("api/requests/", include("apps.requests_app.urls")),

    # Notifications
    path("api/notifications/", include("apps.notifications.urls")),
]