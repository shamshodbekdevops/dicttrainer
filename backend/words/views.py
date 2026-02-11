from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Word
from .pagination import WordPagination
from .permissions import IsOwner
from .serializers import WordSerializer


class WordViewSet(viewsets.ModelViewSet):
    serializer_class = WordSerializer
    pagination_class = WordPagination
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.SearchFilter]
    search_fields = ['english', 'uzbek']

    def get_queryset(self):
        return Word.objects.filter(user=self.request.user).order_by('id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
