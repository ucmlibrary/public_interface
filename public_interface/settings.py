from __future__ import unicode_literals
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
S3_STASH = os.getenv('UCLDC_S3_STASH', '')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY',
                       get_random_string(50,
                                         'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
                       )
             )


SOLR_URL = os.getenv('UCLDC_SOLR_URL', 'http://localhost:8983/solr')
SOLR_API_KEY = os.getenv('UCLDC_SOLR_API_KEY', '')
UCLDC_IMAGES = os.getenv('UCLDC_IMAGES', '')
UCLDC_MEDIA = os.getenv('UCLDC_MEDIA', '')
UCLDC_IIIF = os.getenv('UCLDC_IIIF', '')
UCLDC_NUXEO_THUMBS = os.getenv('UCLDC_NUXEO_THUMBS', '')
UCLDC_REGISTRY_URL = os.getenv('UCLDC_REGISTRY_URL', 'https://registry.cdlib.org/')

UCLDC_FRONT = os.getenv('UCLDC_FRONT','')
UCLDC_REDIS_URL = os.getenv('UCLDC_REDIS_URL', False)

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
DEBUG = bool(os.environ.get('UCLDC_DEBUG'))  # <-- this is django's debug

UCLDC_DEVEL = bool(os.environ.get('UCLDC_DEVEL'))
#<-- this has to do with css via devMode

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

SITE_ID = 1

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
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'public_interface.urls'

WSGI_APPLICATION = 'public_interface.wsgi.application'

APPEND_SLASH = True

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        # "APP_DIRS": True,
        "OPTIONS": {
            "builtins": [
                "easy_pjax.templatetags.pjax_tags"
            ],
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                'public_interface.context_processors.settings',
            ],
            "debug": UCLDC_DEVEL,
            'loaders': [
                ('django.template.loaders.cached.Loader', [
                    'django.template.loaders.filesystem.Loader',
                    'django.template.loaders.app_directories.Loader', ]
                ),
            ],
        }
    }
]

if UCLDC_DEVEL or DEBUG or 1 == 1:
    # turn off template cache if we are debugging
    TEMPLATES[0]['APP_DIRS'] = True
    TEMPLATES[0]['OPTIONS'].pop('loaders', None)
    TEMPLATES[0]['OPTIONS']['debug'] = True


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = { }

if os.environ.get('RDS_DB_NAME'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'CONN_MAX_AGE': 60 * 60,  # in seconds
            'HOST': os.environ.get('RDS_HOSTNAME'),
            'NAME': os.environ.get('RDS_DB_NAME'),
            'PASSWORD': os.environ.get('RDS_PASSWORD'),
            'PORT': os.environ.get('RDS_PORT'),
            'USER': os.environ.get('RDS_USERNAME'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }

# Cache / Redis
#

DJANGO_CACHE_TIMEOUT = os.getenv('DJANGO_CACHE_TIMEOUT', 60*15) # seconds

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = DJANGO_CACHE_TIMEOUT
CACHE_MIDDLEWARE_KEY_PREFIX = ''

if UCLDC_REDIS_URL:
    # DJANGO_REDIS_IGNORE_EXCEPTIONS = True
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': UCLDC_REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'default'

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

FILE_UPLOAD_HANDLERS = [
    "django.core.files.uploadhandler.MemoryFileUploadHandler",
    "django.core.files.uploadhandler.TemporaryFileUploadHandler"
]

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

