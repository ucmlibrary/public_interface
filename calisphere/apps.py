from django.apps import AppConfig

class CalisphereAppConfig(AppConfig):
    # http://stackoverflow.com/a/16111968/1763984
    name = 'calisphere'
    verbose_name = name
    def ready(self):
        pass # startup code here
