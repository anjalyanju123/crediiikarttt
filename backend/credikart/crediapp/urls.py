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
    path('current_user/',current_user,name='current_user'),
    path('products/',products,name='products'),
    path('products/<int:pk>/',product_detail,name='product_detail'),
    path('AllProducts/',AllProducts,name='AllProducts'),
    path('admin_customersview/',admin_customers,name='admin_customers'),
    path('customers/',customer_list,name='customer_list'),
    path('add_customer/',add_customer,name='add_customer'),
    path('update_customer/<int:id>/',update_customer,name='update_customer'),
    path('delete_customer/<int:id>/',delete_customer,name='delete_customer'),
    path('admin_add_customer/',admin_add_customer,name='admin_add_customer'),
    path('admin_update_customer/',admin_update_customer,name='admin_update_customer'),
    path('place_order/',place_order,name='place_order'),
    path('credit_list/',credit_list,name='credit_list'),
    path('credit_history/',credit_history,name='credit_history'),
]