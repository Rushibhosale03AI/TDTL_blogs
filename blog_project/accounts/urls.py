from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
# Make sure you import CustomTokenObtainPairView here!
from .views import RegisterView, PasswordResetRequestView, PasswordResetConfirmView, CustomTokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    
    # WE CHANGED THIS LINE: Now it uses our Custom Email Login view
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]