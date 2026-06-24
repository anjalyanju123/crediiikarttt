import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ShopDashboard from "./ShopDashboard";
import "./ShopkeeperAnalytics.css";

function ShopkeeperAnalytics() {

  const [analytics, setAnalytics] = useState({
    total_credit: 0,
    total_paid: 0,
    weekly_credit: 0,
    weekly_paid: 0,
    monthly_credit: 0,
    monthly_paid: 0,
  });

  // ================= FETCH ANALYTICS =================
  const fetchAnalytics = async () => {
    try {

      const res = await api.get("/shopkeeper_analytics/");
      setAnalytics(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-page">

      <ShopDashboard />

      <div className="analytics-container">

        <h2>Analytics Dashboard</h2>

        <div className="analytics-grid">

          {/* TOTAL CREDIT */}
          <div className="analytics-card credit-card">
            <h3>Total Credit Issued</h3>
            <h1>₹{analytics.total_credit}</h1>
          </div>

          {/* TOTAL PAID */}
          <div className="analytics-card paid-card">
            <h3>Total Amount Collected</h3>
            <h1>₹{analytics.total_paid}</h1>
          </div>

          {/* WEEKLY CREDIT */}
          <div className="analytics-card weekly-credit-card">
            <h3>Weekly Credit</h3>
            <h1>₹{analytics.weekly_credit}</h1>
          </div>

          {/* WEEKLY PAID */}
          <div className="analytics-card weekly-paid-card">
            <h3>Weekly Collection</h3>
            <h1>₹{analytics.weekly_paid}</h1>
          </div>

          {/* MONTHLY CREDIT */}
          <div className="analytics-card monthly-credit-card">
            <h3>Monthly Credit</h3>
            <h1>₹{analytics.monthly_credit}</h1>
          </div>

          {/* MONTHLY PAID */}
          <div className="analytics-card monthly-paid-card">
            <h3>Monthly Collection</h3>
            <h1>₹{analytics.monthly_paid}</h1>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ShopkeeperAnalytics;

