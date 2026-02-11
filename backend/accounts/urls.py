from django.urls import path

from .views import ForgotPasswordView, LoginView, LogoutView, RegisterView, ResetPasswordConfirmView

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('forgot-password', ForgotPasswordView.as_view()),
    path('reset-password-confirm', ResetPasswordConfirmView.as_view()),
    path('logout', LogoutView.as_view()),
]
