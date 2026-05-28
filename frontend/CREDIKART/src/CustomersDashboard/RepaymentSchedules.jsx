import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Backbutton from "../auth/Backbutton";
import "./RepaymentSchedules.css";

function RepaymentSchedules() {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await api.get("/repayment_schedule/"); 
      setPlan(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!plan) {
    return <h3>Loading repayment plan...</h3>;
  }

  return (
    <div className="repayment-container">
      <Backbutton />

      <h2>My Repayment Plan</h2>

      {/* PLAN SUMMARY */}
      <div className="plan-summary">
        <h3>Plan Type: {plan.plan_type}</h3>
        <p>Total Amount: ₹{plan.total_amount}</p>
        <p>Installments: {plan.installments}</p>
      </div>

      {/* INSTALLMENTS */}
      <div className="installment-list">
        {plan.schedules.map((item, index) => (
          <div className="installment-card" key={index}>
            
            <div>
              <h4>Installment {index + 1}</h4>
              <p>Due Date: {item.due_date}</p>
            </div>

            <div>
              <p>Amount: ₹{item.amount}</p>

              <span className={`status ${item.status}`}>
                {item.status}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default RepaymentSchedules;