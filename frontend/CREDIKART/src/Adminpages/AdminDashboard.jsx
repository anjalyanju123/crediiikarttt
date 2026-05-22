import React from "react";
import Sidebar from "./Sidebar";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="admin-content">

        <h2 className="page-title">Admin Dashboard</h2>

        {/* CARDS */}
        <section className="card-grid">

          <div className="card green">
            <h4>Total Customers</h4>
            <p>1,245</p>
          </div>

          <div className="card orange">
            <h4>Total Shopkeepers</h4>
            <p>320</p>
          </div>

          <div className="card blue">
            <h4>Total Transactions</h4>
            <p>8,560</p>
          </div>

          <div className="card purple">
            <h4>Pending Approvals</h4>
            <p>12</p>
          </div>

        </section>

        {/* TABLE */}
        <div className="panel">
          <h3>Recent Activity</h3>

          <div className="table">

            <div className="row header">
              <span>User</span>
              <span>Action</span>
              <span>Status</span>
            </div>

            <div className="row">
              <span>John Doe</span>
              <span>Created Account</span>
              <span className="success">Success</span>
            </div>

            <div className="row">
              <span>Shop A</span>
              <span>Credit Request</span>
              <span className="pending">Pending</span>
            </div>

            <div className="row">
              <span>Mary</span>
              <span>Payment</span>
              <span className="success">Success</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}