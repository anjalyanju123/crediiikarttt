import React, { useState } from "react";
import api from "../api/axios";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

function CustomerRegister() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }
    if (!formData.email.includes("@")) {
  setMessage("Invalid email format");
  return;
    }

    if (formData.phone.length !== 10) {
    setMessage("Phone number must be 10 digits");
    return;
    }

    if (formData.password.length < 8) {
    setMessage("Password must be at least 8 characters");
    return;
    }
    try {
      const res = await api.post("/customer_register/", formData);
      console.log(res.data);

      setFormData({
        username: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirm_password: "",
      });
      navigate('/')
      setMessage("Customer registered successfully!");
    } catch (error) {
      setMessage("Registration failed");
      console.log(error);
    }
  };

  return (
    <div className="customer-container">
      <div className="customer-card">
        <h2>Customer Registration</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
        </form>

        {message && <p className="message">{message}</p>}
         <p> Already have an account?
          <Link to="/"> Login </Link></p>
      </div>
    </div>
  );
}

export default CustomerRegister;