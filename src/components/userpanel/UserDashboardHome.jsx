import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaMoneyBill,
  FaExclamationCircle,
  FaHandsHelping,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaArrowRight,
  FaBell,
  FaCheck,
  FaComments,
  FaSignOutAlt,
} from "react-icons/fa";
import "./UserDashboardHome.css";
import axios from "axios"; // Import axios

const API = import.meta.env.VITE_API_BASE_URL;



const UserDashboardHome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    totalDonations: 0,
    upcomingEvents: 0,
    activeDiscussions: 0,
  });
  const [reports, setReports] = useState([]);
  const [finances, setFinances] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [error, setError] = useState(null);

  // Get token and userId from localStorage
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Set up Axios with auth header
  const axiosInstance = axios.create({
    baseURL: `${API}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    if (!userId || !token) {
      console.error("Authentication missing: userId or token not found");
      setError("Please log in to view your dashboard.");
      navigate("/user-login");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user/${userId}`);
        const data = response.data;
        setUserName(data.name || "User");
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setError(`Failed to load user data: ${error.message}`);
      }
    };

    // Fetch reports
    const fetchReports = async () => {
      try {
        const response = await axiosInstance.get("/reports");
        const data = response.data;
        console.log("Fetched reports for dashboard:", data);
        const transformedReports = data.map((report) => ({
          id: report._id,
          title: report.title,
          status:
            report.status === "resolved"
              ? "Completed"
              : report.status === "pending"
              ? "Pending Review"
              : report.status === "rejected"
              ? "Rejected"
              : "In Progress",
          date: new Date(report.createdAt).toISOString().split("T")[0],
          urgency: report.urgency
            ? report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1)
            : "Medium",
        }));

        setReports(transformedReports);
        setStats((prevStats) => ({
          ...prevStats,
          totalReports: transformedReports.length,
          completedReports: transformedReports.filter((r) => r.status === "Completed").length,
          pendingReports: transformedReports.filter((r) => r.status !== "Completed").length,
        }));
      } catch (error) {
        console.error("Error fetching reports:", error.message);
        setError(`Failed to load reports: ${error.message}`);
      }
    };

    // Fetch financial data for Pollachi
    const fetchFinancialData = async () => {
      try {
        const response = await axiosInstance.get(`/finances/town/1?startYear=2024&endYear=2024`);
        const data = response.data;
        console.log("Fetched financial data for Pollachi:", data);

        const transformedFinances = data.map((item, index) => ({
          id: index + 1,
          type: item.category || "Donation",
          amount: item.spent || 0,
          date: item.date || new Date().toISOString().split("T")[0],
          status: item.status || "Processed",
        }));

        setFinances(transformedFinances);

        const totalDonations = transformedFinances.reduce((sum, item) => sum + item.amount, 0);

        setStats((prevStats) => ({
          ...prevStats,
          totalDonations,
        }));
      } catch (error) {
        console.error("Error fetching financial data:", error.message);
        setError(`Failed to load financial data: ${error.message}`);
      }
    };

    // Fetch discussions
    const fetchDiscussions = async () => {
      try {
        const response = await axiosInstance.get("/discussions", {
          params: {
            category: "all",
            search: "",
            tab: "recent", // Fetch recent discussions
            userId: undefined,
          },
        });
        const data = response.data;
        console.log("Fetched discussions for dashboard:", data);

        // Transform discussions to match table format
        const transformedDiscussions = data.map((post) => ({
          id: post._id,
          title: post.title,
          author: post.user?.name || "Anonymous",
          date: new Date(post.timePosted).toISOString().split("T")[0],
          replies: post.comments?.length || 0,
          category: post.category.charAt(0).toUpperCase() + post.category.slice(1),
        }));

        setDiscussions(transformedDiscussions);
        setStats((prevStats) => ({
          ...prevStats,
          activeDiscussions: transformedDiscussions.length,
        }));
      } catch (error) {
        console.error("Error fetching discussions:", error.message);
        setError(`Failed to load discussions: ${error.message}`);
      }
    };

    // Execute fetches
    fetchUserData();
    fetchReports();
    fetchFinancialData();
    fetchDiscussions();
  }, [navigate, userId, token]);

  // Handle logout function
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/");
  };

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";
      case "In Progress":
        return "status-progress";
      case "Pending Review":
        return "status-pending";
      case "Rejected":
        return "status-rejected";
      default:
        return "";
    }
  };

  const getPriorityColor = (urgency) => {
    switch (urgency) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      case "Critical":
        return "priority-critical";
      default:
        return "";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Safety":
        return "category-safety";
      case "Environment":
        return "category-environment";
      case "Economy":
        return "category-economy";
      default:
        return "category-other";
    }
  };

  return (
    <div className="dashboard-home">
      {error && <div className="error-message">{error}</div>}
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="greeting-container">
          <h1 className="greeting">{getGreeting()}, {userName}!</h1>
          <p className="greeting-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview8">
        <div className="stat-card8">
          <div className="stat-icon reports-icon">
            <FaClipboardList />
          </div>
          <div className="stat-content8">
            <h3>Total Reports</h3>
            <p className="stat-value8">{stats.totalReports}</p>
          </div>
        </div>
        <div className="stat-card8">
          <div className="stat-icon completed-icon">
            <FaCheck />
          </div>
          <div className="stat-content8">
            <h3>Completed</h3>
            <p className="stat-value8">{stats.completedReports}</p>
          </div>
        </div>
        <div className="stat-card8">
          <div className="stat-icon donations-icon">
            <FaMoneyBill />
          </div>
          <div className="stat-content8">
            <h3>Finances</h3>
            <p className="stat-value8">${stats.totalDonations.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card8">
          <div className="stat-icon discussions-icon">
            <FaComments />
          </div>
          <div className="stat-content8">
            <h3>Active Discussions</h3>
            <p className="stat-value8">{stats.activeDiscussions}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-container">
          <Link to="/dashboard/report" className="action-button">
            <FaExclamationCircle />
            <span>Report Issue</span>
          </Link>
          <Link to="/dashboard/community" className="action-button">
            <FaUsers />
            <span>Community</span>
          </Link>
          <Link to="/dashboard/finance" className="action-button">
            <FaMoneyBill />
            <span>Finance</span>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid9">
        {/* Recent Reports */}
        <div className="dashboard-card reports-card">
          <div className="card-header">
            <h2>
              <FaClipboardList /> Recent Reports
            </h2>
            <Link to="/dashboard/myreports" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="card-content">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Urgency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 3).map((report) => (
                  <tr key={report.id}>
                    <td>{report.title}</td>
                    <td>{report.date}</td>
                    <td>
                      <span className={`priority-badge ${getPriorityColor(report.urgency)}`}>
                        {report.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Activity */}
        <div className="dashboard-card finance-card9">
          <div className="card-header">
            <h2>
              <FaMoneyBill /> Financial Activity
            </h2>
            <Link to="/dashboard/finance" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="card-content">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              “

              </thead>
              <tbody>
                {finances.map((finance) => (
                  <tr key={finance.id}>
                    <td>{finance.type}</td>
                    <td>${finance.amount.toFixed(2)}</td>
                    <td>{finance.date}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          finance.status === "Processed" ? "status-completed" : "status-pending"
                        }`}
                      >
                        {finance.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community Discussions */}
        <div className="dashboard-card discussions-card">
          <div className="card-header">
            <h2>
              <FaComments /> Community Discussions
            </h2>
            <Link to="/dashboard/community" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="card-content">
            <table className="discussions-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Replies</th>
                </tr>
              </thead>
              <tbody>
                {discussions.slice(0, 3).map((discussion) => (
                  <tr key={discussion.id}>
                    <td>{discussion.title}</td>
                    <td>{discussion.author}</td>
                    <td>{discussion.date}</td>
                    <td>
                      <span className={`category-badge ${getCategoryColor(discussion.category)}`}>
                        {discussion.category}
                      </span>
                    </td>
                    <td>{discussion.replies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardHome;