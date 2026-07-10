from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (SignupSerializer, UserSerializer, ProfileSerializer, ChangePasswordSerializer,)

class SignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SignupSerializer

class LogoutView(APIView):
    # Only authenticated users are allowed to log out.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get the refresh token sent by the frontend in the request body.
        refresh_token = request.data.get("refresh")

        # If the refresh token is missing, return a clear error message.
        if not refresh_token:
            return Response(
                {
                "error": "Refresh token is required",
                "code": "missing_token",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Create a RefreshToken object from the received token.
            token = RefreshToken(refresh_token)

# The user logs in and receives:
# Access Token (short-lived)
# Refresh Token (long-lived)
# During logout, the frontend sends the refresh token.
# Django creates a RefreshToken object:
# token = RefreshToken(refresh_token)
# Calling: token.blacklist()
# It stores that token in the blacklisted tokens table(provided by rest_framework_simplejwt.token_blacklist).
# If someone later tries to use the same refresh token to obtain a new access token, Django rejects it because it has been blacklisted.
# This is why the we included the token_blacklist migrations.
            token.blacklist()

            # Logout successful.
            return Response(
                {
                "message": "Logout successful",
                },
                status=status.HTTP_205_RESET_CONTENT,
            )

        except Exception:
            # The token is invalid, expired, malformed, or already blacklisted.
            return Response(
                {
                "error": "Invalid or expired refresh token",
                "code": "invalid_token",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UpdateProfileDetailsView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile
    
class ChangePasswordView(generics.UpdateAPIView):
    """
    Allows an authenticated user to change their password.
    """

    permission_classes = [IsAuthenticated]
    # Only logged-in user should be allowed to change their password.
    # Without a valid JWT access token, the request will be rejected before reaching the view.
    serializer_class = ChangePasswordSerializer
    #It tells DRF which object is being updated.Here it is always the currently authenticated user.
    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,context={"request": request},)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK,
        )