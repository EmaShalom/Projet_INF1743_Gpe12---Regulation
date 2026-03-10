from django.urls import path

from .views import (
    RequestListCreateView,
    RequestDetailView,
    RequestStatusUpdateView,
)
from apps.comments.views import CommentListCreateView


urlpatterns = [
    path("", RequestListCreateView.as_view()),
    path("<int:pk>/", RequestDetailView.as_view()),
    path("<int:pk>/status/", RequestStatusUpdateView.as_view()),
    path("<int:request_id>/comments/", CommentListCreateView.as_view()),
]