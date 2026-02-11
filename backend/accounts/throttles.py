from rest_framework.throttling import SimpleRateThrottle


class IpScopeRateThrottle(SimpleRateThrottle):
    scope = None

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class RegisterRateThrottle(IpScopeRateThrottle):
    scope = 'auth_register'


class LoginRateThrottle(IpScopeRateThrottle):
    scope = 'auth_login'


class ForgotPasswordRateThrottle(IpScopeRateThrottle):
    scope = 'auth_forgot_password'


class ResetPasswordRateThrottle(IpScopeRateThrottle):
    scope = 'auth_reset_password'
