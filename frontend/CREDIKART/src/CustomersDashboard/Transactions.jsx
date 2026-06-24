import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Transactions.css";
import CustDashboard from "./CustDashboard";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer_transactions/");
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="txn-container">
      <CustDashboard />

      <h2>My Transactions</h2>

      {/* LOADING */}
      {loading && <p className="loading">Loading transactions...</p>}

      {/* EMPTY */}
      {!loading && transactions.length === 0 && (
        <p className="empty">No transactions found</p>
      )}

      {/* LIST */}
      {!loading &&
        transactions.map((t) => (
          <div className="txn-card" key={t.id}>
            <div className="txn-top">
              <h4>{t.transaction_type.toUpperCase()}</h4>
              <span className="amount">₹{t.amount}</span>
            </div>

            <p className="desc">{t.description || "No description"}</p>

            <p className="date">
              {new Date(t.created_at).toLocaleString()}
            </p>
          </div>
        ))}
    </div>
  );
}

export default Transactions;