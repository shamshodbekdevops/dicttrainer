from django.conf import settings
from django.db import models


class Word(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='words')
    english = models.CharField(max_length=120)
    uzbek = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self) -> str:
        return f'{self.english} - {self.uzbek}'
