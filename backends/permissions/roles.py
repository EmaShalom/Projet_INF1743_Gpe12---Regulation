from rest_framework.permissions import BasePermission


class IsGestionnaire(BasePermission):
    """
    Permission : accès réservé aux gestionnaires.
    """

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.role == "gestionnaire"


class IsOwnerOrGestionnaire(BasePermission):
    """
    Permission :
    - Le créateur peut accéder
    - Le gestionnaire peut accéder
    """

    def has_object_permission(self, request, view, obj):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # gestionnaire
        if user.role == "gestionnaire":
            return True

        # propriétaire de la demande
        return obj.createur == user