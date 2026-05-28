import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./ListProducts.css";
import Backbutton from "../auth/Backbutton";
import { useNavigate } from "react-router-dom";

function ListProducts() {
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [inStock, setInStock] = useState(false);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category, maxPrice, inStock]);

    const addToCart = async (productId) => {

        try {

            await api.post(`/add_to_cart/${productId}/`);

            alert("Added to cart");

        } catch (err) {

            console.log(err);

        }
    };

    return (
        <div className="container">
            <Backbutton />

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
                        type="number"
                        placeholder="Price Below"
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

                            <div className="product-buttons">

                                <button onClick={() => addToCart(p.id)}>
                                    Add to Cart
                                </button>

                                <button
                                    className="view-cart-btn"
                                    onClick={() => navigate("/cart")}
                                >
                                    View Cart
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ListProducts;