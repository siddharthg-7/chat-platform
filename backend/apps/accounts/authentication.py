from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT login serializer that returns a user-friendly
    success response and consistent error messages.
    """

    def validate(self,attrs):
        try:
            # Let Simple JWT authenticate the user and generate
            # the access and refresh tokens.
            data = super().validate(attrs)

            # Return a customized success response.
            return {
                "message": "Login successful",
                "access": data["access"],
                "refresh": data["refresh"],
            }

        except Exception:
            # Replace Simple JWT's default error response with a
            # consistent API error format
            raise AuthenticationFailed(
        detail={
            "error": "Invalid username or password",
            "code": "invalid_credentials",
        }
    )

class CustomTokenObtainPairView(TokenObtainPairView):
    # Use the customized serializer instead of Simple JWT's default serializer.
    serializer_class = CustomTokenObtainPairSerializer