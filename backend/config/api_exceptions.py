import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
            response.data = {'detail': 'Server error.'}
        return response

    logger.exception('Unhandled API exception', exc_info=exc)
    return Response({'detail': 'Internal server error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
