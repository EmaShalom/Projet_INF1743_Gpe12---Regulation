from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    VerifyLoginCodeView,
    ForgotPasswordView,
    VerifyResetCodeView,
    ResetPasswordView
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("verify-login/", VerifyLoginCodeView.as_view()),
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("verify-reset-code/", VerifyResetCodeView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
]