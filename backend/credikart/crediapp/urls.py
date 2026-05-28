from django.urls import path
from .views import *

urlpatterns = [
    path('customer_register/',customer_register,name='customer_register'),
    path('shopkeeper_register/',shopkeeper_register,name='shopkeeper_register'),
    path('login/',login_view,name='login_view'),
    path('pending_shopkeepers/', pending_shopkeepers,name='pending_shopkeepers'),
    path('shopkeepers_list/', shopkeepers_list,name='shopkeepers_list'),
    path('approve_shopkeeper/<int:user_id>/',approve_shopkeeper,name='approve_shopkeeper'),
    path('reject_shopkeeper/<int:user_id>/',reject_shopkeeper,name='reject_shopkeeper'),
    path('send_notifications/',send_notifications,name='send_notifications'),
    path('products/',products,name='products'),
    path('products/<int:pk>/',product_detail,name='product_detail'),
    path('AllProducts/',AllProducts,name='AllProducts'),
    path('admin_customersview/',admin_customers,name='admin_customers'),
    path('customers/',customer_list,name='customer_list'),
    path('place_order/',place_order,name='place_order'),
    path('customer_notifications/',customer_notifications,name='customer_notifications'),
    path('customer_transactions/',customer_transactions,name='customer_transactions'),
    path('orders_list/',orders_list,name='orders_list'),
    path("order/<int:order_id>/set-due/", set_due_date, name="set_due_date"),
    path("order/<int:order_id>/notify/", send_due_notification, name="send_due_notification"),
    path('shopkeeper_analytics/',shopkeeper_analytics,name='shopkeeper_analytics'),
    path('repay_credit/<int:order_id>/', repay_credit, name='repay_credit'),
    path('credit_list/',credit_list,name='credit_list'),
    path('credit_detail/<int:order_id>/', credit_detail, name='credit_detail'),
    path('admin_revenue_dashboard/', admin_revenue_dashboard, name='admin_revenue_dashboard'),
    path('create_razorpay_order/<int:order_id>/', create_razorpay_order, name='create_razorpay_order'),
    path('verify_payment/<int:order_id>/', verify_payment, name='verify_payment'),
    path("add_to_cart/<int:product_id>/", add_to_cart,name='add_to_cart'),
    path("cart/", get_cart,name='get_cart'),
    path("cart/<int:cart_id>/", update_cart,name='update_cart'),
    path("cart/remove/<int:cart_id>/", remove_cart_item,name='remove_cart_item'),
    path("get_checkout/", get_checkout,name='get_checkout'),
    path("save_checkout/", save_checkout,name='save_checkout'),


]