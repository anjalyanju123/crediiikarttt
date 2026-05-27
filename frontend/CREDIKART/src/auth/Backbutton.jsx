import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

function Backbutton() {
  const navigate = useNavigate();

  return (
    <button
      className="back_button"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
  );
}

export default Backbutton;