import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaClipboardList,
  FaSignOutAlt,
  FaCalendarAlt,
  FaEllipsisH
} from "react-icons/fa";
import "./AdminDashboardHome.css";
const API = import.meta.env.VITE_API_BASE_URL;



const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    finances: {
      allocated: 0,
      spent: 0,
      balance: 0,
      lastUpdated: new Date().toISOString()
    },
    issues: {
      total: 0,
      resolved: 0,
      pending: 0
    },
    activities: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error("Please login to view dashboard");
        }

        // Fetch issues data
        const issuesResponse = await fetch(`${API}/api/admin/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!issuesResponse.ok) {
          const errorData = await issuesResponse.json();
          throw new Error(errorData.error || "Failed to fetch reports");
        }

        const reports = await issuesResponse.json();

        // Transform issues
        const transformedIssues = reports.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          status: report.status || "pending",
          location: report.location?.address || "Unknown",
          date: report.createdAt,
          type: "issue",
        }));

        // Calculate issue statistics
        const totalIssues = transformedIssues.length;
        const resolvedIssues = transformedIssues.filter(
          issue => issue.status === "resolved"
        ).length;
        const pendingIssues = transformedIssues.filter(
          issue => issue.status === "pending" || issue.status === "in_progress"
        ).length;

        // Create issue activities
        const issueActivities = transformedIssues
          .map(issue => ({
            id: issue.id,
            type: "issue",
            title: issue.title,
            location: issue.location,
            date: issue.date,
            status: issue.status,
          }));

        // Fetch financial data for Pollachi town (id: 1)
        const financialResponse = await fetch(
          `${API}/api/finances/town/1?startYear=2024&endYear=2024`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!financialResponse.ok) {
          const errorData = await financialResponse.json();
          throw new Error(errorData.error || "Failed to fetch financial data for Pollachi");
        }

        const financialData = await financialResponse.json();

        // Get latest financial data (2024)
        const latestFinance = financialData.find(d => d.year === 2024) || {
          allocation: 0,
          spent: 0,
          balance: 0,
          updatedAt: new Date().toISOString(),
        };

        // Create financial activities
        const financialActivities = financialData.map(finance => ({
          id: `finance-${finance.year}`,
          type: "payment",
          title: `Funds Allocated for Pollachi ${finance.year}`,
          amount: finance.allocation,
          date: finance.updatedAt || finance.createdAt || new Date().toISOString(),
          status: "completed",
        }));

        // Combine and sort activities (limit to 5 most recent)
        const allActivities = [...issueActivities, ...financialActivities]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        // Update state
        setData({
          finances: {
            allocated: latestFinance.allocation,
            spent: latestFinance.spent,
            balance: latestFinance.balance,
            lastUpdated: latestFinance.updatedAt || latestFinance.createdAt || new Date().toISOString(),
          },
          issues: {
            total: totalIssues,
            resolved: resolvedIssues,
            pending: pendingIssues,
          },
          activities: allActivities,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle navigation to reports page
  const navigateToReports = () => {
    navigate("/adminDashboard/issues");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="admin-home-container">
      <div className="admin-home-header">
        <h1>Dashboard Overview</h1>
        <div className="action-buttons1">
          <button
            className="btn-primary"
            onClick={navigateToReports}
          >
            <FaClipboardList /> Report Management
          </button>
          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading dashboard data...</div>
      ) : error ? (
        <div className="error-message">
          <FaExclamationCircle size={24} />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Financial Summary Section */}
          <section className="finance-summary-section">
            <div className="section-header">
              <h2>Financial Transparency (Pollachi)</h2>
              <span className="last-updated">
                <FaCalendarAlt /> Last updated: {formatDate(data.finances.lastUpdated)}
              </span>
            </div>

            <div className="finance-cards">
              <div className="finance-card allocated">
                <div className="finance-icon">
                  <FaRupeeSign />
                </div>
                <div className="finance-details">
                  <h3>Total Allocated</h3>
                  <p className="amount">{formatCurrency(data.finances.allocated)}</p>
                </div>
              </div>

              <div className="finance-card spent">
                <div className="finance-icon">
                  <FaChartLine />
                </div>
                <div className="finance-details">
                  <h3>Total Spent</h3>
                  <p className="amount">{formatCurrency(data.finances.spent)}</p>
                </div>
              </div>

              <div className="finance-card balance">
                <div className="finance-icon">
                  <FaRupeeSign />
                </div>
                <div className="finance-details">
                  <h3>Balance</h3>
                  <p className="amount">{formatCurrency(data.finances.balance)}</p>
                </div>
              </div>
            </div>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${data.finances.allocated ? (data.finances.spent / data.finances.allocated) * 100 : 0}%` }}
                title={`${Math.round(data.finances.allocated ? (data.finances.spent / data.finances.allocated) * 100 : 0)}% utilized`}
              ></div>
            </div>
          </section>

          {/* Issues Stats Section */}
          <section className="issues-summary-section6">
            <div className="section-header6">
              <h2>Issues Overview</h2>
            </div>

            <div className="issues-cards6">
              <div className="issue-card total6">
                <div className="issue-icon6">
                  <FaClipboardList />
                </div>
                <div className="issue-details6">
                  <h3>Total Issues</h3>
                  <p className="count6">{data.issues.total}</p>
                </div>
              </div>

              <div className="issue-card resolved6">
                <div className="issue-icon6">
                  <FaCheckCircle />
                </div>
                <div className="issue-details6">
                  <h3>Resolved</h3>
                  <p className="count6">{data.issues.resolved}</p>
                </div>
              </div>

              <div className="issue-card pending6">
                <div className="issue-icon6">
                  <FaClock />
                </div>
                <div className="issue-details6">
                  <h3>Pending</h3>
                  <p className="count6">{data.issues.pending}</p>
                </div>
              </div>
            </div>

            <div className="issue-progress-container6">
              <div
                className="issue-progress-bar6"
                style={{ width: `${data.issues.total ? (data.issues.resolved / data.issues.total) * 100 : 0}%` }}
                title={`${Math.round(data.issues.total ? (data.issues.resolved / data.issues.total) * 100 : 0)}% resolved`}
              ></div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="dashboard-grid">
            {/* Recent Activity Section */}
            <section className="recent-activity-section">
              <div className="section-header-with-action">
                <h2>Recent Activity</h2>
                <button className="btn-view-all" onClick={navigateToReports}>
                  View All <FaEllipsisH />
                </button>
              </div>

              <ul className="activity-list">
                {data.activities.length > 0 ? (
                  data.activities.map(activity => (
                    <li key={activity.id} className={`activity-item ${activity.status}`}>
                      <div className="activity-content">
                        <h4>{activity.title}</h4>
                        {activity.type === "payment" && (
                          <p className="activity-detail">
                            Amount: {formatCurrency(activity.amount)}
                          </p>
                        )}
                        {activity.type === "issue" && (
                          <p className="activity-detail">
                            Location: {activity.location}
                          </p>
                        )}
                        <p className="activity-time">{formatDate(activity.date)}</p>
                      </div>
                      <div className="activity-status">
                        {activity.status === "completed" || activity.status === "resolved" ? (
                          <FaCheckCircle className="status-icon" />
                        ) : activity.status === "pending" ? (
                          <FaClock className="status-icon" />
                        ) : (
                          <FaExclamationCircle className="status-icon" />
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="activity-item">No recent activities</li>
                )}
              </ul>
            </section>

            {/* Quick Actions Section */}
            <section className="quick-actions-section">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-action-buttons">
                <button className="quick-action-btn" onClick={navigateToReports}>
                  <FaClipboardList className="quick-action-icon" />
                  <span>Manage Reports</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/adminDashboard/finance")}>
                  <FaRupeeSign className="quick-action-icon" />
                  <span>Financial Mgmt</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/adminDashboard/volunteers")}>
                  <FaCheckCircle className="quick-action-icon" />
                  <span>Volunteers</span>
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/adminDashboard/notification")}>
                  <FaExclamationCircle className="quick-action-icon" />
                  <span>Send Notification</span>
                </button>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardHome;