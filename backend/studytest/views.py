import random

from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from words.models import Word

from .models import TestSession
from .serializers import AnswerSerializer, SessionQuerySerializer, StartTestSerializer


def _normalize(value: str) -> str:
    return value.strip().lower()


def _get_session(user, session_id: int) -> TestSession:
    return get_object_or_404(TestSession, id=session_id, user=user)


class StartTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartTestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        direction = serializer.validated_data['direction']
        start = serializer.validated_data['start']
        end = serializer.validated_data['end']

        user_words = Word.objects.filter(user=request.user).order_by('id')
        total_words = user_words.count()

        if total_words == 0:
            return Response({'detail': 'No words available for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        if end >= total_words:
            return Response(
                {'detail': f'Range end must be <= {total_words - 1}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if start > end:
            return Response({'detail': 'start must be <= end.'}, status=status.HTTP_400_BAD_REQUEST)

        subset_ids = list(user_words[start : end + 1].values_list('id', flat=True))
        if not subset_ids:
            return Response({'detail': 'Selected range is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        random.shuffle(subset_ids)

        session = TestSession.objects.create(
            user=request.user,
            direction=direction,
            start_index=start,
            end_index=end,
            total_questions=len(subset_ids),
            order=subset_ids,
        )

        return Response(
            {
                'session_id': session.id,
                'total_words': total_words,
                'total_questions': session.total_questions,
                'direction': session.direction,
                'range': {'start': start, 'end': end},
            },
            status=status.HTTP_201_CREATED,
        )


class QuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = SessionQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        session = _get_session(request.user, serializer.validated_data['session_id'])

        if session.finished or session.current_index >= session.total_questions:
            if not session.finished:
                session.finished = True
                session.save(update_fields=['finished', 'updated_at'])
            return Response({'finished': True})

        word_id = session.order[session.current_index]
        word = get_object_or_404(Word, id=word_id, user=request.user)

        prompt = word.english if session.direction == TestSession.DIRECTION_EN_TO_UZ else word.uzbek
        return Response(
            {
                'finished': False,
                'session_id': session.id,
                'direction': session.direction,
                'question': prompt,
                'progress': session.current_index + 1,
                'total': session.total_questions,
            }
        )


class NextQuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SessionQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = _get_session(request.user, serializer.validated_data['session_id'])

        if session.finished or session.current_index >= session.total_questions:
            if not session.finished:
                session.finished = True
                session.save(update_fields=['finished', 'updated_at'])
            return Response({'finished': True})

        word_id = session.order[session.current_index]
        word = get_object_or_404(Word, id=word_id, user=request.user)
        prompt = word.english if session.direction == TestSession.DIRECTION_EN_TO_UZ else word.uzbek

        return Response(
            {
                'finished': False,
                'session_id': session.id,
                'direction': session.direction,
                'question': prompt,
                'progress': session.current_index + 1,
                'total': session.total_questions,
            }
        )


class AnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = _get_session(request.user, serializer.validated_data['session_id'])
        if session.finished or session.current_index >= session.total_questions:
            if not session.finished:
                session.finished = True
                session.save(update_fields=['finished', 'updated_at'])
            return Response({'detail': 'Session already finished.', 'finished': True}, status=status.HTTP_400_BAD_REQUEST)

        word_id = session.order[session.current_index]
        word = get_object_or_404(Word, id=word_id, user=request.user)

        if session.direction == TestSession.DIRECTION_EN_TO_UZ:
            expected = word.uzbek
            prompt = word.english
        else:
            expected = word.english
            prompt = word.uzbek

        user_answer = serializer.validated_data['answer']
        is_correct = _normalize(user_answer) == _normalize(expected)

        if is_correct:
            session.correct_count += 1
        else:
            session.wrong_count += 1
            mistakes = session.mistakes
            mistakes.append(
                {
                    'prompt': prompt,
                    'expected': expected,
                    'provided': user_answer.strip(),
                }
            )
            session.mistakes = mistakes

        session.current_index += 1
        if session.current_index >= session.total_questions:
            session.finished = True

        session.save()

        return Response(
            {
                'correct': is_correct,
                'expected': expected,
                'finished': session.finished,
                'progress': min(session.current_index + 1, session.total_questions),
                'total': session.total_questions,
            }
        )


class FinishView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SessionQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = _get_session(request.user, serializer.validated_data['session_id'])
        if not session.finished:
            session.finished = True
            session.save(update_fields=['finished', 'updated_at'])

        percentage = 0.0
        if session.total_questions > 0:
            percentage = round((session.correct_count / session.total_questions) * 100, 2)

        return Response(
            {
                'session_id': session.id,
                'total_questions': session.total_questions,
                'correct': session.correct_count,
                'wrong': session.wrong_count,
                'percentage': percentage,
                'mistakes': session.mistakes,
            }
        )
