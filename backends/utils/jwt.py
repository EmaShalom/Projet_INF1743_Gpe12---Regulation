import jwt
from datetime import datetime, timedelta
from django.conf import settings


def generate_access_token(user):
    """
    Génère un access token valide 15 minutes
    """

    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow(),
        "iss": "uqo-requests"
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return token


def generate_refresh_token(user):
    """
    Génère un refresh token valide 7 jours
    """

    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
        "iss": "uqo-requests"
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return token


def verify_token(token):
    """
    Vérifie si le token est valide
    """

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None