from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings

# --- NEW IMPORTS FOR PASSWORD RESET ---
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# --------------------------------------    


from .serializers import RegisterSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """
    Endpoint for new user registration.
    Accessible by anyone.
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    # Override perform_create to trigger the email after saving
    def perform_create(self, serializer):
        # 1. Save the new user to the MySQL database
        user = serializer.save()

        # 2. Prepare the welcome email content
        subject = 'Welcome to The DataTech Labs Blog!'
        message = f'''Hi {user.username},

You have successfully registered for our tech blog platform. We are thrilled to have you!

You can now log in, read the latest articles, and start publishing your own content.

Best regards,
The DataTech Labs Team
'''
        # 3. Send the email using your Hostinger configuration
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False, 
            )
        except Exception as e:
            print(f"Email failed to send: {e}")


# =====================================================================
# NEW: PASSWORD RESET LOGIC
# =====================================================================

# 1. Handles sending the email with the reset link
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()

        if user:
            # Generate the secure token and encode the user's ID
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # This is the React URL the user will click in their email
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            subject = "Password Reset Request - TechBlogs"
            message = f"Hello {user.username},\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you did not request this, please ignore this email."
            
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Password reset email failed to send: {e}")

        # Always return success to prevent email enumeration attacks
        return Response(
            {"message": "If an account with that email exists, a reset link has been sent."}, 
            status=status.HTTP_200_OK
        )

# 2. Handles verifying the token and saving the new password
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        
        try:
            # Decode the user ID from the URL
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # Check if the user exists AND if the token is valid/unexpired
        if user is not None and PasswordResetTokenGenerator().check_token(user, token):
            user.set_password(password) # This securely hashes the new password
            user.save()
            return Response({"message": "Password has been reset successfully!"}, status=status.HTTP_200_OK)
            
        return Response({"error": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)