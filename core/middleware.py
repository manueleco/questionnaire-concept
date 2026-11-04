class HeadersMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        if request.path.startswith(('/api/', '/portal/', '/accounts/', '/invite/')):
            response['Cache-Control'] = 'no-store'
        return response

class RateLimitMiddleware:
    """Short-lived, keyed address digests; use shared Redis in production."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        from django.core.cache import cache
        from django.http import JsonResponse
        from django.conf import settings
        import hashlib
        sensitive = request.method == 'POST' and (request.path.startswith(('/accounts/login/', '/invite/')) or request.path == '/api/responses/')
        if sensitive:
            kind = 'auth' if request.path != '/api/responses/' else 'submit'
            key = 'rl:' + kind + ':' + hashlib.sha256((settings.SECRET_KEY + request.META.get('REMOTE_ADDR', '')).encode()).hexdigest()
            try:
                if cache.add(key, 1, timeout=60):
                    count = 1
                else:
                    try:
                        count = cache.incr(key)
                    except ValueError:
                        cache.set(key, 1, timeout=60)
                        count = 1
                if count > (30 if kind == 'auth' else 60):
                    response = JsonResponse({'error': 'Too many attempts. Try again in a minute.'}, status=429)
                    response['Retry-After'] = '60'
                    return response
            except Exception:
                if not settings.DEBUG:
                    return JsonResponse({'error': 'Temporarily unavailable.'}, status=503)
        return self.get_response(request)
