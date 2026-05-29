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
        ("partial", "Partially Paid"),
        ("overdue", "Overdue"),
    ]

    REPAYMENT_CHOICES = [
        ("weekly", "Weekly Payment"),
        ("monthly", "Monthly Payment"),
        ("custom", "Custom Due Date"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # NEW
    remaining_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    repayment_schedule = models.CharField(
        max_length=20,
        choices=REPAYMENT_CHOICES,
        null=True,
        blank=True
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    # NEW
    installment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    # NEW
    total_installments = models.IntegerField(
        default=1
    )

    # NEW
    installments_paid = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Order #{self.id}"
    


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    # product price at purchase time
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # NEW
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        # auto subtotal calculation
        self.subtotal = (
            self.quantity * self.price
        )

        super().save(*args, **kwargs)

    def __str__(self):

        return (
            f"{self.product.name} "
            f"x {self.quantity}"
        )
class Cart(models.Model):

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(default=1)

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "product")

    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.customer.username} - {self.product.name}"    

class Transaction(models.Model):

    TRANSACTION_TYPES = [
        ("credit", "Credit Purchase"),
        ("payment", "Payment"),
        ("refund", "Refund"),
    ]


    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    order = models.ForeignKey("Order", on_delete=models.CASCADE, null=True, blank=True)
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    description = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"
    
class Checkout(models.Model):

    PAYMENT_CHOICES = [
        ("ready", "Ready Payment"),
        ("credit", "Pay Later"),
    ]

    REPAYMENT_CHOICES = [
        ("weekly", "Weekly Payment"),
        ("monthly", "Monthly Payment"),
        ("custom", "Custom Due Date"),
    ]

    customer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="checkout"
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES
    )

    repayment_schedule = models.CharField(
        max_length=20,
        choices=REPAYMENT_CHOICES,
        null=True,
        blank=True
    )

    due_date = models.DateField(
        null=True,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # NEW
    installment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    # NEW
    total_installments = models.IntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.customer.username} Checkout" 

class Repayment(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)

    # Late payment penalty
    penalty_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    paid_at = models.DateTimeField(auto_now_add=True)

class RepaymentPlan(models.Model):

    SCHEDULE_CHOICES = [
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
    ]

    order = models.ForeignKey(
        "Order",
        on_delete=models.CASCADE,
        related_name="repayment_plans"
    )

    schedule_type = models.CharField(
        max_length=20,
        choices=SCHEDULE_CHOICES
    )

    total_installments = models.IntegerField(default=1)

    installment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    start_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

class RepaymentInstallment(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
    ]

    plan = models.ForeignKey(
        RepaymentPlan,
        on_delete=models.CASCADE,
        related_name="installments"
    )

    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    paid_at = models.DateTimeField(null=True, blank=True)       