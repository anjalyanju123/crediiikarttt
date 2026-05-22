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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login/", formData);

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      setMessage("Login successful!");
      console.log(res.data);


      const role = res.data.user.role;

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
    }
    }

    } catch (error) {
  setMessage(
    error.response?.status === 403
      ? "Waiting for admin approval"
      : error.response?.data?.error || "Invalid username or password"
  );
}
  };
  return (
    <div className="login-container">
      <div className="login_header">
        <Link style={{color:'white',textDecoration:'none'}} to={'/shopkeepers-register'}>Shopkeepers Register</Link>
        <Link style={{color:'white',textDecoration:'none'}} to={'/customer-register'}>Customers Register</Link>
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

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

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