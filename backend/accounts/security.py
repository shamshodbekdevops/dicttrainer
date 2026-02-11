import hashlib

from django.conf import settings
from django.core.cache import cache


def get_client_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', 'unknown')


def _normalized_identifier(identifier: str) -> str:
    return (identifier or '').strip().lower()


def _identifier_hash(identifier: str) -> str:
    return hashlib.sha256(_normalized_identifier(identifier).encode('utf-8')).hexdigest()


def _attempts_key(ip: str, identifier: str) -> str:
    return f'auth:login:attempts:{ip}:{_identifier_hash(identifier)}'


def _blocked_key(ip: str, identifier: str) -> str:
    return f'auth:login:blocked:{ip}:{_identifier_hash(identifier)}'


def is_login_blocked(ip: str, identifier: str) -> bool:
    return bool(cache.get(_blocked_key(ip, identifier)))


def register_failed_login(ip: str, identifier: str) -> None:
    attempts_key = _attempts_key(ip, identifier)
    blocked_key = _blocked_key(ip, identifier)

    attempts = cache.get(attempts_key, 0) + 1
    cache.set(attempts_key, attempts, timeout=settings.LOGIN_FAIL_LOCKOUT_SECONDS)

    if attempts >= settings.LOGIN_FAIL_MAX_ATTEMPTS:
        cache.set(blocked_key, True, timeout=settings.LOGIN_FAIL_LOCKOUT_SECONDS)
        cache.delete(attempts_key)


def clear_failed_logins(ip: str, identifier: str) -> None:
    cache.delete(_attempts_key(ip, identifier))
    cache.delete(_blocked_key(ip, identifier))
