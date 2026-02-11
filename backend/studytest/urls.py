from django.urls import path

from .views import AnswerView, FinishView, NextQuestionView, QuestionView, StartTestView

urlpatterns = [
    path('start', StartTestView.as_view()),
    path('question', QuestionView.as_view()),
    path('next', NextQuestionView.as_view()),
    path('answer', AnswerView.as_view()),
    path('finish', FinishView.as_view()),
]
