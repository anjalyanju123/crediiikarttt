import React, { useEffect, useState } from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import "../Adminpages/Sidebar.css";

function CustDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user")) || null;
    });
    const handleLogout = () => {

        // Completely clear all stored state (tokens, cart, checkout)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user"); 

        // Redirect to login
        navigate("/");

    };
    return (
        <div className="sidebar">
            <h2 className="sidebar-title"> Welcome, {user?.username}</h2>

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
                    to="/customer-transactions"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Transactions
                </NavLink>

                <NavLink
                    to="/customer-notifications"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Notifications
                </NavLink>

                <NavLink
                    to="/credit-list"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Credits
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
