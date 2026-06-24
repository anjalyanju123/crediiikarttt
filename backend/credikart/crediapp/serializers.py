from rest_framework import serializers
from .models import User, Product, Transaction


# =========================
# CUSTOMER REGISTER
# =========================
class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "address",
            "password",
            "confirm_password",
        ]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        user.phone = validated_data.get("phone")
        user.address = validated_data.get("address")
        user.role = "customer"
        user.save()

        return user


# =========================
# SHOPKEEPER REGISTER
# =========================
class ShopkeeperRegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "address",
            "shop_name",
            "shop_type",
            "gst_number",
            "shop_license_number",
            "gst_document",
            "license_document",
            "password",
            "confirm_password",
        ]

    def validate(self, data):

        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        # SAFE PHONE CHECK
        phone = data.get("phone")
        if phone and len(phone) != 10:
            raise serializers.ValidationError({"phone": "Phone must be 10 digits"})

        if User.objects.filter(username=data["username"]).exists():
            raise serializers.ValidationError({"username": "Username already exists"})

        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        return data

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
            role="shopkeeper",
            is_approved=False,
        )

        # extra fields
        user.phone = validated_data.get("phone")
        user.address = validated_data.get("address")
        user.shop_name = validated_data.get("shop_name")
        user.shop_type = validated_data.get("shop_type")
        user.gst_number = validated_data.get("gst_number")
        user.shop_license_number = validated_data.get("shop_license_number")
        user.gst_document = validated_data.get("gst_document")
        user.license_document = validated_data.get("license_document")

        user.save()
        return user


# =========================
# SHOPKEEPER LIST
# =========================
class ShopkeeperListSerializer(serializers.ModelSerializer):

    gst_document = serializers.SerializerMethodField()
    license_document = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "shop_name",
            "shop_type",
            "gst_number",
            "shop_license_number",
            "gst_document",
            "license_document",
            "is_approved",
        ]

    def get_gst_document(self, obj):
        request = self.context.get("request")
        if obj.gst_document:
            return request.build_absolute_uri(obj.gst_document.url)
        return None

    def get_license_document(self, obj):
        request = self.context.get("request")
        if obj.license_document:
            return request.build_absolute_uri(obj.license_document.url)
        return None


# =========================
# PRODUCT
# =========================
class ProductSerializer(serializers.ModelSerializer):

    shopkeeper = serializers.ReadOnlyField(source="shopkeeper.username")

    class Meta:
        model = Product
        fields = [
            "id",
            "shopkeeper",
            "name",   # ✅ FIXED (was product_name)
            "category",
            "description",
            "price",
            "stock",
            "product_image",
            "is_available",
        ]

        read_only_fields = ["id", "shopkeeper"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value

    def create(self, validated_data):
        return Product.objects.create(
            shopkeeper=self.context["request"].user,
            **validated_data
        )


# =========================
# USER
# =========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


# =========================
# TRANSACTION
# =========================
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"