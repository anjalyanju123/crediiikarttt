import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

 const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (value && value.length < 3) {
          error = "Username must be at least 3 characters";
        }
        break;

      case "password":
        if (value && value.length < 6) {
          error = "Password too short";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // -----------------------
  // HANDLE CHANGE (LIVE)
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // instant validation
    const errorMsg = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  // -------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      localStorage.clear();
      const res = await api.post("/login/", formData);

      console.log("LOGIN RESPONSE:", res.data);

      // SAVE NEW TOKENS
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log(res.data);


      console.log(res.data.user);
      console.log(res.data.user.role);

      setMessage("Login successful!");
      const role = res.data.user.role;

      setTimeout(() => {

        if (role === "admin") {
          navigate("/admin-dashboard");
        }

        else if (role === "customer") {
          navigate("/customer-dashboard");
        }

        else if (role === "shopkeeper") {
          if (res.data.user.is_approved) {
            navigate("/shopkeeper-dashboard");
          } else {
            setMessage("Waiting for admin approval");
            localStorage.clear();
          }
        }
      }, 1000);

    } catch (error) {
      setMessage(
        error.response?.status === 403
          ? "Waiting for admin approval"
          : error.response?.data?.error || "Invalid username or password"
      );
      localStorage.clear();
    }
  };
  return (
    <div className="login-container">
      <div className="login_header">
        <Link style={{ color: 'white', textDecoration: 'none' }} to={'/shopkeepers-register'}>Shopkeepers Register</Link>
        <Link style={{ color: 'white', textDecoration: 'none' }} to={'/customer-register'}>Customers Register</Link>
      </div>
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          {errors.username && (
            <small className="error">{errors.username}</small>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <small className="error">{errors.password}</small>
          )}

          <button type="submit">Login</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="register-link"> Don't have an account?
          <Link to="/customer-register"> Register</Link></p>
      </div>
    </div>
  );
}

export default Login;