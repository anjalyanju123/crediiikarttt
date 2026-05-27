import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Customers.css";
import Backbutton from "../auth/Backbutton";

function Customers() {

  const [customers, setCustomers] = useState([]);

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers/");
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

      <Backbutton />

      <div className="shopkeepers-container">

        <h1>My Customers</h1>

        {/* TOTAL CUSTOMERS */}
        <div className="customer-count-card">
          <h2>Total Customers</h2>
          <p>{customers.length}</p>
        </div>

        {/* TABLE */}
        <div className="customer-table">

          {/* HEADER */}
          <div className="customer-header">
            <div>ID</div>
            <div>Username</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Status</div>
          </div>

          {/* ROWS */}
          {customers.length > 0 ? (
            customers.map((customer) => (
              <div
                className="customer-row"
                key={customer.id}
              >
                <div>{customer.id}</div>

                <div>
                  {customer.username}
                </div>

                <div>
                  {customer.email}
                </div>

                <div>
                  {customer.phone || "N/A"}
                </div>

                <div>
                  {customer.is_active ? (
                    <span className="status-approved">
                      Active
                    </span>
                  ) : (
                    <span className="status-rejected">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-customers">
              No customers found
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Customers;