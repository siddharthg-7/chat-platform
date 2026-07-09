from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT login serializer with better error messages.
    """

    def validate(self,attrs):
        try:
            data = super().validate(attrs)

            return {
                "message": "Login successful",
                "access": data["access"],
                "refresh": data["refresh"],
            }

        except Exception:
            raise AuthenticationFailed(
        detail={
            "error": "Invalid username or password",
            "code": "invalid_credentials",
        }
    )

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer