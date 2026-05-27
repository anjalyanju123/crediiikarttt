import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Backbutton from "../auth/Backbutton";

function CustomerRepayment() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const access = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {

    try {

      const res = await api.get(`/credit_detail/${id}/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      setOrder(res.data);

    } catch (err) {

      console.log(err);
    }
  };

  const makePayment = async () => {
  try {
    // 1. create order from backend
    const res = await api.post(
      `/create_razorpay_order/${id}/`,
      {},
      { headers: { Authorization: `Bearer ${access}` } }
    );

    const options = {
      key: res.data.key,
      amount: res.data.amount,
      currency: res.data.currency,
      name: "CrediKart",
      description: "Credit Payment",

      order_id: res.data.order_id,

      handler: async function (response) {
        // 2. verify payment
        await api.post(
          `/verify_payment/${id}/`,
          {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
          { headers: { Authorization: `Bearer ${access}` } }
        );

        alert("Payment Successful!");
        navigate("/credit-list");
      },

      theme: {
        color: "#22c55e",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment failed");
  }
};
  if (!order) return <p>Loading...</p>;

  return (
    <div>

      <Backbutton />

      <h2>Repayment Details</h2>

      <div className="credit-card">

        <h3>Order #{order.id}</h3>

        <p>
          <strong>Customer:</strong> {order.customer}
        </p>

        <p>
          <strong>Total Amount:</strong> ₹{order.total_amount}
        </p>

        <p>
          <strong>Status:</strong> {order.status}
        </p>

        <p>
          <strong>Due Date:</strong>{" "}
          {new Date(order.due_date).toLocaleDateString()}
        </p>

        <p>
          <strong>Created At:</strong>{" "}
          {new Date(order.created_at).toLocaleDateString()}
        </p>

        <hr />

        <h3>Products</h3>

        {order.items.map((item, index) => (

          <div key={index}>

            <p>{item.product_name}</p>

            <p>
              ₹{item.price} × {item.quantity}
            </p>

          </div>
        ))}

        <button
          onClick={makePayment}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Confirm Repayment
        </button>

      </div>
    </div>
  );
}

export default CustomerRepayment;

