import React, { useEffect, useState } from "react";
import api from "../api/axios";
import './Revenue.css'
import Sidebar from "./Sidebar";

export default function RevenueAnalytics() {

  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {

    try {

      const response = await api.get("/admin_revenue/");

      setRevenueData(response.data);

    } catch (error) {

      console.error("Error fetching revenue analytics:", error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h2>Loading Revenue Analytics...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">
         <Sidebar />

      <h1>Revenue Analytics</h1>

      <div className="card-grid">

        <div className="card">
          <h3>Total Revenue</h3>
          <p>₹{revenueData.totalRevenue}</p>
        </div>

        <div className="card">
          <h3>Monthly Revenue</h3>
          <p>₹{revenueData.monthlyRevenue}</p>
        </div>

        <div className="card">
          <h3>Revenue Growth</h3>
          <p>{revenueData.revenueGrowth}%</p>
        </div>

      </div>

      <div className="chart-box">
        <h2>Revenue Trends</h2>
        <p>Revenue data loaded from backend API.</p>
      </div>

    </div>
  );
}