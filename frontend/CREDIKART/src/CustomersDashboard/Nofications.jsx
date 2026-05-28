import React, { useEffect, useState } from "react";
import api from "../api/axios";
import CustDashboard from "./CustDashboard";
import "./Notification.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/customer_notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="notification-container">
      <CustDashboard />

      <h2>My Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div className="notification-card" key={n.id}>
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <span className="time">
              {new Date(n.created_at).toLocaleString()}
            </span>
            
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;