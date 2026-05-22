import React from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {

    // Remove tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login
    navigate("/");
  };
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/shopkeepers"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Shopkeepers
        </NavLink>

        <NavLink
          to="/admin-customers"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Customers
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
          to="/pending-shopkeepers"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Approvals
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
export default Sidebar;