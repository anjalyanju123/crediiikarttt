from django.apps import AppConfig


class CrediappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'crediapp'

    def ready(self):
        from .models import User

        try:
            if not User.objects.filter(username="admin").exists():
                User.objects.create_superuser(
                    username="admin",
                    password="Admin123"
                )
                print("Admin created")
        except:
            pass
