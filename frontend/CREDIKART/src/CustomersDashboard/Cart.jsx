import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import Backbutton from "../auth/Backbutton";
import api from "../api/axios";

function Cart() {

  const [cart, setCart] = useState([]);

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [repaymentSchedule, setRepaymentSchedule] =
    useState("");

  const [customDate, setCustomDate] =
    useState("");

  const navigate = useNavigate();

  // ================= LOAD CART =================

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {

    try {

      const res = await api.get("/cart/");

      setCart(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= INCREASE QTY =================

  const increaseQty = async (id) => {

    try {

      await api.patch(`/cart/${id}/`, {
        action: "increase",
      });

      fetchCart();

    } catch (err) {

      console.log(err);

    }
  };

  // ================= DECREASE QTY =================

  const decreaseQty = async (id) => {

    try {

      await api.patch(`/cart/${id}/`, {
        action: "decrease",
      });

      fetchCart();

    } catch (err) {

      console.log(err);

    }
  };

  // ================= REMOVE ITEM =================

  const removeItem = async (id) => {

    try {

      await api.delete(`/cart/remove/${id}/`);

      fetchCart();

    } catch (err) {

      console.log(err);

    }
  };

  // ================= TOTAL =================

  const total = cart.reduce(

    (sum, item) =>

      sum + item.price * item.quantity,

    0
  );

  // ================= DUE DATE =================

  // ================= DUE DATE =================

  const calculateDueDate = (schedule) => {

    const today = new Date();

    if (schedule === "weekly") {

      // 4 weekly installments = 7 days

      today.setDate(today.getDate() + 7);

    }

    else if (schedule === "monthly") {

      today.setDate(today.getDate() + 30);

    }

    return today
      .toISOString()
      .split("T")[0];
  };
  const goToPayment = async () => {

    if (!cart.length) {

      alert("Cart is empty");

      return;
    }

    if (!paymentMethod) {

      alert("Please select payment method");

      return;
    }

    if (

      paymentMethod === "credit" &&

      !repaymentSchedule

    ) {

      alert("Please select repayment schedule");

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

    try {

      let dueDate = null;

      if (paymentMethod === "credit") {

        dueDate =

          repaymentSchedule === "custom"

            ? customDate

            : calculateDueDate(
              repaymentSchedule
            );
      }

      // SAVE CHECKOUT TO BACKEND

      await api.post("/save_checkout/", {

        payment_method: paymentMethod,

        repayment_schedule:

          paymentMethod === "credit"

            ? repaymentSchedule

            : null,

        due_date: dueDate,
      });

      // GO TO PAYMENT PAGE

      navigate("/payment");

    } catch (err) {

      console.log(err);

      alert("Failed to save checkout");

    }
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
                  alt={item.product_name}
                  className="cart-image"
                />

              )}

              <div className="cart-details">

                <h4>{item.product_name}</h4>

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

          <input type="radio" value="ready" checked={paymentMethod === "ready"}
            onChange={(e) => setPaymentMethod(e.target.value)} />

          Ready Payment (Full Payment)

        </label>

        {/* CREDIT */}

        <label>

          <input type="radio" value="credit" checked={paymentMethod === "credit"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />

          Pay Later  / Credit Purchase

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


            <select value={repaymentSchedule}
              onChange={(e) => setRepaymentSchedule(e.target.value)}>
              <option value="">
                Select Schedule
              </option>

              <option value="weekly">
                Weekly Payment
              </option>

              <option value="monthly">
                Monthly Payment
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

                  max={
                    new Date(
                      new Date().setDate(
                        new Date().getDate() + 30
                      )
                    )
                      .toISOString()
                      .split("T")[0]
                  }


                  value={customDate}

                  onChange={(e) =>
                    setCustomDate(e.target.value)} />

              </div>

            )}

            {/* AUTO DUE DATE */}

            {repaymentSchedule === "custom" && (

              <div>

                Due Date:
                {" "}

                <b>

                  {customDate || "Select date"}

                </b>

              </div>

            )}
            {/* WEEKLY PAYMENT DETAILS */}

            {repaymentSchedule === "weekly" && (

              <div>

                <p>

                  Weekly Installment:
                  {" "}

                  <b>

                    ₹{(total / 4).toFixed(2)}

                  </b>

                </p>

                <p>

                  Total Installments:
                  {" "}

                  <b>4 Weeks</b>

                </p>

                <p>

                  First Payment Due:
                  {" "}

                  <b>

                    {calculateDueDate("weekly")}

                  </b>

                </p>

              </div>

            )}

            {/* MONTHLY PAYMENT DETAILS */}

            {repaymentSchedule === "monthly" && (

              <div>

                <p>

                  Payment After:
                  {" "}

                  <b>30 Days</b>

                </p>

                <p>

                  Amount To Pay:
                  {" "}

                  <b>

                    ₹{(total / 4).toFixed(2)}

                  </b>

                </p>
                <p>

                  First Payment Due:
                  {" "}

                  <b>

                    {calculateDueDate("monthly")}

                  </b>

                </p>

              </div>

            )}

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