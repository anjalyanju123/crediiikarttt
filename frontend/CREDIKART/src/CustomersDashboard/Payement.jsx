import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Backbutton from "../auth/Backbutton";
import './Payment.css';

function Payment() {
  const [data, setData] = useState(null);
  const [customDate, setCustomDate] = useState("");
  const navigate = useNavigate();

  // ================= LOAD CHECKOUT =================
  useEffect(() => {
    const checkoutData = JSON.parse(localStorage.getItem("checkout"));
    setData(checkoutData);
  }, []);

  // ================= PLACE ORDER =================
  const placeOrder = async () => {
    try {
      if (!data) return;

      // validation for custom date
      if (
        data.paymentMethod === "credit" &&
        data.repaymentSchedule === "custom" &&
        !customDate
      ) {
        alert("Please select custom due date");
        return;
      }

      const payload = {
        payment_method: data.paymentMethod,
        total_amount: data.total,

        repayment_schedule:
          data.paymentMethod === "credit"
            ? data.repaymentSchedule
            : null,

        custom_due_date:
          data.paymentMethod === "credit" &&
          data.repaymentSchedule === "custom"
            ? customDate
            : null,

        items: data.cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await api.post("/place_order/", payload);

      // clear storage
      localStorage.removeItem("cart");
      localStorage.removeItem("checkout");

      alert(res.data.message || "Order placed successfully!");


      // redirect
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
        console.log(err.response)
        alert(err.response?.data?.error || "Payment failed");
      }
    }
  };

  // ================= LOADING =================
  if (!data) return <p>Loading payment...</p>;

  // ================= AUTO DUE DATE =================
  const calculateDueDate = (schedule) => {
    const today = new Date();

    if (schedule === "weekly") today.setDate(today.getDate() + 7);
    else if (schedule === "2_weeks") today.setDate(today.getDate() + 14);
    else if (schedule === "3_weeks") today.setDate(today.getDate() + 21);
    else if (schedule === "monthly") today.setDate(today.getDate() + 30);

    return today.toISOString().split("T")[0];
  };

  return (
    <div>
      <Backbutton />

      <div className="payment-page">
        <h2>Payment Page</h2>

        {/* SUMMARY */}
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

          {/* CREDIT INFO */}
          {data.paymentMethod === "credit" && (
            <div style={{ marginTop: "10px" }}>
              <p>
                Repayment Schedule:{" "}
                <b style={{ color: "#38bdf8" }}>
                  {data.repaymentSchedule === "weekly" &&
                    "First Week (7 Days)"}
                  {data.repaymentSchedule === "2_weeks" &&
                    "Second Week (14 Days)"}
                  {data.repaymentSchedule === "3_weeks" &&
                    "Third Week (21 Days)"}
                  {data.repaymentSchedule === "monthly" &&
                    "Monthly (30 Days)"}
                  {data.repaymentSchedule === "custom" &&
                    "Custom Due Date"}
                </b>
              </p>

              {/* AUTO DUE DATE */}
              {data.repaymentSchedule !== "custom" && (
                <p>
                  Due Date:{" "}
                  <b style={{ color: "#34d399" }}>
                    {calculateDueDate(data.repaymentSchedule)}
                  </b>
                </p>
              )}

              {/* CUSTOM DATE */}
              {data.repaymentSchedule === "custom" && (
                <div style={{ marginTop: "10px" }}>
                  <label>Select Due Date</label>
                  <br />
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ITEMS */}
        <div className="order-preview">
          {data.cart.map((item) => (
            <div key={item.id} className="preview-item">
              <p>{item.name}</p>
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