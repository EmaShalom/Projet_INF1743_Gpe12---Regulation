from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/auth/", include("apps.users.urls")),

    # Requests
    path("api/requests/", include("apps.requests_app.urls")),

    # Notifications
    path("api/notifications/", include("apps.notifications.urls")),
]