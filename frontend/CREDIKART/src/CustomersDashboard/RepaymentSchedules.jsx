import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Backbutton from "../auth/Backbutton";
import "./RepaymentSchedules.css";

function RepaymentSchedule() {
  const { id } = useParams(); // order_id
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const access = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/repayment_schedule/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      ); console.log(res)
      setPlan(res.data);
    } catch (err) {
      console.log(err);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };
  const handleRepayment = async (inst) => {

    try {

      // CREATE ORDER
      const orderRes = await api.post(
        `/create_razorpay_order/${plan.order}/`,
        {
          installment_id: inst.id,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      const data = orderRes.data;

      const options = {

        key: data.key,

        amount: data.amount,

        currency: data.currency,

        order_id: data.order_id,

        name: "Credikart",

        description: "Installment Payment",

        handler: async function (response) {

          try {

            const verifyRes = await api.post(
              `/verify_payment/${plan.order}/`,
              {
                installment_id: inst.id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${access}`,
                },
              }
            );

            alert(verifyRes.data.message);

            fetchSchedule();

          } catch (err) {

            console.log(err);

            alert("Verification failed");
          }
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();

    } catch (err) {

      console.log(err);

      alert("Payment failed");
    }
  };
  if (loading) return <h3>Loading schedule...</h3>;

  if (!plan) return <h3>No repayment schedule found</h3>;

  return (
    <div className="schedule-container">
      <Backbutton />

      <h2>Repayment Schedule</h2>

      <div className="schedule-card">

        <h3>Order #{plan.order}</h3>

        <p>
          <b>Schedule Type:</b>{" "}
          {plan.schedule_type}
        </p>

        <p>
          <b>Total Installments:</b>{" "}
          {plan.installments.length}
        </p>

      </div>

      {/* INSTALLMENTS LIST */}
      <div className="installment-list">

        {plan.installments.map((inst, index) => (
          <div
            key={index}
            className={`installment-card ${inst.status}`}
          >

            <h4>Installment #{index + 1}</h4>

            <p>
              <b>Due Date:</b>{" "}
              {new Date(inst.due_date).toLocaleDateString()}
            </p>

            <p>
              <b>Amount:</b> ₹{inst.amount}
            </p>

            <p>
              <b>Status:</b>{" "}
              <span className={inst.status}>
                {inst.status}
              </span>
            </p>
            <button style={{
                      marginTop: "10px",
                      padding: "10px 15px",
                      backgroundColor: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      marginLeft:"10px",
                      cursor: "pointer",
                    }}
              className="repay-btn"
              onClick={() => handleRepayment(inst)}
            >
              Pay Installment
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

export default RepaymentSchedule;