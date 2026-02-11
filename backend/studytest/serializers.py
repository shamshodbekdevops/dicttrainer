from rest_framework import serializers

from .models import TestSession


class StartTestSerializer(serializers.Serializer):
    direction = serializers.ChoiceField(choices=[TestSession.DIRECTION_EN_TO_UZ, TestSession.DIRECTION_UZ_TO_EN])
    start = serializers.IntegerField(min_value=0)
    end = serializers.IntegerField(min_value=0)


class SessionQuerySerializer(serializers.Serializer):
    session_id = serializers.IntegerField(min_value=1)


class AnswerSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(min_value=1)
    answer = serializers.CharField(allow_blank=True)
