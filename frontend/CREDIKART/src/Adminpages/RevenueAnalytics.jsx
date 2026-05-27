import './Revenue.css'
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Backbutton from '../auth/Backbutton';

function RevenueAnalytics() {
  const [revenue, setRevenue] = useState({
    total_credit_given: 0,
    total_repayment_received: 0,
    outstanding_balance: 0,
    commission_revenue: 0,
    penalty_revenue: 0,
    total_admin_revenue: 0,
  });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const response = await api.get("/admin_revenue_dashboard/");
      setRevenue(response.data);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  return (
    <div className="admin-revenue-container">
      <Backbutton />

      <h2 className="title">Admin Revenue Dashboard</h2>

      <div className="revenue-grid">

        <div className="revenue-card">
          <h3>Total Credit</h3>
          <p>₹ {revenue.total_credit_given}</p>
        </div>

        <div className="revenue-card">
          <h3>Total Repayment</h3>
          <p>₹ {revenue.total_repayment_received}</p>
        </div>

        <div className="revenue-card">
          <h3>Outstanding Balance</h3>
          <p>₹ {revenue.outstanding_balance}</p>
        </div>

        <div className="revenue-card">
          <h3>Commission Revenue</h3>
          <p>₹ {revenue.commission_revenue}</p>
        </div>

        <div className="revenue-card">
          <h3>Penalty Revenue</h3>
          <p>₹ {revenue.penalty_revenue}</p>
        </div>

        <div className="revenue-card total">
          <h3>Total Admin Revenue</h3>
          <p>₹ {revenue.total_admin_revenue}</p>
        </div>

      </div>
    </div>
  );
}

export default RevenueAnalytics;