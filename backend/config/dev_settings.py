# dev_settings.py  — local override for zero-infrastructure dev
# Usage: python manage.py runserver --settings=config.dev_settings
from .settings import *  # noqa: F401, F403

# ── Override: use SQLite so no Postgres needed ────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # type: ignore[name-defined]  # noqa: F405
    }
}

# ── Override: use in-memory channel layer so no Redis needed ──────────────────
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Make sure DEBUG is on so CORS allows everything
DEBUG = True
CORS_ALLOW_ALL_ORIGINS = True

# Allow the dev token blacklist table (simplejwt) to be created via migrate
SIMPLE_JWT = {
    **SIMPLE_JWT,  # type: ignore[name-defined]  # noqa: F405
}

print("[dev_settings] Using SQLite + InMemoryChannelLayer — no Postgres or Redis required.")
