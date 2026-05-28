import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Transactions.css";
import Backbutton from "../auth/Backbutton";
import { Link } from "react-router-dom";

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
      console.log(res.data)

    } catch (err) {
      console.log(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="txn-container">
      <Backbutton />

      <Link to={"/list-products"}>
        <button className="transactions_shopbtn">Shop More</button>
      </Link>

      <h2>My Transactions</h2>

      {loading && <p>Loading transactions...</p>}

      {!loading && transactions.length === 0 && (
        <p>No transactions found</p>
      )}

      {transactions.map((t) => (
        <div className="txn-card" key={t.id}>

          <div className="txn-top">
            <h4>{t.transaction_type.toUpperCase()}</h4>

            <span className="amount">
              ₹{t.amount}
            </span>
          </div>

          <div className="txn-body">

            <p>
              <b>Status:</b>{" "} {t.order_status}
            </p>

            <p>
              <b>Type:</b> {t.transaction_type}
            </p>

            <p className="desc">
              {t.description || "No description"}
            </p>

            <p className="date">
              {new Date(t.created_at).toLocaleString()}
            </p>

          </div>

        </div>
      ))}
    </div>
  );
}

export default Transactions;