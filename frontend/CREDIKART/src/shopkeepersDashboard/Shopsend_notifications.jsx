import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Shopsend_notifications.css";
import Backbutton from "../auth/Backbutton";

function Shopsend_notifications() {

  const [orders, setOrders] = useState([]);

  // ================= FETCH CREDIT ORDERS =================
  const fetchOrders = async () => {
    try {

      const res = await api.get("/orders_list/", {
        params: {
          status: "pending",
        },
      });

      setOrders(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= SEND REMINDER =================
  const sendReminder = async (orderId) => {
    try {

      await api.post(`/order/${orderId}/notify/`);

      alert("Reminder notification sent");

    } catch (err) {
      console.log(err);
      alert("Failed to send notification");
    }
  };

  return (
    <div className="due-page">

   <Backbutton />

      <div className="due-container">

        <h2>Credit Due Notifications</h2>

        {orders.length === 0 ? (

          <p>No pending credit orders</p>

        ) : (

          <div className="due-grid">

            {orders.map((o) => (

              <div className="due-card" key={o.id}>

                <h3>Order #{o.id}</h3>

                <p>
                  <strong>Customer:</strong> {o.customer}
                </p>

                <p>
                  <strong>Amount:</strong> ₹{o.amount}
                </p>

                <p>
                  <strong>Due Date:</strong>{" "}
                  {o.due_date || "Not Set"}
                </p>

                <p>
                  <strong>Status:</strong> {o.status}
                </p>

                <button
                  className="notify-btn"
                  onClick={() => sendReminder(o.id)}
                >
                  Send Reminder
                </button>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}

export default Shopsend_notifications;

