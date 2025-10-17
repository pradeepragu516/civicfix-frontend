import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import "./Login.css";

const API = import.meta.env.VITE_API_BASE_URL;



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.userId);
        setUserName(data.user.name);
        setShowWelcomePopup(true);

        // Navigate to dashboard after delay
        setTimeout(() => {
          setShowWelcomePopup(false);
          navigate("/dashboard");
        }, 2000);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleGuestLogin = () => {
    navigate("/dashboard");
  };

  const closePopup = () => {
    setShowWelcomePopup(false);
    navigate("/dashboard");
  };

  return (
    <div className="premium-login-container">
      <div className="login-gradient-overlay"></div>
      
      <div className="premium-login-box">
        <div className="login-logo">
          <div className="logo-shape"></div>
        </div>
        
        <div className="login-content">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>

          <div className="input-group">
            <div className="input-icon">
              <FaUser />
            </div>
            <input
              type="email"
              placeholder="Email Address"
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
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button className="btn-login" onClick={handleLogin}>
            Sign In
          </button>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <button className="btn-guest" onClick={handleGuestLogin}>
            Continue as Guest
          </button>

          <div className="register-link">
            <p>
              Don't have an account? <Link to="/user-signup">Create Account</Link>
            </p>
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
            <h2>Welcome back, {userName}</h2>
            <p>Successfully logged in to your account</p>
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

export default Login;
