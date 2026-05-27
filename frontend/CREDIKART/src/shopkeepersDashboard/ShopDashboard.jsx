import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Adminpages/Sidebar.css";

function ShopDashboard() {
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
            <h2 className="sidebar-title">Welcome, {user?.username}</h2>

            <nav className="sidebar-nav">
                <NavLink
                    to="/shopkeeper-dashboard"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/manage-products"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Manage Products
                </NavLink>

                <NavLink
                    to="/customers"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Customers
                </NavLink>

                <NavLink
                    to="/Orders"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Orders
                </NavLink>

                <NavLink
                    to="/Shopsend-notifications"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Send Notifications
                </NavLink>
                <NavLink
                    to="/Shopkeeper-Analytics"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Shopkeeper-Analytics
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
export default ShopDashboard;
