from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Profile
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

class AccountsAPITest(APITestCase):
    def setUp(self):
        self.signup_url = reverse('signup')
        self.login_url = reverse('token_obtain_pair')
        self.logout_url = reverse("logout")
        self.change_password_url = reverse("change_password")
        self.forgot_password_url = reverse("forgot_password")
        self.reset_password_url = reverse("reset_password")
        self.profile_url = reverse('profile')
        self.user_data = {
             "username": "testuser",
             "email": "test@example.com",
             "password": "TestPassword@123",
             "confirm_password": "TestPassword@123",
        }

    def test_signup(self):
        response = self.client.post(self.signup_url, self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        self.assertTrue(Profile.objects.filter(user__username='testuser').exists())

# -------------------------------------------------------------------------
# Login Authentication Tests
# -------------------------------------------------------------------------

    def test_login(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate with valid credentials.
        response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

    # Verify that login succeeds and JWT tokens are returned.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Login successful")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)


    def test_login_invalid_credentials(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Attempt login with an incorrect password.
        response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "wrongpassword",
        },
        content_type="application/json",
    )

    # Verify that authentication fails with the expected error response.
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"], "Invalid username or password")
        self.assertEqual(response.data["code"], "invalid_credentials")
    
# -------------------------------------------------------------------------
# Logout Tests
# -------------------------------------------------------------------------

    def test_logout_success(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate and obtain JWT access and refresh tokens.
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]
        refresh_token = login_response.data["refresh"]

    # Authenticate subsequent requests using the access token.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Logout by submitting the refresh token for blacklisting.
        response = self.client.post(self.logout_url,
        {"refresh": refresh_token},
        content_type="application/json",
    )

    # Verify that logout succeeds.
        self.assertEqual(response.status_code, 205)
        self.assertEqual(response.data["message"], "Logout successful")


    def test_logout_missing_refresh_token(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate and obtain an access token.
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate subsequent requests.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Attempt logout without providing a refresh token.
        response = self.client.post(
        self.logout_url,
        {},
        content_type="application/json",
    )

    # Verify that the appropriate validation error is returned.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Refresh token is required")
        self.assertEqual(response.data["code"], "missing_token")


    def test_logout_invalid_refresh_token(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate and obtain an access token.
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate subsequent requests.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Attempt logout using an invalid refresh token.
        response = self.client.post(self.logout_url,
        {
            "refresh": "this_is_not_a_valid_token",
        },
        content_type="application/json",
    )

    # Verify that the invalid token error is returned.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Invalid or expired refresh token")
        self.assertEqual(response.data["code"], "invalid_token")

# -------------------------------------------------------------------------
# Change Password Tests
# -------------------------------------------------------------------------

    def test_change_password_success(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate and obtain an access token.
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate subsequent requests.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Change the account password.
        response = self.client.put(self.change_password_url,
        {
            "old_password": "testpassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

    # Verify that the password change succeeds.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"],"Password changed successfully.")

    # Verify that login succeeds with the new password.
        self.client.credentials()
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "TestPassword@456",
        },
        content_type="application/json",
    )

        self.assertEqual(login_response.status_code, 200)


    def test_change_password_wrong_old_password(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Authenticate and obtain an access token.
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate subsequent requests.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Attempt to change the password using an incorrect current password.
        response = self.client.put(self.change_password_url,
        {
            "old_password": "WrongPassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

    # Verify that the request is rejected.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["old_password"][0],"Old password is incorrect.")


    def test_change_password_unauthenticated(self):
    # Attempt to change the password without authentication.
        response = self.client.put(self.change_password_url,
        {
            "old_password": "testpassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

    # Verify that authentication is required.
        self.assertEqual(response.status_code, 401)


# -------------------------------------------------------------------------
# Forgot Password Tests
# -------------------------------------------------------------------------

    def test_forgot_password_existing_email(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)

    # Request a password reset for an existing account.
        response = self.client.post(self.forgot_password_url,
        {
            "email": "test@example.com",
        },
        content_type="application/json",
    )

    # Verify that a success response is returned.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"],
        "If an account exists, a password reset email has been sent.",)


    def test_forgot_password_non_existing_email(self):
    # Request a password reset for a non-existent account.
        response = self.client.post(self.forgot_password_url,
        {
            "email": "unknown@example.com",
        },
        content_type="application/json",
    )

    # Verify that the same response is returned to prevent user enumeration.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"],
        "If an account exists, a password reset email has been sent.",)


    def test_forgot_password_invalid_email(self):
    # Submit an invalid email address.
        response = self.client.post(self.forgot_password_url,
        {
            "email": "not-an-email",
        },
        content_type="application/json",
    )

    # Verify that email validation fails.
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)


    def test_forgot_password_missing_email(self):
    # Submit the request without an email address.
        response = self.client.post(self.forgot_password_url,
        {},
        content_type="application/json",
    )

    # Verify that the email field is required.
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)

# -------------------------------------------------------------------------
# Reset Password Tests
# -------------------------------------------------------------------------

    def test_reset_password_success(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(username="testuser")

    # Generate a valid password reset UID and token.
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

    # Reset the password using the generated reset credentials.
        response = self.client.post(self.reset_password_url,
        {
            "uid": uid,
            "token": token,
            "new_password": "NewPassword@123",
        },
        content_type="application/json",
    )

    # Verify that the password reset succeeds.
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"],"Password has been reset successfully.",)

    # Refresh the user instance from the database.
        user.refresh_from_db()

    # Verify that the password was updated successfully.
        self.assertTrue(user.check_password("NewPassword@123"))


    def test_reset_password_invalid_uid(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(username="testuser")

    # Generate a valid reset token.
        token = default_token_generator.make_token(user)

    # Attempt password reset using an invalid UID.
        response = self.client.post(self.reset_password_url,
        {
            "uid": "invalid_uid",
            "token": token,
            "new_password": "NewPassword@123",
        },
        content_type="application/json",
    )

    # Verify that the invalid UID is rejected.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Invalid reset link")
        self.assertEqual(response.data["code"], "invalid_uid")


    def test_reset_password_invalid_token(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(username="testuser")

    # Generate a valid password reset UID.
        uid = urlsafe_base64_encode(force_bytes(user.pk))

    # Attempt password reset using an invalid token.
        response = self.client.post(self.reset_password_url,
        {
            "uid": uid,
            "token": "invalid_token",
            "new_password": "NewPassword@123",
        },
        content_type="application/json",
    )

    # Verify that the invalid token is rejected.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"],"Invalid or expired reset token",)
        self.assertEqual(response.data["code"], "invalid_token")


    def test_reset_password_weak_password(self):
    # Create a test user.
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(username="testuser")

    # Generate valid password reset credentials.
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

    # Attempt to reset the password using a weak password.
        response = self.client.post(self.reset_password_url,
        {
            "uid": uid,
            "token": token,
            "new_password": "123",
        },
        content_type="application/json",
    )

    # Verify that password validation fails.
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["code"],"password_validation_failed",)


    def test_reset_password_missing_fields(self):
    # Submit the request without the required fields.
        response = self.client.post(self.reset_password_url,
        {},
        content_type="application/json",
    )

    # Verify that all required fields are reported.
        self.assertEqual(response.status_code, 400)
        self.assertIn("uid", response.data)
        self.assertIn("token", response.data)
        self.assertIn("new_password", response.data)