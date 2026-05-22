import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminCustomers.css";
import Sidebar from "./Sidebar";

function AdminCustomer() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  // ================= FETCH =================
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

  // ================= ADD =================
  const addCustomer = async () => {
    await api.post("/admin_add_customer/", {
      username: form.username,
      email: form.email,
      password: form.password,
    });

    resetForm();
    fetchCustomers();
  };

  // ================= EDIT =================
  const handleEdit = (customer) => {
    setForm({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      password: "",
    });
    setIsEdit(true);
  };

  // ================= UPDATE =================
  const updateCustomer = async () => {
    await api.put(`/admin_update_customer/${form.id}/`, {
      username: form.username,
      email: form.email,
    });

    resetForm();
    fetchCustomers();
  };

  // ================= DELETE =================
  const deleteCustomer = async (id) => {
    if (window.confirm("Delete this customer?")) {
      await api.delete(`/admin_customers_delete/${id}/`);
      fetchCustomers();
    }
  };

  // ================= TOGGLE STATUS =================
  const toggleCustomer = async (id) => {
    await api.patch(`/admin_customersview/toggle/${id}/`);
    fetchCustomers();
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({ id: null, username: "", email: "", password: "" });
    setIsEdit(false);
  };

  // ================= SEARCH =================
  const filtered = customers.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shopkeepers-page">
        <Sidebar />
      <div className="shopkeepers-container">

        <h1>Admin Customer Management</h1>

        {/* ================= FORM ================= */}
        <div className="add-box">
          <h3>{isEdit ? "Edit Customer" : "Add Customer"}</h3>

          <div className="add-form">
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {!isEdit && (
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            )}

            {isEdit ? (
              <button className="approve-btn" onClick={updateCustomer}>
                Update
              </button>
            ) : (
              <button className="approve-btn" onClick={addCustomer}>
                Add
              </button>
            )}

            {isEdit && (
              <button className="reject-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="filters">
          <input
            className="search-bar"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= HEADER ================= */}
        <div className="shopkeepers-header">
          <div>ID</div>
          <div>Username</div>
          <div>Email</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* ================= LIST ================= */}
        {filtered.map((c) => (
          <div className="shopkeeper-row" key={c.id}>
            <div>{c.id}</div>
            <div>{c.username}</div>
            <div>{c.email}</div>

            <div>
              {c.is_active ? (
                <span className="status-approved">Active</span>
              ) : (
                <span className="status-rejected">Blocked</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="approve-btn"
                onClick={() => handleEdit(c)}
              >
                Edit
              </button>

              <button
                className="reject-btn"
                onClick={() => deleteCustomer(c.id)}
              >
                Delete
              </button>

              <button
                className="approve-btn"
                onClick={() => toggleCustomer(c.id)}
              >
                Toggle
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default AdminCustomer;