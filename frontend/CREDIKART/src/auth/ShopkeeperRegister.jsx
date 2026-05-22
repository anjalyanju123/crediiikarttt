import React, { useState } from "react";
import api from "../api/axios";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";

function ShopkeeperRegister() {

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

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (files) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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

      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      const res = await api.post(
        "/shopkeeper_register/",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Shopkeeper registered successfully!");

      console.log(res.data);

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
      navigate('/')

    } catch (error) {

      setMessage("Registration failed");

      console.log(error);
    }
  };

  return (
    <div className="register-container">

      <div className="register-card">

        <h2>Shopkeeper Registration</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
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
          />

          <input
            name="shop_name"
            placeholder="Shop Name"
            value={formData.shop_name}
            onChange={handleChange}
            required
          />

          {/* Shop Type Select */}

          <select
            name="shop_type"
            value={formData.shop_type}
            onChange={handleChange}
            required
          >
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

          <input
            name="gst_number"
            placeholder="GST Number"
            value={formData.gst_number}
            onChange={handleChange}
            required
          />

          <input
            name="shop_license_number"
            placeholder="License Number"
            value={formData.shop_license_number}
            onChange={handleChange}
            required
          />

          {/* File Uploads */}

          <label>Upload GST Document</label>

          <input
            type="file"
            name="gst_document"
            accept=".pdf,.jpg,.png,.jpeg"
            onChange={handleChange}
            required
          />

          <label>Upload License Document</label>

          <input
            type="file"
            name="license_document"
            accept=".pdf,.jpg,.png,.jpeg"
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

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Register
          </button>

        </form>

        {message && (
          <p className="message">{message}</p>
        )}
           <p> Already have an account?
          <Link to="/"> Login </Link></p>

      </div>

    </div>
  );
}

export default ShopkeeperRegister;