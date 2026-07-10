from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Profile
import re
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar', 'bio', 'is_online', 'last_seen']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password','confirm_password', 'first_name', 'last_name']

    def validate_username(self, value):
        value = value.strip()

        if len(value) < 4:
            raise serializers.ValidationError(
                "Username must be at least 4 characters."
            )

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({
                "password": e.messages
            })

        if len(password) < 8:
            raise serializers.ValidationError({
                "password": "Password must be at least 8 characters."
            })

        if not re.search(r"[A-Z]", password):
            raise serializers.ValidationError({
                "password": "Password must contain an uppercase letter."
            })

        if not re.search(r"[a-z]", password):
            raise serializers.ValidationError({
                "password": "Password must contain a lowercase letter."
            })

        if not re.search(r"\d", password):
            raise serializers.ValidationError({
                "password": "Password must contain a number."
            })

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise serializers.ValidationError({
                "password": "Password must contain a special character."
            })

        return attrs
    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
        username=validated_data["username"],
        email=validated_data.get("email", ""),
        password=validated_data["password"],
        first_name=validated_data.get("first_name", ""),
        last_name=validated_data.get("last_name", "")
    )
        return user
