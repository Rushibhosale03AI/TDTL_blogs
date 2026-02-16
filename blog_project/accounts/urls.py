from django.urls import path
from .views import RegisterView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # API for user registration [cite: 28]
    path('register/', RegisterView.as_view(), name='register'),
    
    # API to login and get Access/Refresh tokens [cite: 29]
    path('login/', TokenObtainPairView.as_view(), name='login'),
    
    # API to refresh an expired token [cite: 15]
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]