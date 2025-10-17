import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaIdCard } from "react-icons/fa";
import "./Register.css";

const API = "http://localhost:5000";


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Password validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, joinDate: new Date().toISOString() }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store userId in localStorage
        localStorage.setItem("userId", data.userId);
        // Attempt automatic login
        const loginResponse = await fetch(`${API}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          localStorage.setItem("token", loginData.token);
          setShowWelcomePopup(true);
          setTimeout(() => {
            setShowWelcomePopup(false);
            navigate("/dashboard");
          }, 3000);
        } else {
          alert("Registration succeeded, but login failed. Please log in manually.");
          navigate("/user-login");
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const closePopup = () => {
    setShowWelcomePopup(false);
    navigate("/dashboard");
  };

  return (
    <div className="premium-register-container">
      <div className="register-gradient-overlay"></div>
      
      <div className="premium-register-box">
        <div className="register-logo">
          <div className="logo-shape"></div>
        </div>
        
        <div className="register-content">
          <h2>Create Account</h2>
          <p>Sign up to get started with our platform</p>

          <div className="input-group">
            <div className="input-icon">
              <FaIdCard />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaEnvelope />
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

          <div className="input-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div 
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="terms-privacy">
            <div className="terms-check">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
          </div>

          <button className="btn-register" onClick={handleRegister}>
            Create Account
          </button>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <button className="btn-guest" onClick={() => navigate("/dashboard")}>
            Continue as Guest
          </button>

          <div className="login-link">
            <p>
              Already have an account? <Link to="/user-login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {showWelcomePopup && (
        <div className="welcome-popup-overlay">
          <div className="welcome-popup">
            <div className="welcome-icon">🎉</div>
            <h2>Welcome, {name}!</h2>
            <p>Your account has been created successfully.</p>
            <div className="popup-loader">
              <div className="loader-bar"></div>
            </div>
            <button className="btn-close-popup" onClick={closePopup}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;