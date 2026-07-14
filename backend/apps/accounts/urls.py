from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .authentication import CustomTokenObtainPairView
from .views import (SignupView, LogoutView, ProfileView, UpdateProfileDetailsView, ChangePasswordView,ForgotPasswordView,ResetPasswordView,UserSearchView, UserDetailView)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/',CustomTokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("change-password/", ChangePasswordView.as_view(), name="change_password",),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot_password",),
    path("reset-password/",ResetPasswordView.as_view(),name="reset_password",),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileDetailsView.as_view(), name='profile_update'),
    path('users/search/', UserSearchView.as_view(), name='user-search'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]