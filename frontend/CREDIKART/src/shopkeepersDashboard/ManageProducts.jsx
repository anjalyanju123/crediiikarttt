import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Dashboard from "./ShopDashboard";
import "./ManageProducts.css";

function ManageProducts() {

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    product_image: null,
    is_available: true,
  });

  const [editingId, setEditingId] = useState(null);

  // FETCH PRODUCTS
  const fetchProducts = async () => {

    try {

      const res = await api.get("/products/");

      setProducts(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    fetchProducts();

  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    const { name, value, files, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "file"
          ? files[0]
          : type === "checkbox"
          ? checked
          : value,
    });
  };

  // ADD / UPDATE PRODUCT
  const handleSubmit = async (e) => {

    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("description", formData.description);
    data.append("is_available", formData.is_available);

    if (formData.product_image) {
      data.append("product_image", formData.product_image);
    }

    try {

      if (editingId) {

        await api.put(
          `/products/${editingId}/`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("Product Updated");

      } else {

        await api.post(
          "/products/",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("Product Added");
      }

      // RESET FORM
      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        product_image: null,
        is_available: true,
      });

      setEditingId(null);

      fetchProducts();

    } catch (err) {

      console.log(err.response?.data);

    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {

    setEditingId(product.id);

    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description,
      product_image: null,
      is_available: product.is_available,
    });
  };

  // DELETE PRODUCT
  const handleDelete = async (id) => {

    if (window.confirm("Delete this product?")) {

      try {

        await api.delete(`/products/${id}/`);

        fetchProducts();

      } catch (err) {

        console.log(err);

      }
    }
  };

  return (

    <div className="products-page">

      <Dashboard />

      <div className="products-container">

        <h1>Product Management</h1>

        {/* FORM */}

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* CATEGORY */}

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Category
            </option>

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
            <option value="Beauty & Cosmetics">
              Beauty & Cosmetics
            </option>

          </select>

          {/* PRICE */}

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          {/* STOCK */}

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          {/* DESCRIPTION */}

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          {/* IMAGE */}

          <input
            type="file"
            name="product_image"
            onChange={handleChange}
          />

          {/* AVAILABLE */}

          <label>

            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
            />

            Available

          </label>

          {/* BUTTON */}

          <button type="submit">

            {editingId
              ? "Update Product"
              : "Add Product"}

          </button>

        </form>

        {/* PRODUCT LIST */}

        <div className="products-grid">

          {products.map((product) => (

            <div
              className="product-card"
              key={product.id}
            >

              {/* IMAGE */}

              {product.product_image && (

                <img
                  src={`http://127.0.0.1:8000${product.product_image}`}
                  alt={product.name}
                  className="product-image"
                />

              )}

              <h2>{product.name}</h2>

              <p>
                <strong>Category:</strong>
                {" "}
                {product.category}
              </p>

              <p>
                <strong>Price:</strong>
                {" "}
                ₹{product.price}
              </p>

              <p>
                <strong>Stock:</strong>
                {" "}
                {product.stock}
              </p>

              <p>
                <strong>Status:</strong>
                {" "}
                {product.is_available
                  ? "Available"
                  : "Out of Stock"}
              </p>

              <p>{product.description}</p>

              {/* ACTIONS */}

              <div className="product-actions">

                <button
                  className="edit-btn"
                  onClick={() =>
                    handleEdit(product)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(product.id)
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default ManageProducts;