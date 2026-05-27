import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Backbutton from "../auth/Backbutton";
import './CreditList.css'

function CreditList() {

  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const access = localStorage.getItem("accessToken");

  // ================= FETCH CREDITS =================
  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {

    try {

      setLoading(true);

      const res = await api.get("/credit_list/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      console.log("CREDIT DATA:", res.data);

      setCredits(res.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div>

      <Backbutton />

      <div className="credit-page">

        <h2>Credit List for {user?.username}</h2>

        {loading ? (

          <p>Loading credits...</p>

        ) : credits.length === 0 ? (

          <p>No credit orders found</p>

        ) : (

          credits.map((c) => (

            <div
              className="credit-card"
              key={c.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                background: "#fff",
              }}
            >

              <h3>Order #{c.id}</h3>

              <p>
                <strong>Total Amount:</strong> ₹{c.total_amount}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                {c.payment_method}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      c.status === "overdue"
                        ? "red"
                        : c.status === "credit"
                        ? "orange"
                        : "green",

                    fontWeight: "bold",
                  }}
                >
                  {c.status}
                </span>
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {c.due_date
                  ? new Date(c.due_date).toLocaleDateString()
                  : "No due date"}
              </p>

              <p>
                <strong>Created At:</strong>{" "}
                {new Date(c.created_at).toLocaleDateString()}
              </p>

              {/* REPAYMENT BUTTON */}
              {(c.status === "credit" ||
                c.status === "overdue") && (

                <button
                  onClick={() =>
                    navigate(`/customer-repayment/${c.id}`)
                  }
                  style={{
                    marginTop: "10px",
                    padding: "10px 15px",
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Make Repayment
                </button>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CreditList;