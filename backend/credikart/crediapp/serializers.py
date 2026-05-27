from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, Product, Order, OrderItem, Transaction
import re

User = get_user_model()

# ==========================================
# AUTH & USER SERIALIZERS
# ==========================================
class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "phone", "address", "password", "confirm_password"]

    def validate_phone(self, value):
        if value and len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits long.")
        return value    
    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value    

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        username = validated_data.pop("username")
        email = validated_data.pop("email")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="customer",
            is_approved=True,  # Customers do not need admin confirmation
            **validated_data
        )
        return user


class ShopkeeperRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "phone", "address", 
            "shop_name", "shop_type", "gst_number", "shop_license_number",
            "gst_document", "license_document", "password", "confirm_password"
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value    

    def validate_gst_number(self, value):
        pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
        if not re.fullmatch(pattern, str(value)):
            raise serializers.ValidationError("Invalid GST number format.")
        return value.upper()

    def validate_shop_license_number(self, value):

        if not re.fullmatch(r"^[A-Z0-9\-\/]{6,20}$", str(value)):
            raise serializers.ValidationError(
                "Invalid shop license number format."
            )
        return value.upper()

    def validate_password(self, value):
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least 1 uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least 1 lowercase letter.")
        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Password must contain at least 1 number.")
        if not re.search(r"[@$!_#%*?&]", value):
            raise serializers.ValidationError("Password must contain at least 1 special character.")
        return value  
      
    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        username = validated_data.pop("username")
        email = validated_data.pop("email")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="shopkeeper",
            is_approved=False,  # Shopkeepers are locked until approved by Admin
            **validated_data
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "phone", "address", "is_approved"]



class ShopkeeperListSerializer(serializers.ModelSerializer):
    # Absolute URL fields for uploaded media files (GST & License PDF/Images)
    gst_document = serializers.SerializerMethodField()
    license_document = serializers.SerializerMethodField()
    
    # Human-readable format for registration timestamps
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "role",
            "shop_name",
            "shop_type",
            "gst_number",
            "shop_license_number",
            "gst_document",
            "license_document",
            "is_approved",
            "date_joined"
        ]
        read_only_fields = ["id", "role", "date_joined"]

    def get_gst_document(self, obj):
        request = self.context.get("request")
        if obj.gst_document and hasattr(obj.gst_document, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.gst_document.url)
            return obj.gst_document.url
        return None

    def get_license_document(self, obj):
        request = self.context.get("request")
        if obj.license_document and hasattr(obj.license_document, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.license_document.url)
            return obj.license_document.url
        return None
    

class CustomerSerializer(serializers.ModelSerializer):
    # Formats the signup timestamp to a clean, readable string representation
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "role",
            "is_active",
            "date_joined"
        ]
        # Restrict critical structural data updates from the profile tier
        read_only_fields = ["id", "role", "date_joined"]

# ==========================================

# CORE FEATURES SERIALIZERS
# ==========================================
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    shopkeeper = serializers.ReadOnlyField(source="shopkeeper.username")

    class Meta:
        model = Product
        fields = "__all__"

    def create(self, validated_data):
        # Automatically attach the shopkeeper from the request context
        validated_data["shopkeeper"] = self.context["request"].user
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Order
        fields = ["id", "user", "username", "total_amount", "payment_method", "status", "due_date", "created_at", "items"]
        read_only_fields = ["user","total_amount","status","created_at"]


class TransactionSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    order_status = serializers.ReadOnlyField(source="order.status")

    class Meta:
        model = Transaction
        fields = "__all__"