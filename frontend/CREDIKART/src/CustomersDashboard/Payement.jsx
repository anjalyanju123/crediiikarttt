import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CustDashboard from "./CustDashboard";

function Payment() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  // ================= LOAD CHECKOUT DATA =================
  useEffect(() => {
    const checkoutData = JSON.parse(localStorage.getItem("checkout"));
    setData(checkoutData);
  }, []);

  // ================= PLACE ORDER =================
  const placeOrder = async () => {
    try {
      const payload = {
        payment_method: data.paymentMethod,
        total_amount: data.total,
        status:
          data.paymentMethod === "credit" ? "credit" : "paid",

        items: data.cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await api.post("/place_order/", payload);

      // clear storage
      localStorage.removeItem("cart");
      localStorage.removeItem("checkout");

      alert("Order placed successfully!");

      // ================= REDIRECT LOGIC =================
      if (data.paymentMethod === "credit") {
        navigate("/credit-list");
      } else {
        navigate("/customer-transactions");
      }

    } catch (err) {

      console.log(err);

      if (err.response?.status === 403) {

        alert("You have overdue credit payments");

        navigate("/credit-list");

      } else {

        alert("Payment failed");

      }
    }
  };

  if (!data) return <p>Loading payment...</p>;

  return (
    <div className="payment-page">
      <CustDashboard />
      <h2>Payment Page</h2>

      <div className="payment-summary">
        <h3>Total: ₹{data.total}</h3>
        <p>
          Payment Method:{" "}
          <b>
            {data.paymentMethod === "credit"
              ? "Pay Later (Credit)"
              : "Ready Payment"}
          </b>
        </p>
      </div>

      {/* ORDER ITEMS PREVIEW */}
      <div className="order-preview">
        {data.cart.map((item) => (
          <div key={item.id} className="preview-item">
            <p>{item.name}</p>
            <p>₹{item.price} × {item.quantity}</p>
          </div>
        ))}
      </div>

      {/* CONFIRM BUTTON */}
      <button className="checkout-btn" onClick={placeOrder}>
        Confirm Order
      </button>
    </div>
  );
}

export default Payment;