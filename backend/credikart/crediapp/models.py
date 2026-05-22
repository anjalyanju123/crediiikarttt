from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("customer", "Customer"),
        ("shopkeeper", "Shopkeeper"),
    )

    # ========================
    # COMMON FIELDS
    # ========================
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")

    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # ========================
    # SHOPKEEPER ONLY FIELDS
    # ========================
    shop_name = models.CharField(max_length=100, blank=True, null=True)
    shop_type = models.CharField(max_length=50, blank=True, null=True)

    gst_number = models.CharField(max_length=30, blank=True, null=True)
    shop_license_number = models.CharField(max_length=50, blank=True, null=True)

    gst_document = models.FileField(upload_to="shop_documents/",blank=True,null=True)

    license_document = models.FileField(upload_to="shop_documents/",blank=True,null=True)

    customers = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="shopkeepers"
    )

    # ========================
    # APPROVAL SYSTEM
    # ========================
    is_approved = models.BooleanField(default=False)

    # ========================
    # TIMESTAMPS
    # ========================
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    


class Notification(models.Model):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("shopkeeper", "Shopkeeper"),
        ("all", "All"),
    )

    title = models.CharField(max_length=255)
    message = models.TextField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="all")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title   



class Product(models.Model):

    shopkeeper = models.ForeignKey(User,on_delete=models.CASCADE,related_name="products")

    CATEGORY_CHOICES = [

        ("Grocery", "Grocery"),
        ("Bakery", "Bakery"),
        ("Electronics", "Electronics"),
        ("Medical Store", "Medical Store"),
        ("Textile", "Textile"),
        ("Footwear", "Footwear"),
        ("Jewellery", "Jewellery"),
        ("Furniture", "Furniture"),
        ("Stationery", "Stationery"),
        ("Restaurant", "Restaurant"),
        ("Supermarket", "Supermarket"),
        ("Mobile Shop", "Mobile Shop"),
        ("Hardware", "Hardware"),
        ("Beauty & Cosmetics", "Beauty & Cosmetics"),

    ]

    name = models.CharField(max_length=100)

    category = models.CharField(max_length=100,choices=CATEGORY_CHOICES)

    price = models.DecimalField(max_digits=10,decimal_places=2)

    stock = models.IntegerField()

    description = models.TextField(blank=True)

    product_image = models.ImageField(upload_to="products/",null=True,blank=True)

    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    

class Order(models.Model):
    PAYMENT_CHOICES = [
        ("ready", "Ready Payment"),
        ("credit", "Pay Later"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("credit", "Credit Pending"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    

class OrderItem(models.Model):

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"