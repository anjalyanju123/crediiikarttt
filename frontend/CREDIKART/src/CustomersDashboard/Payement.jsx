import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Backbutton from "../auth/Backbutton";
import "./Payment.css";

function Payment() {

  const [data, setData] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();

  // ================= LOAD DATA =================

  useEffect(() => {

    fetchCheckout();
    fetchCart();

  }, []);

  const fetchCheckout = async () => {

    try {

      const res = await api.get("/get_checkout/");

      setData(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  const fetchCart = async () => {

    try {

      const res = await api.get("/cart/");

      setCartItems(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= PLACE ORDER =================

const placeOrder = async () => {
  try {
    const payload = {
      payment_method: data.payment_method,
      total_amount: data.total_amount,
      repayment_schedule: data.repayment_schedule,
      due_date: data.due_date,
      items: cartItems.map(i => ({
        product: i.product,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    // 1. CREATE ORDER FIRST (IMPORTANT)
    const orderRes = await api.post("/place_order/", payload);
    const orderId = orderRes.data.order_id;

    alert(orderRes.data.message);

    // 2. CREDIT FLOW
    if (data.payment_method === "credit") {
      navigate("/credit-list");
      return;
    }

    // 3. READY PAYMENT → Razorpay
    const res = await api.post(`/create_razorpay_order/${orderId}/`);

    const options = {
      key: res.data.key,
      amount: res.data.amount,
      currency: res.data.currency,
      name: "CrediKart",
      description: "Ready Payment",

      order_id: res.data.order_id,

      handler: async function (response) {
        try {
          // verify payment
          await api.post(`/verify_payment/${orderId}/`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          alert("Payment Successful!");
          navigate("/customer-transactions");

        } catch (err) {
          console.log(err);
          alert("Payment verification failed");
        }
      },

      theme: { color: "#22c55e" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert(err.response?.data?.error || "Payment failed");
  }
};

  // ================= LOADING =================

  if (!data) {

    return <h2>Loading...</h2>;

  }

  return (

    <div>

      <Backbutton />

      <div className="payment-page">

        <h2>Payment Page</h2>

        {/* SUMMARY */}

        <div className="payment-summary">

          <h3>Total: ₹{data.total_amount}</h3>

          <p>
            Payment Method:
            {" "}
            <b>
              {data.payment_method === "credit"
                ? "Pay Later (Credit)"
                : "Ready Payment"}
            </b>
          </p>

          {data.payment_method === "credit" && (

            <div style={{ marginTop: "10px" }}>

              <p>
                Repayment Schedule:
                {" "}
                <b style={{ color: "#38bdf8" }}>
                  {data.repayment_schedule}
                </b>
              </p>

              <p>
                Due Date:
                {" "}
                <b style={{ color: "#34d399" }}>
                  {data.due_date}
                </b>
              </p>

            </div>

          )}

        </div>

        {/* CART ITEMS */}

        <div className="order-preview">

          {cartItems.map((item) => (

            <div key={item.id} className="preview-item">

              <p>{item.product_name}</p>

              <p>
                ₹{item.price} × {item.quantity}
              </p>

            </div>

          ))}

        </div>

        {/* BUTTON */}

        <button className="checkout-btn" onClick={placeOrder}>
          Confirm Order
        </button>

      </div>

    </div>
  );
}

export default Payment;