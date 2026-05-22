import React, { useState } from "react";
import api from '../api/axios'
import './Sendnotifications.css'
import Sidebar from "./Sidebar";

function Send_notifications() {
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        role: "all",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/send_notifications/", formData);
            setStatus("Notification sent successfully");

            setFormData({
                title: "",
                message: "",
                role: "all",
            });
        } catch (error) {
            setStatus("Failed to send notification");
        }
    };

    return (
        <div className="admin-notification-container">
            <Sidebar />
            <h2>Send Notification</h2>

            <form onSubmit={handleSubmit} className="notification-form">

                <input
                    type="text"
                    name="title"
                    placeholder="Notification Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="message"
                    placeholder="Notification Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                />

                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="all">All Users</option>
                    <option value="customer">Customers</option>
                    <option value="shopkeeper">Shopkeepers</option>
                </select>

                <button type="submit">Send Notification</button>
            </form>

            {status && <p className="status">{status}</p>}
        </div>
    );
}

export default Send_notifications;