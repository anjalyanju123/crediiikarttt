from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User , Notification


class CustomUserAdmin(UserAdmin):

    model = User

    # Columns shown in admin table
    list_display = (
        "id",
        "username",
        "email",
        "role",
        "phone",
        "shop_name",
        "is_approved",
        "is_staff",
    )

    # Filters in sidebar
    list_filter = (
        "role",
        "is_approved",
        "is_staff",
    )

    # Search bar
    search_fields = (
        "username",
        "email",
        "shop_name",
    )

    ordering = ("id",)

    # Extra fields shown while editing user
    fieldsets = UserAdmin.fieldsets + (
        (
            "Custom Fields",
            {
                "fields": (
                    "role",
                    "phone",
                    "address",
                    "shop_name",
                    "shop_type",
                    "gst_number",
                    "shop_license_number",
                    "is_approved",
                )
            },
        ),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(Notification)