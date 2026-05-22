import React, { useEffect, useState } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import "../Adminpages/Sidebar.css";
import api from '../api/axios'

function CustDashboard() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(()=>{fetchCurrentUser()},[]);

    const fetchCurrentUser = async () => {
        try {

            const response = await api.get("/current_user/");

            setUsername(response.data.username);

        } catch (error) {

            console.log(error);
        }
    };

    const handleLogout = () => {

        // Remove tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redirect to login
        navigate("/");
    };
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">Welcome, {username}</h2>

            <nav className="sidebar-nav">
                <NavLink
                    to="/customer-dashboard"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/list-products"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Products
                </NavLink>

                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Cart
                </NavLink>

                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Transactions
                </NavLink>

                <NavLink
                    to="/payment"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Payment
                </NavLink>

                <NavLink
                    to="/send-notifications"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Send Notifications
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Analytics
                </NavLink>

                <NavLink
                    to="/admin-revenue"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Revenue Analytics
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
export default CustDashboard;
