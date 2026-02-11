from rest_framework import serializers

from .models import Word


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ('id', 'english', 'uzbek', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_english(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError('English word is required.')
        return value

    def validate_uzbek(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Uzbek translation is required.')
        return value
