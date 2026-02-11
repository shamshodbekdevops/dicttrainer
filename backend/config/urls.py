from django.contrib import admin
from django.urls import path

from accounts.views import ForgotPasswordView, LoginView, LogoutView, RegisterView, ResetPasswordConfirmView
from studytest.views import AnswerView, FinishView, NextQuestionView, QuestionView, StartTestView
from words.views import WordViewSet

word_collection = WordViewSet.as_view({'get': 'list', 'post': 'create'})
word_detail = WordViewSet.as_view(
    {'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}
)


def _superuser_admin_only(request):
    return bool(request.user and request.user.is_active and request.user.is_superuser)


admin.site.has_permission = _superuser_admin_only

urlpatterns = [
    path('admin', admin.site.urls),
    path('auth/register', RegisterView.as_view()),
    path('auth/login', LoginView.as_view()),
    path('auth/forgot-password', ForgotPasswordView.as_view()),
    path('auth/reset-password-confirm', ResetPasswordConfirmView.as_view()),
    path('auth/logout', LogoutView.as_view()),
    path('words', word_collection),
    path('words/<int:pk>', word_detail),
    path('test/start', StartTestView.as_view()),
    path('test/question', QuestionView.as_view()),
    path('test/next', NextQuestionView.as_view()),
    path('test/answer', AnswerView.as_view()),
    path('test/finish', FinishView.as_view()),
]
