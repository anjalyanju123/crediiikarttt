import React, { useState } from "react";
import api from "../api/axios";
import "./CustomerRegister.css";
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

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // -----------------------
  // LIVE VALIDATION
  // -----------------------
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (value && !value.includes("@")) {
          error = "Invalid email format";
        }
        break;

      case "phone":
        if (value && !/^[6-9]\d{9}$/.test(value)) {
          error = "Enter valid 10-digit Indian number";
        }
        break;

      case "password":
        if (value && value.length < 8) {
          error = "Minimum 8 characters required";
        }
        break;

      case "confirm_password":
        if (value && value !== formData.password) {
          error = "Passwords do not match";
        }
        break;

      case "username":
        if (value && value.length < 3) {
          error = "Username must be at least 3 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // -----------------------
  // HANDLE CHANGE
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // live field validation
    const errorMsg = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));

    // live password match fix
    if (name === "password" || name === "confirm_password") {
      const password = name === "password" ? value : formData.password;
      const confirm =
        name === "confirm_password" ? value : formData.confirm_password;

      setErrors((prev) => ({
        ...prev,
        confirm_password:
          confirm && password !== confirm ? "Passwords do not match" : "",
      }));
    }
  };

  // -----------------------
  // SUBMIT
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrors({});

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

      setMessage("Customer registered successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.log(error);

      if (error.response?.data) {
        setErrors(error.response.data);
        setMessage("Please fix the errors");
      } else {
        setMessage("Registration failed");
      }
    }
  };

  return (
    <div className="customer-container">
      <div className="customer-card">
        <h2>Customer Registration</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <small className="error">{errors.username}</small>}

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <small className="error">{errors.email}</small>}

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <small className="error">{errors.phone}</small>}

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          {errors.address && <small className="error">{errors.address}</small>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <small className="error">{errors.password}</small>}

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
          {errors.confirm_password && (
            <small className="error">{errors.confirm_password}</small>
          )}

          <button type="submit">Register</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="cusregister_last_p">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default CustomerRegister;