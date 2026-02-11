from django.conf import settings
from django.db import models


class TestSession(models.Model):
    DIRECTION_EN_TO_UZ = 'en_to_uz'
    DIRECTION_UZ_TO_EN = 'uz_to_en'

    DIRECTION_CHOICES = [
        (DIRECTION_EN_TO_UZ, 'English to Uzbek'),
        (DIRECTION_UZ_TO_EN, 'Uzbek to English'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='test_sessions')
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    start_index = models.PositiveIntegerField()
    end_index = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField(default=0)
    order = models.JSONField(default=list)
    current_index = models.PositiveIntegerField(default=0)
    correct_count = models.PositiveIntegerField(default=0)
    wrong_count = models.PositiveIntegerField(default=0)
    mistakes = models.JSONField(default=list)
    finished = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'TestSession<{self.user_id}:{self.id}>'
