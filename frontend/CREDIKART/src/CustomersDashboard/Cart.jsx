import React, { useEffect, useState } from "react";
import "./Cart.css";
import CustDashboard from "./CustDashboard";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("ready");

  const navigate = useNavigate();

  // ================= LOAD CART =================
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(stored);
    } catch (err) {
      setCart([]);
    }
  }, []);

  // ================= SAVE CART =================
  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // ================= INCREASE QTY =================
  const increaseQty = (id) => {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    saveCart(updated);
  };

  // ================= DECREASE QTY =================
  const decreaseQty = (id) => {
    const updated = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  // ================= REMOVE ITEM =================
  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  // ================= TOTAL =================
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ================= CHECKOUT =================
  const goToPayment = () => {
    if (!cart.length) {
      alert("Cart is empty");
      return;
    }

    localStorage.setItem(
      "checkout",
      JSON.stringify({
        cart,
        paymentMethod,
        total,
      })
    );

    navigate("/payment");
  };

  return (
    <div className="cart-container">
      <CustDashboard />

      <h2>My Cart</h2>

      {/* CART ITEMS */}
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        cart.map((item) => (
          <div className="cart-card" key={item.id}>
            <h4>{item.name}</h4>
            <p>₹{item.price}</p>

            <div className="qty-controls">
              <button onClick={() => decreaseQty(item.id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increaseQty(item.id)}>+</button>
            </div>

            <button
              className="remove-btn"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </div>
        ))
      )}

      {/* TOTAL */}
      <h3 className="total">Total: ₹{total}</h3>

      {/* PAYMENT METHOD */}
      <div className="payment-box">
        <h3>Choose Payment Method</h3>

        <label>
          <input
            type="radio"
            value="ready"
            checked={paymentMethod === "ready"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Ready Payment (Full Payment)
        </label>

        <label>
          <input
            type="radio"
            value="credit"
            checked={paymentMethod === "credit"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Pay Later / Credit Purchase
        </label>
      </div>

      {/* CHECKOUT */}
      <button className="checkout-btn" onClick={goToPayment}>
        Proceed to Payment
      </button>
    </div>
  );
}

export default Cart;