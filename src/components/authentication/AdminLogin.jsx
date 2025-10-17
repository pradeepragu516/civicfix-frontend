import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminId", data.admin.adminId);
        setAdminName(data.admin.name || "Admin");
        setShowWelcomePopup(true);

        // Navigate to admin dashboard after delay
        setTimeout(() => {
          setShowWelcomePopup(false);
          navigate("/AdminDashboard");
        }, 2000);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong! Try again.");
      console.error("Login error:", err);
    }
  };

  const closePopup = () => {
    setShowWelcomePopup(false);
    navigate("/AdminDashboard");
  };

  return (
    <div className="premium-login-container">
      <div className="login-gradient-overlay"></div>
      
      <div className="premium-login-box">
        <div className="login-logo">
          <div className="logo-shape"></div>
        </div>
        
        <div className="login-content">
          <h2>Admin Login</h2>
          <p>Sign in to your admin account to continue</p>

          {/* Show Error Message */}
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="remember-forgot">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="/admin-forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button className="btn-login" onClick={handleLogin}>
            Sign In
          </button>
          
          <div className="admin-security-note">
            <p>This is a secure area. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="welcome-popup-overlay">
          <div className="welcome-popup">
            <div className="welcome-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2>Welcome, {adminName}</h2>
            <p>Successfully logged in to admin portal</p>
            <div className="popup-loader">
              <div className="loader-bar"></div>
            </div>
            <button className="btn-close-popup" onClick={closePopup}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;