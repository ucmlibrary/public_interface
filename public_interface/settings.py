"""
Django settings for public_interface project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

import django.conf.global_settings as DEFAULT_SETTINGS  # http://stackoverflow.com/a/15446953/1763984

from django.utils.crypto import get_random_string # http://stackoverflow.com/a/16630719/1763984

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

THUMBNAIL_URL = os.getenv('UCLDC_THUMBNAIL_URL', 'http://localhost:8888/')  # `python thumbnail.py`
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY',
                       get_random_string(50,
                                         'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
                       )
             )

DJANGO_CACHE_TIMEOUT = os.getenv('DJANGO_CACHE_TIMEOUT', 60*15) # seconds

SOLR_URL = os.getenv('UCLDC_SOLR_URL', 'http://localhost:8983/solr')
SOLR_API_KEY = os.getenv('UCLDC_SOLR_API_KEY', '')
UCLDC_IMAGES = os.getenv('UCLDC_IMAGES', '')
UCLDC_MEDIA = os.getenv('UCLDC_MEDIA', '')
UCLDC_IIIF = os.getenv('UCLDC_IIIF', '')
UCLDC_REGISTRY_URL = os.getenv('UCLDC_REGISTRY_URL', 'https://registry.cdlib.org/')

UCLDC_FRONT = os.getenv('UCLDC_FRONT','')

EMAIL_BACKEND = os.getenv('EMAIL_BACKEND',
                          'django.core.mail.backends.console.EmailBackend')

EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_PORT = os.getenv('EMAIL_PORT', '')
EMAIL_USE_TLS = bool(os.getenv('EMAIL_USE_TLS', ''))
CSRF_COOKIE_SECURE = bool(os.getenv('CSRF_COOKIE_SECURE', ''))

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'project@example.edu')



ADMINS = (('', DEFAULT_FROM_EMAIL),)
MANAGERS = ADMINS

GA_SITE_CODE = os.getenv('UCLDC_GA_SITE_CODE', False)
UCLDC_WALKME = os.getenv('UCLDC_WALKME', False)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.environ.get('UCLDC_DEBUG'))

UCLDC_DEVEL = bool(os.environ.get('UCLDC_DEVEL'))

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')


# Application definition

INSTALLED_APPS = (
    'exhibits.apps.ExhibitsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.humanize',
    'easy_pjax',
    'calisphere',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',  # are we using sessions?
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'easy_pjax.middleware.UnpjaxMiddleware',
)

ROOT_URLCONF = 'public_interface.urls'

WSGI_APPLICATION = 'public_interface.wsgi.application'

APPEND_SLASH = True

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "debug": UCLDC_DEVEL,
            "builtins": [
                "easy_pjax.templatetags.pjax_tags"
            ],
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                'public_interface.context_processors.settings',
            ]
        }
    }
]


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = { }

if os.environ.get('RDS_DB_NAME'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ.get('RDS_DB_NAME'),
            'USER': os.environ.get('RDS_USERNAME'),
            'PASSWORD': os.environ.get('RDS_PASSWORD'),
            'HOST': os.environ.get('RDS_HOSTNAME'),
            'PORT': os.environ.get('RDS_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

MEDIA_ROOT = os.path.join(BASE_DIR, "media_root")
MEDIA_URL = '/media/'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = os.getenv('UCLDC_STATIC_URL', 'http://localhost:9000/')  # `grunt serve`

STATIC_ROOT = os.path.join(BASE_DIR, "static_root")

STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "dist"),
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
        },
    },
}

CONTRUBUTOR_CONTACT_FLAG = 'link'  # 'email'

SITE_ID = 1

