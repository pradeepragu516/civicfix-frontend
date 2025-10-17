import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUserCircle,
  FaExclamationCircle,
  FaClipboardList,
  FaMoneyBill,
  FaHandsHelping,
  FaUsers,
  FaBell,
  FaCog,
  FaBars,
  FaAngleRight,
  FaAngleLeft
} from "react-icons/fa";
import "./UserDashboard.css";

const API = "http://localhost:5000";


const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check window size on initial load and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch and update profile image from backend API (Cloudinary)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.warn("No userId or token found in localStorage, showing default avatar");
      setProfileImage(null);
      setError("Please log in to view your profile.");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API}/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.profileImage) {
          setProfileImage(data.profileImage);
          setError(null);
        } else {
          setProfileImage(null);
          setError("No profile image found.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfileImage(null);
        setError("Failed to load profile image.");
      }
    };

    fetchUserProfile();

    // No need to listen for localStorage changes anymore
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "Home", icon: <FaHome /> },
    { path: "/dashboard/profile", label: "Profile", icon: <FaUserCircle /> },
    { path: "/dashboard/report", label: "Report an Issue", icon: <FaExclamationCircle /> },
    { path: "/dashboard/myreports", label: "My Reports", icon: <FaClipboardList /> },
    { path: "/dashboard/finance", label: "Finance Details", icon: <FaMoneyBill /> },
    { path: "/dashboard/community", label: "Community Discussion", icon: <FaUsers /> },
    { path: "/dashboard/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="dashboard-container22">
      {/* Main Layout */}
      <div className={`user-layout22 ${collapsed ? "sidebar-collapsed22" : ""}`}>
        {/* Sidebar */}
        <aside className="sidebar22">
          {/* Logo Section */}
          <div className="sidebar-header22">
            <div className="logo-container22">
              <div className="logo-icon22">CF</div>
              {!collapsed && <h2 className="logo-text22">CivicFix</h2>}
            </div>
            <button className="toggle-btn22" onClick={toggleSidebar}>
              {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className="user-profile22">
            <div className="profile-image22">
              {profileImage ? (
                <img src={profileImage} alt="User" />
              ) : (
                <FaUserCircle className="default-avatar22" />
              )}
            </div>
            {!collapsed && (
              <div className="profile-info22">
                {/* Name can be added here if fetched from backend */}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav22">
            <ul className="sidebar-menu22">
              {menuItems.map((item, idx) => (
                <li key={idx} className={isActive(item.path) ? "active" : ""}>
                  <Link
                    to={item.path}
                    className="sidebar-link22"
                    title={collapsed ? item.label : ""}
                  >
                    <span className="icon22">{item.icon}</span>
                    {!collapsed && <span className="label22">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content22">
          {/* Mobile Menu Toggle */}
          <div className="mobile-header22">
            <button className="mobile-toggle22" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <h2 className="mobile-title22">CivicFix</h2>
          </div>
          
          {/* Page Content */}
          <div className="page-content22">
            {error && <div className="error-message">{error}</div>}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSidebar;
