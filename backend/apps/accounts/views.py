from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.conf import settings
from .serializers import (SignupSerializer, UserSerializer, ProfileSerializer, ChangePasswordSerializer,ForgotPasswordSerializer,ResetPasswordSerializer,)

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

    # Only authenticated users are allowed to access this endpoint.
    # Requests without a valid JWT access token are rejected automatically.
    permission_classes = [IsAuthenticated]

    # Serializer responsible for validating the current password,
    # validating the new password, and updating the user's password.
    serializer_class = ChangePasswordSerializer

    # Return the currently authenticated user as the object to update.
    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Validate the incoming request data.
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        # Update the user's password.
        serializer.save()

        return Response(
            {
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK,
        )
    
class ForgotPasswordView(APIView):
    """
    Sends a password reset email if the account exists.
    """

    # Anyone should be able to request a password reset.
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        # Validate the incoming request data.
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the email address from the validated request.
        email = serializer.validated_data["email"]

        # Find the user associated with the email.
        # filter().first() returns None if no user exists instead of raising an exception.
        user = User.objects.filter(email=email).first()

        if user:
            # Encode the user's primary key so it can be safely included in the URL.
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Generate a secure password reset token.
            token = default_token_generator.make_token(user)

            # Create the frontend password reset URL.
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/"
                f"?uid={uid}&token={token}"
            )

            # Send the password reset email.
            send_mail(
                subject="Reset your password",
                message=f"Click the link below to reset your password:\n\n{reset_url}",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Always return the same response to prevent attackers
        # from discovering whether an email address exists.
        return Response(
            {
                "message": (
                    "If an account exists, a password reset email has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )
    
class ResetPasswordView(APIView):
    """
    Resets the user's password using the uid and reset token.
    """

    # No authentication is required because the password reset
    # token serves as proof of the user's identity.
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        # Validate the incoming request data.
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            # Decode the Base64-encoded user ID from the reset link.
            user_id = force_str(urlsafe_base64_decode(uid))

            # Retrieve the corresponding user.
            user = User.objects.get(pk=user_id)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {
                    "error": "Invalid reset link",
                    "code": "invalid_uid",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify that the reset token is valid and has not expired.
        if not default_token_generator.check_token(user, token):
            return Response(
                {
                    "error": "Invalid or expired reset token",
                    "code": "invalid_token",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the new password against Django's configured
        # password policy (minimum length, common passwords, etc.).
        try:
            validate_password(new_password, user)

        except ValidationError as e:
            return Response(
                {
                    "error": e.messages,
                    "code": "password_validation_failed",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Hash and save the new password.
        user.set_password(new_password)
        user.save()

        return Response(
            {
                "message": "Password has been reset successfully."
            },
            status=status.HTTP_200_OK,
        )