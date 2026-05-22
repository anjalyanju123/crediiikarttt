import React, { useEffect, useState } from "react";
import api from "../api/axios";
import './CreditList.css';
import CustDashboard from "./CustDashboard";

function CreditHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await api.get("/credit_history/");
    setHistory(res.data);
  };

  return (
    <div className="credit-container">
        <CustDashboard />
      <h2>Credit History</h2>

      {history.map((order) => (
        <div className="credit-card" key={order.order_id}>
          <h3>Order #{order.order_id}</h3>
          <p>Total: ₹{order.total_amount}</p>
          <p>Status: {order.status}</p>

          <h4>Items:</h4>
          {order.items.map((item, index) => (
            <div key={index}>
              <p>
                {item.product} - {item.quantity} × ₹{item.price}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default CreditHistory;