from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT login serializer that returns a user-friendly
    success response and consistent error messages.
    Supports authenticating via either username or email.
    """

    def validate(self, attrs):
        username = attrs.get("username")
        # Support email login fallback
        if username and "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs["username"] = user.username
            except User.DoesNotExist:
                pass

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