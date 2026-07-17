from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

def health_check(request):
    return HttpResponse("OK")

urlpatterns = [
    path('', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Apps Routing
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/common/', include('apps.common.urls')),
]
