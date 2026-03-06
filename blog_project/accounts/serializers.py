from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True) # Make email absolutely required

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    # 1. THE NEW RULE: Stop duplicate emails!
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# 2. THE NEW JWT SERIALIZER: Logs people in using Email instead of Username
class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Find the user by their email
        user = User.objects.filter(email=email).first()
        
        # Check if the user exists and the password matches
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            
            # Return the tokens AND the username (React still needs the username for blog ownership!)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username
            }
            
        raise serializers.ValidationError("No active account found with those credentials.")