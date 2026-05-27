import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Order.css";
import Backbutton from "../auth/Backbutton";

function Order() {
  const [orders, setOrders] = useState([]);
  const [dueDates, setDueDates] = useState({});
  const [error, setError] = useState("")
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchOrders(); }, [status, startDate, endDate]);

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders_list/", {
        params: {
          status: status,
          start_date: startDate,
          end_date: endDate,
        },
      });

      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // ================= SET DUE DATE =================
  const handleDueDateChange = (orderId, value) => {
    setDueDates({ ...dueDates, [orderId]: value });
  };

  const setDueDate = async (orderId) => {
    const date = dueDates[orderId];

    if (!date) {
      alert("Please select a due date");
      return;
    }

    try {
      await api.post(`/order/${orderId}/set-due/`, {
        due_date: date,
      });

      alert("Due date updated");
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  // ================= SEND NOTIFICATION =================
  const sendNotification = async (orderId) => {
    try {
      await api.post(`/order/${orderId}/notify/`);
      alert("Notification sent to customer");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="orders-container">
     <Backbutton />
      <h2>Shopkeeper - Customer Orders</h2>

      <div className="filters">

        {/* STATUS FILTER */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        {/* START DATE */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        {/* END DATE */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

      </div>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <div className="order-card" key={o.id}>

              <h4>Order #{o.id}</h4>

              <p><b>Customer:</b> {o.customer}</p>
              <p><b>Amount:</b> ₹{o.amount}</p>
              <p><b>Status:</b> {o.status}</p>
              <p><b>Payment:</b> {o.payment_method}</p>
              <p><b>Due Date:</b> <span style={{ color: "#34d399", fontWeight: "bold" }}>{o.due_date ? new Date(o.due_date).toLocaleDateString() : "Not Set"}</span></p>

              {/* SHOW ONLY FOR CREDIT ORDERS */}
              {o.payment_method === "credit" && o.status !== "paid" && (
                <>
                  {/* DUE DATE */}
                  <div className="due-section">

                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={dueDates[o.id] || ""}
                      onChange={(e) =>
                        handleDueDateChange(o.id, e.target.value)
                      }
                    />

                    <button onClick={() => setDueDate(o.id)}>
                      Set Due Date
                    </button>

                  </div>

                  {/* NOTIFICATION */}
                  <button
                    className="notify-btn"
                    onClick={() => sendNotification(o.id)}
                  >
                    Send Reminder
                  </button>
                </>
              )}

              {error && <p className="error-text">{error}</p>}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Order;