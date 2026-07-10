from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Profile

class AccountsAPITest(APITestCase):
    def setUp(self):
        self.signup_url = reverse('signup')
        self.login_url = reverse('token_obtain_pair')
        self.logout_url = reverse("logout")
        self.change_password_url = reverse("change_password")
        self.profile_url = reverse('profile')
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'email': 'test@example.com'
        }

    def test_signup(self):
        response = self.client.post(self.signup_url, self.user_data)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        self.assertTrue(Profile.objects.filter(user__username='testuser').exists())

    def test_login(self):
        self.client.post(self.signup_url, self.user_data)
        response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Login successful")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid_credentials(self):
        self.client.post(self.signup_url, self.user_data)
        response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "wrongpassword",
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["error"],"Invalid username or password")
        self.assertEqual(response.data["code"],"invalid_credentials")

    def test_logout_success(self):
    # Create a user
        self.client.post(self.signup_url,self.user_data)

    # Login and get JWT tokens
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]
        refresh_token = login_response.data["refresh"]

    # Authenticate future requests using the access token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Logout using the refresh token
        response = self.client.post(self.logout_url,{"refresh": refresh_token},content_type="application/json",)
        self.assertEqual(response.status_code,205)
        self.assertEqual(response.data["message"],"Logout successful")

    def test_logout_missing_refresh_token(self):
    # Create user
        self.client.post(self.signup_url,self.user_data)

    # Login
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate using access token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Logout without refresh token
        response = self.client.post(self.logout_url,{},content_type="application/json",)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"],"Refresh token is required")
        self.assertEqual(response.data["code"],"missing_token")

    def test_logout_invalid_refresh_token(self):
    # Create user
        self.client.post(self.signup_url, self.user_data)

    # Login
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate using access token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Send an invalid refresh token
        response = self.client.post(self.logout_url,
        {
            "refresh": "this_is_not_a_valid_token"
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"],"Invalid or expired refresh token")
        self.assertEqual(response.data["code"],"invalid_token")

    def test_change_password_success(self):
    # Create user
        self.client.post(self.signup_url, self.user_data)

    # Login
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticate using access token
        self.client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {access_token}"
    )

    # Change password
        response = self.client.put(self.change_password_url,
        {
            "old_password": "testpassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"],"Password changed successfully.")

    # Verify login with new password
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
    # Create user
        self.client.post(self.signup_url, self.user_data)

    # Login
        login_response = self.client.post(self.login_url,
        {
            "username": "testuser",
            "password": "testpassword123",
        },
        content_type="application/json",
    )

        access_token = login_response.data["access"]

    # Authenticating
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Trying changing password using wrong old password
        response = self.client.put(self.change_password_url,
        {
            "old_password": "WrongPassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["old_password"][0],"Old password is incorrect.")

    def test_change_password_unauthenticated(self):
    # Attempting to change password without authentication
        response = self.client.put(self.change_password_url,
        {
            "old_password": "testpassword123",
            "new_password": "TestPassword@456",
        },
        content_type="application/json",
    )

        self.assertEqual(response.status_code, 401)