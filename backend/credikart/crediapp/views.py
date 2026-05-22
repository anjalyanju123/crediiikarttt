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
def login_view(request):
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
    admin = User.objects.get(username="admin")
    admin.role = "admin"
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    user = request.user

    return Response({
        "username": user.username,
        "role": user.role,})



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def products(request):

    # ONLY CURRENT USER PRODUCTS
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
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                shopkeeper=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



# UPDATE + DELETE PRODUCT

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):

    try:

        # ONLY USER OWN PRODUCT
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
def product_list(request):
    queryset = Product.objects.all()

    # Get query params
    search = request.GET.get("search")
    category = request.GET.get("category")
    max_price = request.GET.get("max_price")
    in_stock = request.GET.get("in_stock")

    # SEARCH by name
    if search:
        queryset = queryset.filter(name__icontains=search)

    # FILTER by category
    if category:
        queryset = queryset.filter(category=category)

    # FILTER by price
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    # FILTER stock availability
    if in_stock == "true":
        queryset = queryset.filter(stock__gt=0)

    serializer = ProductSerializer(queryset, many=True)
    return Response(serializer.data)


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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_customers(request):

    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    customers = User.objects.filter(role="customer")
    serializer = UserSerializer(customers, many=True)

    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_add_customer(request):

    if request.user.role != "admin":
        return Response({"error": "Unauthorized"}, status=403)

    user = User.objects.create_user(
        username=request.data["username"],
        email=request.data["email"],
        password=request.data["password"],
        role="customer"
    )

    return Response({"message": "Customer created"})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def admin_update_customer(request, id):
    try:
        customer = User.objects.get(id=id, role="customer")
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    customer.username = request.data.get("username", customer.username)
    customer.email = request.data.get("email", customer.email)
    customer.save()

    return Response({"message": "Customer updated"})

@api_view(["GET"])
def customer_list(request):
    customers = User.objects.filter(role="customer")
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)


# ================= ADD =================
@api_view(["POST"])
def add_customer(request):
    user = User.objects.create_user(
        username=request.data["username"],
        email=request.data["email"],
        password=request.data["password"],
        role="customer"
    )
    return Response({"message": "Customer created"})


# ================= UPDATE =================
@api_view(["PUT"])
def update_customer(request, id):
    try:
        customer = User.objects.get(id=id, role="customer")
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    customer.username = request.data.get("username", customer.username)
    customer.email = request.data.get("email", customer.email)
    customer.save()

    return Response({"message": "Customer updated"})


# ================= DELETE =================
@api_view(["DELETE"])
def delete_customer(request, id):
    try:
        customer = User.objects.get(id=id, role="customer")
        customer.delete()
        return Response({"message": "Deleted"})
    except User.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        data = request.data

        user = request.user

        payment_method = data.get("payment_method")
        total_amount = data.get("total_amount")
        items = data.get("items", [])

        # ================= CREATE ORDER =================
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            payment_method=payment_method,
            status="credit" if payment_method == "credit" else "paid"
        )

        # ================= CREATE ORDER ITEMS =================
        for item in items:
            product = Product.objects.get(id=item["product"])

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item["quantity"],
                price=item["price"]
            )

            # ================= REDUCE STOCK =================
            if product.stock >= item["quantity"]:
                product.stock -= item["quantity"]
                product.save()
            else:
                return Response(
                    {"error": f"Not enough stock for {product.name}"},
                    status=400
                )

        return Response({
            "message": "Order placed successfully",
            "order_id": order.id,
            "payment_method": payment_method,
            "status": order.status
        })

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def credit_list(request):
    user = request.user

    credits = Order.objects.filter(
        user=user,
        payment_method="credit"
    ).order_by("-created_at")

    data = [
        {
            "id": o.id,
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at,
        }
        for o in credits
    ]

    return Response(data)    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def credit_history(request):
    user = request.user

    orders = Order.objects.filter(
        user=user,
        payment_method="credit"
    ).order_by("-created_at")

    data = []

    for order in orders:
        items = order.items.all()

        data.append({
            "order_id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": [
                {
                    "product": i.product.name,
                    "quantity": i.quantity,
                    "price": i.price,
                    "subtotal": i.quantity * i.price
                }
                for i in items
            ]
        })

    return Response(data)
   