import re
from rest_framework.exceptions import ValidationError


def validate_email(email):
    """
    Vérifie si un email est valide
    """

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(pattern, email):
        raise ValidationError("Format d'email invalide.")

    return email


def validate_password(password):
    """
    Vérifie si le mot de passe respecte les règles :
    - minimum 8 caractères
    """

    if len(password) < 8:
        raise ValidationError(
            "Le mot de passe doit contenir au moins 8 caractères."
        )

    return password


def validate_request_title(title):
    """
    Validation titre demande
    """

    if len(title) < 5 or len(title) > 200:
        raise ValidationError(
            "Le titre doit contenir entre 5 et 200 caractères."
        )

    return title


def validate_request_description(description):
    """
    Validation description demande
    """

    if len(description) < 20 or len(description) > 2000:
        raise ValidationError(
            "La description doit contenir entre 20 et 2000 caractères."
        )

    return description