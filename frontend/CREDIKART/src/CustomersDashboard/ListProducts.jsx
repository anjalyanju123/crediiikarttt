import React, { useEffect, useState } from "react";
import api from "../api/axios";
import CustDashboard from "./CustDashboard";
import "./ListProducts.css";

function ListProducts() {
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [inStock, setInStock] = useState(false);

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await api.get("/AllProducts/", {
                params: {
                    search,
                    category,
                    max_price: maxPrice,
                    in_stock: inStock,
                },
            });
            setProducts(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category, maxPrice, inStock]);

    // Add to cart (localStorage)
    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Added to cart");
    };

    return (
        <div className="container">
            <CustDashboard />

            <div className="main-content">
                <h2>Products</h2>

                <div className="filters">
                    <input
                        className="search-bar"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Min Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>

                <div className="grid">
                    {products.map((p) => (
                        <div className="card" key={p.id}>
                            {p.product_image && (

                                <img
                                    src={`http://127.0.0.1:8000${p.product_image}`}
                                    alt={p.name}
                                    className="product-image"
                                />

                            )}

                            <h4>{p.name}</h4>
                            <h4 className="price">₹{p.price}</h4>
                            <h4 className="desc">{p.description}</h4>
                            <h4 className={p.is_available ? "status-approved" : "status-rejected"}>
                                {p.is_available ? "In Stock" : "Out of Stock"}
                            </h4>

                            <button onClick={() => addToCart(p)}>
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ListProducts;