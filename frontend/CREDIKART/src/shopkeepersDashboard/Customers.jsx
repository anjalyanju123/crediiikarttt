import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ShopDashboard from "./ShopDashboard";
import './Customers.css'

function Customers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // FORM STATE (ADD / EDIT)
  const [form, setForm] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  // ================= FETCH =================
  const fetchUsers = async () => {
    const res = await api.get("/customers/");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= ADD =================
  const addCustomer = async () => {
    await api.post("/add_customer/", {
      username: form.username,
      email: form.email,
      password: form.password,
      role: "customer",
    });

    resetForm();
    fetchUsers();
  };

  // ================= EDIT (LOAD DATA) =================
  const handleEditClick = (user) => {
    setForm({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
    });

    setIsEdit(true);
  };

  // ================= UPDATE =================
  const updateCustomer = async () => {
    await api.put(`/update_customer/${form.id}/`, {
      username: form.username,
      email: form.email,
    });

    resetForm();
    fetchUsers();
  };

  // ================= DELETE =================
  const deleteCustomer = async (id) => {
    if (window.confirm("Delete this customer?")) {
      await api.delete(`/delete_customer/${id}/`);
      fetchUsers();
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({ id: null, username: "", email: "", password: "" });
    setIsEdit(false);
  };

  // ================= FILTER =================
  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shopkeepers-page">
        <ShopDashboard />
      <div className="shopkeepers-container">

        <h1>Customer Management</h1>

        {/* ================= FORM ================= */}
        <div className="add-box">
          <h3>{isEdit ? "Edit Customer" : "Add New Customer"}</h3>

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
          <div>Action</div>
        </div>

        {/* ================= LIST ================= */}
        {filteredUsers.map((u) => (
          <div className="shopkeeper-row" key={u.id}>
            <div>{u.id}</div>
            <div>{u.username}</div>
            <div>{u.email}</div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="approve-btn"
                onClick={() => handleEditClick(u)}
              >
                Edit
              </button>

              <button
                className="reject-btn"
                onClick={() => deleteCustomer(u.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default Customers;