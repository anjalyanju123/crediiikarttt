import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminCustomers.css";
import Sidebar from "./Sidebar";

function AdminCustomer() {
  const [customers, setCustomers] = useState([]);

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin_customersview/");
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="shopkeepers-page">
      <Sidebar />

      <div className="shopkeepers-container">

        <h1>Customer Analytics</h1>

        {/* TOTAL CUSTOMERS CARD */}
        <div className="customer-count-card">
          <h2>Total Customers</h2>
          <p>{customers.length}</p>
        </div>

        {/* CUSTOMER DETAILS TABLE */}
        {/* CUSTOMER DETAILS TABLE */}
        <div className="customer-table">

          <div className="customer-header">
            <div>ID</div>
            <div>Username</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Status</div>
          </div>

          {customers.map((customer) => (
            <div className="customer-row" key={customer.id}>
              <div>{customer.id}</div>
              <div>{customer.username}</div>
              <div>{customer.email}</div>
              <div>{customer.phone || "N/A"}</div>

              <div>
                {customer.is_active ? (
                  <span className="status-approved">Active</span>
                ) : (
                  <span className="status-rejected">Blocked</span>
                )}
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default AdminCustomer;