from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WordViewSet

router = DefaultRouter(trailing_slash=False)
router.register('', WordViewSet, basename='word')

urlpatterns = [
    path('', include(router.urls)),
]
