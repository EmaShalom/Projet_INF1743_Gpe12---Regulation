from django.urls import path
from .views import CommentListCreateView

urlpatterns = [
    path(
        "requests/<int:request_id>/comments/",
        CommentListCreateView.as_view(),
        name="comments-list-create"
    ),
]