import React, { useState } from "react";
import api from "../api/axios";
import "./ShopkeeperRegister.css";
import { Link, useNavigate } from "react-router-dom";

function ShopkeeperRegister() {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    shop_name: "",
    shop_type: "",
    gst_number: "",
    shop_license_number: "",
    password: "",
    confirm_password: "",
    gst_document: null,
    license_document: null,
    shop_image: null,
  });

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
          error = "Invalid phone number";
        }
        break;

      case "gst_number":
        if (
          value &&
          !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)
        ) {
          error = "Invalid GST format (e.g. 32AAAAA0000A1Z5)";
        }
        break;

      case "shop_license_number":
        if (value && !/^[A-Z0-9\-\/]{6,20}$/.test(value)) {
          error = "Invalid license format";
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

      default:
        break;
    }

    return error;
  };

  // -----------------------
  // HANDLE CHANGE
  // -----------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    let newValue = files ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (!files) {
      const errorMsg = validateField(name, value);

      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));

      // fix password match live
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
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      await api.post("/shopkeeper_register/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Shopkeeper registered successfully!");

      setFormData({
        username: "",
        email: "",
        phone: "",
        address: "",
        shop_name: "",
        shop_type: "",
        gst_number: "",
        shop_license_number: "",
        password: "",
        confirm_password: "",
        gst_document: null,
        license_document: null,
        shop_image: null,
      });

      setTimeout(() => navigate("/"), 1500);
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
    <div className="register-container">
      <div className="register-card">
        <h2>Shopkeeper Registration</h2>

        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
          {errors.username && <small className="error">{errors.username}</small>}

          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          {errors.email && <small className="error">{errors.email}</small>}

          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <small className="error">{errors.phone}</small>}

          <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          {errors.address && <small className="error">{errors.address}</small>}

          <input name="shop_name" placeholder="Shop Name" value={formData.shop_name} onChange={handleChange} />
          {errors.shop_name && <small className="error">{errors.shop_name}</small>}

          <select name="shop_type" value={formData.shop_type} onChange={handleChange}>
            <option value="">Select Shop Type</option>
            <option value="Grocery">Grocery</option>
            <option value="Bakery">Bakery</option>
            <option value="Electronics">Electronics</option>
            <option value="Medical Store">Medical Store</option>
            <option value="Textile">Textile</option>
            <option value="Footwear">Footwear</option>
            <option value="Jewellery">Jewellery</option>
            <option value="Furniture">Furniture</option>
            <option value="Stationery">Stationery</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Supermarket">Supermarket</option>
            <option value="Mobile Shop">Mobile Shop</option>
            <option value="Hardware">Hardware</option>
            <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
          </select>
          {errors.shop_type && <small className="error">{errors.shop_type}</small>}

          <input name="gst_number" placeholder="GST Number" value={formData.gst_number} onChange={handleChange} />
          {errors.gst_number && <small className="error">{errors.gst_number}</small>}

          <input name="shop_license_number" placeholder="License Number" value={formData.shop_license_number} onChange={handleChange} />
          {errors.shop_license_number && (
            <small className="error">{errors.shop_license_number}</small>
          )}

          <label>Upload GST Document</label>
          <input type="file" name="gst_document" onChange={handleChange} />

          <label>Upload License Document</label>
          <input type="file" name="license_document" onChange={handleChange} />

          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          {errors.password && <small className="error">{errors.password}</small>}

          <input type="password" name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} />
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

export default ShopkeeperRegister;