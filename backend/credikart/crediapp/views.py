from rest_framework.decorators import api_view ,permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
from .models import *
from django.db.models import Q
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.utils import timezone
from django.utils.timezone import now
from datetime import datetime
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .payment_gateway import client

@api_view(["POST"])
def customer_register(request):
    serializer = CustomerRegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Customer registered successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def shopkeeper_register(request):
    serializer = ShopkeeperRegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Shopkeeper registered successfully."},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    print("REQUEST DATA:", request.data)
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if user.role == "shopkeeper" and not user.is_approved:
        return Response(
            {"error": "Waiting for admin approval"},
            status=status.HTTP_403_FORBIDDEN
        )

    refresh = RefreshToken.for_user(user)
    if user.is_superuser:
       user = User.objects.get(username="admin")
       user.role = "admin"
       user.is_staff = True
       user.save()
    else:
      user.role = user.role
  
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_approved": user.is_approved,
        }
    })
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_shopkeepers(request):

    if request.user.role != "admin":
        return Response(
            {"error": "Unauthorized"},
            status=403
        )

    shopkeepers = User.objects.filter(
        role="shopkeeper",
        is_approved=False
    )

    serializer = ShopkeeperListSerializer(
        shopkeepers,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def approve_shopkeeper(request, user_id):

    # Admin only
    if request.user.role != "admin":

        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        shopkeeper = User.objects.get(
            id=user_id,
            role="shopkeeper"
        )

    except User.DoesNotExist:

        return Response(
            {"error": "Shopkeeper not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    shopkeeper.is_approved = True
    shopkeeper.save()

    return Response(
        {
            "message": "Shopkeeper approved successfully"
        },
        status=status.HTTP_200_OK
    )




@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def reject_shopkeeper(request, user_id):

    # Only admin can reject
    if request.user.role != "admin":

        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        shopkeeper = User.objects.get(
            id=user_id,
            role="shopkeeper"
        )

        # Delete rejected shopkeeper
        shopkeeper.is_approved = False
        shopkeeper.save()

        return Response(
            {
                "message":
                "Shopkeeper rejected successfully"
            },
            status=status.HTTP_200_OK
        )

    except User.DoesNotExist:

        return Response(
            {
                "error":
                "Shopkeeper not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
    

    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shopkeepers_list(request):

    # Admin only
    if request.user.role != "admin":

        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_403_FORBIDDEN
        )

    shopkeepers = User.objects.filter(role="shopkeeper").order_by("-created_at")

    serializer = ShopkeeperListSerializer(
        shopkeepers,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)    
from decimal import Decimal

PENALTY_PERCENTAGE = Decimal("0.02")
ADMIN_COMMISSION_PERCENTAGE = Decimal("0.05")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_revenue_dashboard(request):

    total_credit = (
        Transaction.objects.aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")
    )

    total_repayment = (
        Repayment.objects.aggregate(
            total=Sum("amount_paid")
        )["total"] or Decimal("0")
    )

    outstanding_balance = (
        total_credit - total_repayment
    )

    admin_commission = (
        total_repayment * ADMIN_COMMISSION_PERCENTAGE
    )

    total_penalty = (
        Repayment.objects.aggregate(
            total=Sum("penalty_amount")
        )["total"] or Decimal("0")
    )

    total_admin_revenue = (
        admin_commission + total_penalty
    )

    return Response({
        "total_credit_given": total_credit,
        "total_repayment_received": total_repayment,
        "outstanding_balance": outstanding_balance,
        "commission_revenue": admin_commission,
        "penalty_revenue": total_penalty,
        "total_admin_revenue": total_admin_revenue
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_notifications(request):

    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    Notification.objects.create(
        title=request.data.get("title"),
        message=request.data.get("message"),
        role=request.data.get("role", "all")
    )

    return Response({"message": "Notification sent successfully"})

@api_view(["GET"])
def get_notifications(request):
    role = request.query_params.get("role")

    notifications = Notification.objects.filter(
        Q(role=role) | Q(role="all")
    ).order_by("-created_at")

    data = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at,
        }
        for n in notifications
    ]

    return Response(data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def products(request):

    # ONLY CURRENT shopkeeper PRODUCTS
    if request.method == "GET":

        products = Product.objects.filter(
            shopkeeper=request.user
        )

        serializer = ProductSerializer(
            products,
            many=True
        )

        return Response(serializer.data)


    # ADD PRODUCT
    elif request.method == "POST":

        serializer = ProductSerializer(
                data=request.data,
                context={"request": request}
            )

        if serializer.is_valid():

                serializer.save()

                return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)



# UPDATE + DELETE PRODUCT

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):

    try:

 # ONLY CURRENT shopkeeper PRODUCTS details
        product = Product.objects.get(
            id=pk,
            shopkeeper=request.user
        )

    except Product.DoesNotExist:

        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND
        )


    # GET SINGLE PRODUCT
    if request.method == "GET":

        serializer = ProductSerializer(product)

        return Response(serializer.data)


    # UPDATE PRODUCT
    elif request.method == "PUT":

        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    # DELETE PRODUCT
    elif request.method == "DELETE":

        product.delete()

        return Response(
            {"message": "Deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    # GET PRODUCTS
    if request.method == "GET":

        products = Product.objects.all()

        serializer = ProductSerializer(
            products,
            many=True
        )

        return Response(serializer.data)


    # ADD PRODUCT
    elif request.method == "POST":

        serializer = ProductSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
def AllProducts(request):
    queryset = Product.objects.all()

    # GET query params
    search = request.GET.get("search")
    category = request.GET.get("category")
    max_price = request.GET.get("max_price")
    in_stock = request.GET.get("in_stock")

    # ======================
    # SEARCH (name + keyword)
    # ======================
    if search:
        queryset = queryset.filter(name__icontains=search)
        

    # ======================
    # CATEGORY FILTER
    # ======================
    if category:
        queryset = queryset.filter(category=category)

    # ======================
    # PRICE FILTER
    # ======================
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    # ======================
    # STOCK FILTER
    # ======================
    if in_stock == "true":
        queryset = queryset.filter(stock__gt=0)

    serializer = ProductSerializer(queryset, many=True)
    return Response(serializer.data)



# ================= ADD TO CART =================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):

    product = Product.objects.get(id=product_id)

    cart_item, created = Cart.objects.get_or_create(
        customer=request.user,
        product=product
    )

    if not created:
        cart_item.quantity += 1

    cart_item.save()

    return Response({"message": "Added to cart"})


# ================= GET CART =================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(request):

    cart = Cart.objects.filter(customer=request.user)

    serializer = CartSerializer(cart, many=True)

    return Response(serializer.data)


# ================= UPDATE QUANTITY =================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_cart(request, cart_id):

    cart_item = Cart.objects.get(
        id=cart_id,
        customer=request.user
    )

    action = request.data.get("action")

    if action == "increase":
        cart_item.quantity += 1

    elif action == "decrease":

        if cart_item.quantity > 1:
            cart_item.quantity -= 1

    cart_item.save()

    return Response({"message": "Cart updated"})


# ================= REMOVE ITEM =================

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, cart_id):

    cart_item = Cart.objects.get(
        id=cart_id,
        customer=request.user
    )

    cart_item.delete()

    return Response({"message": "Item removed"})


# ================= SAVE CHECKOUT =================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_checkout(request):

    cart_items = Cart.objects.filter(
        customer=request.user
    )

    total = sum(
        item.product.price * item.quantity
        for item in cart_items
    )
    checkout, created = Checkout.objects.get_or_create(
        customer=request.user
    )

    checkout.payment_method = request.data.get(
        "payment_method"
    )

    checkout.repayment_schedule = request.data.get(
        "repayment_schedule"
    )

    checkout.due_date = request.data.get(
        "due_date"
    )
    if checkout.payment_method == "credit":
        if checkout.repayment_schedule == "weekly" or checkout.repayment_schedule == "weekly":

            checkout.total_installments = 4
            checkout.installment_amount = total / 4

    checkout.total_amount = total

    checkout.save()

    serializer = CheckoutSerializer(checkout)

    return Response(serializer.data)


# ================= GET CHECKOUT =================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_checkout(request):

    try:

        checkout = Checkout.objects.get(
            customer=request.user
        )

        serializer = CheckoutSerializer(checkout)

        return Response(serializer.data)

    except Checkout.DoesNotExist:

        return Response({
            "error": "No checkout found"
        }, status=404)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_customers(request):

    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    customers = User.objects.filter(role="customer")
    serializer = UserSerializer(customers, many=True)

    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_list(request):

    if request.user.role != "shopkeeper":
        return Response({"error": "Unauthorized"}, status=403)

    orders = Order.objects.filter(
    items__product__shopkeeper=request.user
)

    customers = User.objects.filter(
        id__in=orders.values_list("user_id", flat=True),
        role="customer"
    ).distinct()

    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_order(request):

    try:

        user = request.user
        data = request.data

        payment_method = data.get("payment_method")
        repayment_schedule = data.get("repayment_schedule")
        due_date = data.get("due_date")

        # ================= CART ITEMS =================

        cart_items = Cart.objects.filter(
            customer=user
        )

        if not cart_items.exists():

            return Response(
                {"error": "Cart is empty"},
                status=400
            )

        # ================= TOTAL =================

        total_amount = sum(
            item.product.price * item.quantity
            for item in cart_items
        )

        # ================= OVERDUE CHECK =================

        overdue_exists = Order.objects.filter(
            user=user,
            status="overdue"
        ).exists()

        if overdue_exists:

            return Response(
                {
                    "error":
                    "Clear overdue payments first"
                },
                status=403
            )

        # ================= INSTALLMENT LOGIC =================

        installment_amount = None
        total_installments = 1
        remaining_amount = total_amount

        if payment_method == "credit":

            plan = RepaymentPlan.objects.create(

                order=order,

                schedule_type=repayment_schedule,

                total_installments=total_installments,

                installment_amount=installment_amount,

                start_date=timezone.now().date()
            )

            # CREATE INSTALLMENTS

            for i in range(total_installments):

                if repayment_schedule == "weekly":

                    due_date = (
                        timezone.now().date()
                        + timedelta(days=7 * (i + 1))
                    )

                else:  # monthly

                    due_date = (
                        timezone.now().date()
                        + timedelta(days=30 * (i + 1))
                    )

                RepaymentInstallment.objects.create(

                    plan=plan,

                    due_date=due_date,

                    amount=installment_amount,

                    status="pending"
                )

            if repayment_schedule == "weekly" or repayment_schedule == "monthly":

                total_installments = 4
                installment_amount = (
                    total_amount / 4
                )

            elif repayment_schedule == "custom":

                total_installments = 1
                installment_amount = total_amount

        # ================= CREATE ORDER =================

        order = Order.objects.create(

            user=user,

            total_amount=total_amount,

            remaining_amount=remaining_amount,

            payment_method=payment_method,

            repayment_schedule=repayment_schedule,

            installment_amount=installment_amount,

            total_installments=total_installments,

            installments_paid=0,

            status=(
                "credit"
                if payment_method == "credit"
                else "paid"
            ),

            due_date=(
                due_date
                if payment_method == "credit"
                else None
            )
        )

        # ================= CREATE ORDER ITEMS =================

        for item in cart_items:

            product = item.product

            # STOCK CHECK

            if product.stock < item.quantity:

                return Response(
                    {
                        "error":
                        f"{product.name} out of stock"
                    },
                    status=400
                )

            OrderItem.objects.create(

            order=order,

            product=product,

            quantity=item.quantity,

            price=product.price,

            subtotal=(
                item.quantity * product.price
            )
        )
        
            # REDUCE STOCK

            product.stock -= item.quantity

            if product.stock <= 0:

                product.stock = 0
                product.is_available = False

            product.save()

        # ================= TRANSACTION =================

        Transaction.objects.create(

            user=user,

            order=order,

            transaction_type=(
                "credit"
                if payment_method == "credit"
                else "payment"
            ),

            amount=total_amount,

            description=(
                "Credit Purchase"
                if payment_method == "credit"
                else "Ready Payment"
            )
        )
        # ================= NOTIFICATION =================

        if payment_method == "credit":

            Notification.objects.create(

                title="Credit Purchase Created",

                message=(
                    f"Your payment of ₹{total_amount} "
                    f"is due on {due_date}"
                ),

                role="customer"
            )

        # ================= CLEAR CART =================

        cart_items.delete()

        return Response({

            "message":
            "Order placed successfully",

            "order_id":
            order.id,

            "total_amount":
            order.total_amount,

            "remaining_amount":
            order.remaining_amount,

            "installment_amount":
            order.installment_amount,

            "total_installments":
            order.total_installments,

            "due_date":
            order.due_date,

            "status":
            order.status

        }, status=201)

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=500
        )

# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def place_order(request):
#     try:
#         user = request.user
#         data = request.data
#         payment_method = data.get("payment_method")
#         total_amount = data.get("total_amount")
#         items = data.get("items", [])

#         repayment_schedule = data.get("repayment_schedule")
#         custom_due_date = data.get("custom_due_date")

#         # ================= CHECK OVERDUE =================
#         if Order.objects.filter(
#             user=user,
#             payment_method="credit",
#             status="overdue"
#         ).exists():
#             return Response(
#                 {"error": "You have overdue payments. Clear dues before purchasing."},
#                 status=403
#             )

#         # ================= CALCULATE DUE DATE =================
#         due_date = None

#         if payment_method == "credit":
#             if repayment_schedule == "weekly":
#                 due_date = timezone.now().date() + timedelta(days=7)

#             elif repayment_schedule == "2_weeks":
#                 due_date = timezone.now().date() + timedelta(days=14)

#             elif repayment_schedule == "3_weeks":
#                 due_date = timezone.now().date() + timedelta(days=21)

#             elif repayment_schedule == "monthly":
#                 due_date = timezone.now().date() + timedelta(days=30)

#             elif repayment_schedule == "custom":
#                 if not custom_due_date:
#                     return Response(
#                         {"error": "Custom due date is required"},
#                         status=400
#                     )
#                 due_date = datetime.strptime(custom_due_date, "%Y-%m-%d").date()

#             else:
#                 due_date = timezone.now().date() + timedelta(days=7)

#         # ================= CREATE ORDER =================
#         order = Order.objects.create(
#             user=user,
#             total_amount=total_amount,
#             payment_method=payment_method,
#             repayment_schedule=repayment_schedule,
#             status="credit" if payment_method == "credit" else "paid",
#             due_date=due_date
#         )
#         print(user,total_amount,payment_method,status,due_date)
#         # ================= ORDER ITEMS =================
#         for item in items:
#             product = get_object_or_404(Product, id=item["product"])

#             # stock check
#             if product.stock < item["quantity"]:
#                 return Response(
#                     {"error": f"{product.name} out of stock"},
#                     status=400
#                 )

#             OrderItem.objects.create(
#                 order=order,
#                 product=product,
#                 quantity=item["quantity"],
#                 price=item["price"]
#             )

#             # reduce stock
#             product.stock -= item["quantity"]

#             if product.stock <= 0:
#                 product.stock = 0
#                 product.is_available = False

#             product.save()

#         # ================= TRANSACTION =================
#         Transaction.objects.create(
#             user=user,
#             order=order,
#             transaction_type="credit" if payment_method == "credit" else "payment",
#             amount=total_amount,
#             description="Credit Purchase" if payment_method == "credit" else "Ready Payment"
#         )

#         # ================= NOTIFICATION =================
#         if payment_method == "credit":
#             Notification.objects.create(
#                 title="Credit Purchase Created",
#                 message=f"Your payment of ₹{total_amount} is due on {due_date}",
#                 role="customer"
#             )

#         return Response({
#             "message": "Order placed successfully",
#             "order_id": order.id,
#             "due_date": due_date
#         }, status=201)

#     except Exception as e:
#         return Response(
#             {"error": str(e)},
#             status=500
#         )
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_transactions(request):

    transactions = Transaction.objects.filter(
        user=request.user
    ).order_by("-created_at")

    data = [
        {
            "id": t.id,
            "transaction_type": t.transaction_type,
            "amount": t.amount,
            "description": t.description,
            "order_status":t.order.status,
            "created_at": t.created_at
        }
        for t in transactions
    ]

    return Response(data) 


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def repay_credit(request, order_id):

    try:
        
        order = Order.objects.get(
            id=order_id,
            user=request.user
        )
        if order.status == "paid":
            return Response(
        {"error": "Already paid"},
        status=400
    )

        order.status = "paid"
        order.payment_method = "ready"
        order.save()

        Transaction.objects.create(
            user=request.user,
            order=order,
            transaction_type="payment",
            amount=order.total_amount,
            description="Credit Repayment"
        )

        return Response({
            "message": "Repayment successful"
        })

    except Order.DoesNotExist:

        return Response(
            {"error": "Order not found"},
            status=404
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def credit_list(request):

    try:
        user = request.user

        # only current user's credit orders
        orders = Order.objects.filter(
            user=user,
            payment_method="credit"
        ).order_by("-created_at")

        data = []

        for order in orders:

            items_data = []

            for item in order.items.all():

                items_data.append({
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "subtotal": item.quantity * item.price
                })

            data.append({
                "id": order.id,
                "customer": order.user.username,
                "total_amount": order.total_amount,
                "payment_method": order.payment_method,
                "status": order.status,
                "due_date": order.due_date,
                "created_at": order.created_at,
                "items": items_data
            })

        return Response(data)

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=500
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def credit_detail(request, order_id):

    try:

        order = Order.objects.get(
            id=order_id,
            user=request.user
        )

        data = {
            "id": order.id,
            "customer": order.user.username,
            "total_amount": order.total_amount,
            "status": order.status,
            "due_date": order.due_date,
            "created_at": order.created_at,

            "items": [
                {
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price": item.price,
                }
                for item in order.items.all()
            ]
        }

        return Response(data)

    except Order.DoesNotExist:

        return Response(
            {"error": "Order not found"},
            status=404
        )
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_notifications(request):
    user = request.user

    notifications = Notification.objects.filter(
        role__in=["customer", "all"]
    ).order_by("-created_at")

    data = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at,
        }
        for n in notifications
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def orders_list(request):

    if request.user.role != "shopkeeper":
        return Response({"error": "Unauthorized"}, status=403)

    orders = Order.objects.select_related("user").all()

    # ================= FILTERS =================

    status_filter = request.GET.get("status")
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if status_filter == "paid":
        orders = orders.filter(status="paid")

    elif status_filter == "pending":
        orders = orders.filter(status="credit")

    elif status_filter == "overdue":
        today = now().date()

        orders = orders.filter(
            status="credit",
            due_date__lt=today
        )

    # ================= DATE RANGE =================

    if start_date:
        orders = orders.filter(created_at__date__gte=start_date)

    if end_date:
        orders = orders.filter(due_date=end_date)

    # ================= RESPONSE =================

    data = [
        {
            "id": o.id,
            "customer": o.user.username,
            "amount": o.total_amount,
            "status": o.status,
            "payment_method": o.payment_method,
            "due_date": o.due_date,
            "created_at": o.created_at,
        }
        for o in orders.order_by("-created_at")
    ]

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_due_date(request, order_id):

    if request.user.role != "shopkeeper":
        return Response({"error": "Unauthorized"}, status=403)

    try:
        order = Order.objects.get(id=order_id)

        due_date = request.data.get("due_date")
        due_date = datetime.strptime(due_date, "%Y-%m-%d").date()

        if due_date < timezone.now().date():
            return Response({"error": "Due date cannot be before today"}, status=400)

        order.due_date = due_date
        order.save()

        return Response({"message": "Due date updated"})

    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except ValueError:
        return Response({"error": "Invalid date format (use YYYY-MM-DD)"}, status=400)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_due_notification(request, order_id):

    if request.user.role != "shopkeeper":
        return Response({"error": "Unauthorized"}, status=403)

    order = Order.objects.get(id=order_id)

    Notification.objects.create(
        title="Payment Reminder",
        message=f"Your credit of ₹{order.total_amount} is due on {order.due_date}",
        role="customer"
    )

    return Response({"message": "Notification sent"})    


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shopkeeper_analytics(request):

    if request.user.role != "shopkeeper":
        return Response({"error": "Unauthorized"}, status=403)

    today = timezone.now()
    week = today - timedelta(days=7)
    month = today - timedelta(days=30)

    orders = Order.objects.filter(
        items__product__shopkeeper=request.user
    ).distinct()

    total_credit = orders.filter(
        payment_method="credit"
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    total_paid = orders.filter(
        status="paid"
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    weekly_credit = orders.filter(
        payment_method="credit",
        created_at__gte=week
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    weekly_paid = orders.filter(
        status="paid",
        created_at__gte=week
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    monthly_credit = orders.filter(
        payment_method="credit",
        created_at__gte=month
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    monthly_paid = orders.filter(
        status="paid",
        created_at__gte=month
    ).aggregate(total=Sum("total_amount"))["total"] or 0

    return Response({
        "total_credit": total_credit,
        "total_paid": total_paid,
        "weekly_credit": weekly_credit,
        "weekly_paid": weekly_paid,
        "monthly_credit": monthly_credit,
        "monthly_paid": monthly_paid,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request, order_id):

    order = Order.objects.get(
        id=order_id,
        user=request.user
    )

    installment_id = request.data.get("installment_id")

    # ================= INSTALLMENT PAYMENT =================

    if installment_id:

        installment = RepaymentInstallment.objects.get(
            id=installment_id,
            plan__order=order
        )

        amount = installment.amount

    else:
        # FULL PAYMENT
        amount = order.remaining_amount

    data = {
        "amount": int(amount * 100),
        "currency": "INR",
        "payment_capture": 1
    }

    payment = client.order.create(data=data)

    return Response({
        "order_id": payment["id"],
        "amount": payment["amount"],
        "currency": payment["currency"],
        "key": settings.RAZORPAY_KEY_ID
    })

import hmac
import hashlib

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request, order_id):

    order = Order.objects.get(
        id=order_id,
        user=request.user
    )

    installment_id = request.data.get("installment_id")

    razorpay_order_id = request.data["razorpay_order_id"]
    razorpay_payment_id = request.data["razorpay_payment_id"]
    razorpay_signature = request.data["razorpay_signature"]

    msg = f"{razorpay_order_id}|{razorpay_payment_id}"

    secret = settings.RAZORPAY_KEY_SECRET

    generated_signature = hmac.new(
        secret.encode(),
        msg.encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != razorpay_signature:

        return Response(
            {"error": "Invalid signature"},
            status=400
        )

    # ================= INSTALLMENT PAYMENT =================

    if installment_id:

        installment = RepaymentInstallment.objects.get(
            id=installment_id,
            plan__order=order
        )

        if installment.status == "paid":

            return Response(
                {"error": "Already paid"},
                status=400
            )

        installment.status = "paid"
        installment.paid_at = timezone.now()
        installment.save()

        # reduce remaining amount
        order.remaining_amount -= installment.amount

        if order.remaining_amount <= 0:

            order.remaining_amount = 0
            order.status = "paid"
            order.payment_method = "ready"

        order.save()

        Transaction.objects.create(
            user=request.user,
            order=order,
            transaction_type="payment",
            amount=installment.amount,
            description="Installment Payment"
        )

        return Response({
            "message": "Installment paid successfully"
        })

    # ================= FULL PAYMENT =================

    order.status = "paid"
    order.payment_method = "ready"
    order.remaining_amount = 0
    order.save()

    return Response({
        "message": "Payment verified successfully"
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def repayment_schedule(request, order_id):

    try:
        plan = RepaymentPlan.objects.get(order_id=order_id)

        serializer = RepaymentPlanSerializer(plan)

        return Response(serializer.data)

    except RepaymentPlan.DoesNotExist:

        return Response(
            {
                "message": "No repayment plan created yet"
            },
            status=404
        )