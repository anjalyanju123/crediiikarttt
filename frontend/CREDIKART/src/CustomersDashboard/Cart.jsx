import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import Backbutton from "../auth/Backbutton";

function Cart() {

  const [cart, setCart] = useState([]);

  const [paymentMethod, setPaymentMethod] =
    useState("ready");

  const [repaymentSchedule, setRepaymentSchedule] =
    useState("weekly");

  const [customDate, setCustomDate] =
    useState("");

  const navigate = useNavigate();

  // ================= LOAD CART =================

  useEffect(() => {

    try {

      const stored =
        JSON.parse(localStorage.getItem("cart")) || [];

      setCart(stored);

    } catch (err) {

      setCart([]);

    }

  }, []);

  // ================= SAVE CART =================

  const saveCart = (updated) => {

    setCart(updated);

    localStorage.setItem(
      "cart",
      JSON.stringify(updated)
    );
  };

  // ================= INCREASE QTY =================

  const increaseQty = (id) => {

    const updated = cart.map((item) =>

      item.id === id

        ? {
          ...item,
          quantity: item.quantity + 1
        }

        : item
    );

    saveCart(updated);
  };

  // ================= DECREASE QTY =================

  const decreaseQty = (id) => {

    const updated = cart
      .map((item) =>

        item.id === id

          ? {
            ...item,
            quantity: Math.max(
              item.quantity - 1,
              1
            )
          }

          : item
      )

      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  // ================= REMOVE ITEM =================

  const removeItem = (id) => {

    const updated = cart.filter(
      (item) => item.id !== id
    );

    saveCart(updated);
  };

  // ================= TOTAL =================

  const total = cart.reduce(

    (sum, item) =>

      sum + item.price * item.quantity,

    0
  );

  // ================= DUE DATE =================

  const calculateDueDate = (schedule) => {

    const today = new Date();

    if (schedule === "weekly") {

      today.setDate(today.getDate() + 7);

    }

    else if (schedule === "2_weeks") {

      today.setDate(today.getDate() + 14);

    }

    else if (schedule === "3_weeks") {

      today.setDate(today.getDate() + 21);

    }

    else if (schedule === "monthly") {

      today.setDate(today.getDate() + 30);

    }

    return today
      .toISOString()
      .split("T")[0];
  };

  // ================= CHECKOUT =================

  const goToPayment = () => {

    if (!cart.length) {

      alert("Cart is empty");

      return;
    }

    if (

      paymentMethod === "credit" &&

      repaymentSchedule === "custom" &&

      !customDate

    ) {

      alert("Please select custom due date");

      return;
    }

    localStorage.setItem(

      "checkout",

      JSON.stringify({

        cart,

        paymentMethod,

        total,

        repaymentSchedule,

        customDate,

      })
    );

    navigate("/payment");
  };

  return (

    <div className="cart-container">

      <Backbutton />

      <h2>My Cart</h2>

      {/* CART ITEMS */}

      {cart.length === 0 ? (

        <p className="empty-cart">
          Your cart is empty
        </p>

      ) : (

        cart.map((item) => (

          <div className="cart-card" key={item.id}>

            {/* LEFT BOX */}

            <div className="cart-left">

              {item.product_image && (

                <img
                  src={`http://127.0.0.1:8000${item.product_image}`}
                  alt={item.name}
                  className="cart-image"
                />

              )}

              <div className="cart-details">

                <h4>{item.name}</h4>

                <p>Price: ₹{item.price}</p>

                <p>
                  Shopkeeper: {item.shopkeeper}
                </p>

              </div>

            </div>

            {/* RIGHT BOX */}

            <div className="cart-right">

              <div className="qty-controls">

                <button
                  onClick={() => decreaseQty(item.id)}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => increaseQty(item.id)}
                >
                  +
                </button>

              </div>

              <p className="subtotal">

                Subtotal:
                ₹{item.price * item.quantity}

              </p>

              <button
                className="remove-btn"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </button>

            </div>

          </div>
        ))
      )}

      {/* TOTAL */}

      <h3 className="total">

        Total:
        {" "}
        ₹{total}

      </h3>

      {/* PAYMENT */}

      <div className="payment-box">

        <h3>
          Choose Payment Method
        </h3>

        {/* READY */}

        <label>

          <input
            type="radio"
            value="ready"
            checked={
              paymentMethod === "ready"
            }
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
          />

          Ready Payment
          {" "}
          (Full Payment)

        </label>

        {/* CREDIT */}

        <label>

          <input
            type="radio"
            value="credit"
            checked={
              paymentMethod === "credit"
            }
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
          />

          Pay Later
          {" "}
          / Credit Purchase

        </label>

        {/* REPAYMENT */}

        {paymentMethod === "credit" && (

          <div
            className="repayment-schedule-box"
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >

            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#e2e8f0"
              }}
            >
              Repayment Schedule:
            </span>

            <select

              value={repaymentSchedule}

              onChange={(e) =>
                setRepaymentSchedule(
                  e.target.value
                )
              }

              style={{

                padding: "8px 12px",

                borderRadius: "6px",

                backgroundColor: "#1e293b",

                color: "#f8fafc",

                border:
                  "1px solid #475569",

                outline: "none",

                cursor: "pointer",

                width: "100%",

                maxWidth: "320px"
              }}
            >

              <option value="weekly">
                First Week
                {" "}
                (7 Days)
              </option>

              <option value="2_weeks">
                Second Week
                {" "}
                (14 Days)
              </option>

              <option value="3_weeks">
                Third Week
                {" "}
                (21 Days)
              </option>

              <option value="monthly">
                Monthly
                {" "}
                (30 Days)
              </option>

              <option value="custom">
                Custom Due Date
              </option>

            </select>

            {/* CUSTOM DATE */}

            {repaymentSchedule === "custom" && (

              <div>

                <label>
                  Select Due Date
                </label>

                <input
                  type="date"
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  value={customDate}
                  onChange={(e) =>
                    setCustomDate(
                      e.target.value
                    )
                  }
                  style={{
                    padding: "8px",
                    marginTop: "5px",
                    borderRadius: "6px",
                    width: "100%"
                  }}
                />

              </div>

            )}

            {/* AUTO DUE DATE */}

            <div
              style={{
                color: "#cbd5e1",
                fontSize: "14px"
              }}
            >

              Due Date:
              {" "}

              <b
                style={{
                  color: "#34d399"
                }}
              >

                {repaymentSchedule === "custom"

                  ? customDate || "Select date"

                  : calculateDueDate(
                    repaymentSchedule
                  )}

              </b>

            </div>

          </div>

        )}

      </div>

      {/* CHECKOUT */}

      <button
        className="checkout-btn"
        onClick={goToPayment}
      >
        Proceed to Payment
      </button>

    </div>
  );
}

export default Cart;