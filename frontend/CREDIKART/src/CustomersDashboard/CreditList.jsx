import React, { useEffect, useState } from "react";
import api from "../api/axios";
import './Creditlist.css'
import CustDashboard from "./CustDashboard";

function CreditList() {
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    const res = await api.get("/credit_list/");
    setCredits(res.data);
  };

  return (
    <div className="credit-container">
         <CustDashboard />
      <h2>My Credit List</h2>

      {credits.length === 0 ? (
        <p>No credit orders found</p>
      ) : (
        credits.map((c) => (
          <div className="credit-card" key={c.id}>
            <h4>Order #{c.id}</h4>
            <p>Amount: ₹{c.total_amount}</p>
            <p>Status: {c.status}</p>
            <p>Date: {new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default CreditList;