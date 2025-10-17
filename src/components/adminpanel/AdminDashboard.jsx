// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaListAlt,
  FaMoneyBill,
  FaUsers,
  FaBell,
  FaCog,
  FaBars,
  FaAngleRight,
  FaAngleLeft,
  FaUserCircle
} from "react-icons/fa";
import "./AdminDashboard.css";
// Replace with default profile pic instead of using the TN image
import defaultProfile from "../../assets/pradeep.jpg";



const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Check window size on initial load and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);
  
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/adminDashboard", label: "Home", icon: <FaHome /> },
    { path: "/adminDashboard/profile", label: "Profile", icon: <FaUserCircle /> },
    { path: "/adminDashboard/issues", label: "Manage Issues", icon: <FaListAlt /> },
    { path: "/adminDashboard/finance", label: "Financial Management", icon: <FaMoneyBill /> },
    { path: "/adminDashboard/volunteer", label: "Volunteer Creation", icon: <FaUsers /> },
    { path: "/adminDashboard/volunteers", label: "Volunteer Management", icon: <FaUsers /> },
    { path: "/adminDashboard/notification", label: "Notification", icon: <FaBell /> },
    { path: "/adminDashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="dashboard-container0">
      {/* Main Layout */}
      <div className={`admin-layout0 ${collapsed ? "sidebar-collapsed0" : ""}`}>
        {/* Sidebar */}
        <aside className="sidebar0">
          {/* Logo Section */}
          <div className="sidebar-header0">
            <div className="logo-container0">
              <div className="logo-icon0">CF</div>
              {!collapsed && <h2 className="logo-text0">CivicFix</h2>}
            </div>
            <button className="toggle-btn0" onClick={toggleSidebar}>
              {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </button>
          </div>
          
          {/* Admin Profile Section */}
          <div className="admin-profile0">
            <div className="profile-image0">
              {defaultProfile ? 
                <img src={defaultProfile} alt="Admin" /> : 
                <FaUserCircle className="default-avatar0" />
              }
            </div>
            {!collapsed && (
              <div className="profile-info0">
            
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav0">
            <ul className="sidebar-menu0">
              {menuItems.map((item, idx) => (
                <li key={idx} className={isActive(item.path) ? "active" : ""}>
                  <Link
                    to={item.path}
                    className="sidebar-link0"
                    title={collapsed ? item.label : ""}
                  >
                    <span className="icon0">{item.icon}</span>
                    {!collapsed && <span className="label0">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content0">
          {/* Mobile Menu Toggle */}
          <div className="mobile-header0">
            <button className="mobile-toggle0" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <h2 className="mobile-title0">CivicFix</h2>
          </div>
          
          {/* Page Content */}
          <div className="page-content0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;