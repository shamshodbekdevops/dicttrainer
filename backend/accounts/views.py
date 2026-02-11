import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import exceptions
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .security import clear_failed_logins, get_client_ip, is_login_blocked, register_failed_login
from .models import User
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordConfirmSerializer,
)
from .throttles import ForgotPasswordRateThrottle, LoginRateThrottle, RegisterRateThrottle, ResetPasswordRateThrottle

logger = logging.getLogger(__name__)


def _send_reset_email(recipient_email: str, text_body: str, html_body: str) -> None:
    send_mail(
        subject='VocabTrainer password reset',
        message=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False,
        html_message=html_body,
    )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    # throttle_classes = [RegisterRateThrottle]
    throttle_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'user': {'id': user.id, 'email': user.email, 'username': user.username},
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    # throttle_classes = [LoginRateThrottle]
    throttle_classes = []

    def post(self, request):
        # identifier = (
        #     request.data.get('identifier')
        #     or request.data.get('email')
        #     or request.data.get('username')
        #     or ''
        # )
        # client_ip = get_client_ip(request)
        #
        # if is_login_blocked(client_ip, identifier):
        #     return Response(
        #         {'detail': 'Too many failed attempts. Try again later.'},
        #         status=status.HTTP_429_TOO_MANY_REQUESTS,
        #     )

        serializer = LoginSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except exceptions.ValidationError:
            # register_failed_login(client_ip, identifier)
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        payload = serializer.validated_data
        user = payload['user']
        # clear_failed_logins(client_ip, identifier)
        return Response(
            {
                'user': {'id': user.id, 'email': user.email, 'username': user.username},
                'access': payload['access'],
                'refresh': payload['refresh'],
            }
        )


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    # throttle_classes = [ForgotPasswordRateThrottle]
    throttle_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user:
            # return Response({'detail': 'If this email exists, reset instructions have been sent.'})
            return Response({'detail': "Bunday email bilan akkaunt topilmadi."}, status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        text_body = f'Parolni tiklash uchun havola: {reset_link}'
        html_body = render_to_string('emails/reset_password.html', {'reset_link': reset_link, 'user': user})

        if settings.EMAIL_BACKEND.endswith('console.EmailBackend') and not settings.DEBUG:
            return Response(
                {'detail': 'SMTP yoqilmagan. Railway Variables ichida EMAIL_BACKEND ni smtp backendga o‘rnating.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            _send_reset_email(
                recipient_email=user.email,
                text_body=text_body,
                html_body=html_body,
            )
        except Exception:
            logger.exception('Failed to send reset password email.')
            return Response(
                {'detail': 'Email yuborilmadi. SMTP sozlamasi yoki App Password xato bo‘lishi mumkin.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'detail': 'Reset link yuborildi.'})


class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    # throttle_classes = [ResetPasswordRateThrottle]
    throttle_classes = []

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password updated successfully.'})


class LogoutView(APIView):
    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail': 'refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Logged out successfully.'})
