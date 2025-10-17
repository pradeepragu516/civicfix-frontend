import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, AlertTriangle, Calendar, Clock, Download, ChevronDown, ChevronUp, X, RefreshCw, List, Grid, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ManageIssues.css';

const API = process.env.REACT_APP_API_URL;


const ManageIssues = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Check for updates from VolunteerManagement page
  useEffect(() => {
    if (location.state?.updatedIssue) {
      const { updatedIssue } = location.state;
      console.log('Received updated issue:', updatedIssue);
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === updatedIssue.id ? updatedIssue : issue
        )
      );
      setFilteredIssues(prevFiltered =>
        prevFiltered.map(issue =>
          issue.id === updatedIssue.id ? updatedIssue : issue
        )
      );
    }
  }, [location.state]);

  // Fetch reports data from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Please login to view reports');
        }
        const response = await fetch(`${API}/api/admin/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch reports');
        }
        const data = await response.json();
        const transformedReports = data.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          status: report.status || 'pending',
          priority: report.urgency || 'medium',
          category: report.category,
          location: report.location.address,
          wardNumber: report.wardNumber,
          userName: report.user?.name || 'Unknown',
          userEmail: report.user?.email || 'Unknown',
          userId: report.user?._id || 'Unknown',
          createdAt: report.createdAt,
          updatedAt: report.updatedAt || report.createdAt,
          resolvedAt: report.resolvedAt || null,
          resolvedBy: report.resolvedBy || null,
          resolution: report.resolution || null,
          screenshots: report.images ? report.images.map(img => img.url) : [],
          comments: report.comments || [],
        }));
        setIssues(transformedReports);
        setFilteredIssues(transformedReports);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...issues];

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(lowercasedSearch) ||
        issue.description.toLowerCase().includes(lowercasedSearch) ||
        issue.userName.toLowerCase().includes(lowercasedSearch) ||
        issue.userEmail.toLowerCase().includes(lowercasedSearch) ||
        (issue.location && issue.location.toLowerCase().includes(lowercasedSearch)) ||
        (issue.wardNumber && issue.wardNumber.toLowerCase().includes(lowercasedSearch))
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(issue => issue.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(issue => issue.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      result = result.filter(issue => issue.category === filters.category);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      result = result.filter(issue => {
        const issueDate = new Date(issue.createdAt);
        if (filters.dateRange === 'today') {
          return issueDate >= today;
        } else if (filters.dateRange === 'week') {
          return issueDate >= weekAgo;
        } else if (filters.dateRange === 'month') {
          return issueDate >= monthAgo;
        }
        return true;
      });
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredIssues(result);
  }, [issues, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      dateRange: 'all',
    });
    setSearchTerm('');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-progress';
      case 'resolved':
        return 'status-resolved';
      case 'completed':
        return 'status-completed';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'critical':
        return 'priority-critical';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setIsViewModalOpen(true);
  };

  const handleResolveIssue = (issue) => {
    if (!issue.id || !/^[0-9a-fA-F]{24}$/.test(issue.id)) {
      alert('Invalid report ID. Cannot navigate to Volunteer Management.');
      return;
    }
    console.log('Navigating to VolunteerManagement with issue:', issue);
    navigate('/adminDashboard/volunteers', { state: { issue } });
  };

  const handleExportData = () => {
    const csvContent = [
      ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Location', 'Ward Number', 'User Name', 'User Email', 'Created At'],
      ...filteredIssues.map(issue => [
        issue.id,
        `"${issue.title.replace(/"/g, '""')}"`,
        `"${issue.description.replace(/"/g, '""')}"`,
        issue.status,
        issue.priority,
        issue.category,
        `"${issue.location.replace(/"/g, '""')}"`,
        issue.wardNumber,
        `"${issue.userName.replace(/"/g, '""')}"`,
        issue.userEmail,
        formatDate(issue.createdAt),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'issues_export.csv';
    link.click();
  };

  const handleAddComment = async (commentText) => {
    if (!commentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to add a comment');
      }

      const newComment = {
        text: commentText,
        author: 'Admin',
        timestamp: new Date().toISOString(),
      };

      const updatedIssue = {
        comments: [...(selectedIssue.comments || []), newComment],
      };

      const response = await fetch(`${API}/api/admin/reports/${selectedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedIssue),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      const updatedData = await response.json();
      const transformedUpdatedIssue = {
        id: updatedData._id,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
        priority: updatedData.urgency,
        category: updatedData.category,
        location: updatedData.location.address,
        wardNumber: updatedData.wardNumber,
        userName: updatedData.user?.name || 'Unknown',
        userEmail: updatedData.user?.email || 'Unknown',
        userId: updatedData.user?._id || 'Unknown',
        createdAt: updatedData.createdAt,
        updatedAt: updatedData.updatedAt || updatedData.createdAt,
        resolvedAt: updatedData.resolvedAt,
        resolvedBy: updatedData.resolvedBy,
        resolution: updatedData.resolution,
        screenshots: updatedData.images ? updatedData.images.map(img => img.url) : [],
        comments: updatedData.comments || [],
      };

      setSelectedIssue(transformedUpdatedIssue);
      setIssues(prevIssues =>
        prevIssues.map(issue => (issue.id === updatedData._id ? transformedUpdatedIssue : issue))
      );
      document.querySelector('.comment-textarea').value = '';
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to view reports');
      }
      const response = await fetch(`${API}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports');
      }
      const data = await response.json();
      const transformedReports = data.map(report => ({
        id: report._id,
        title: report.title,
        description: report.description,
        status: report.status || 'pending',
        priority: report.urgency || 'medium',
        category: report.category,
        location: report.location.address,
        wardNumber: report.wardNumber,
        userName: report.user?.name || 'Unknown',
        userEmail: report.user?.email || 'Unknown',
        userId: report.user?._id || 'Unknown',
        createdAt: report.createdAt,
        updatedAt: report.updatedAt || report.createdAt,
        resolvedAt: report.resolvedAt || null,
        resolvedBy: report.resolvedBy || null,
        resolution: report.resolution || null,
        screenshots: report.images ? report.images.map(img => img.url) : [],
        comments: report.comments || [],
      }));
      setIssues(transformedReports);
      setFilteredIssues(transformedReports);
    } catch (err) {
      setError(err.message);
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(issues.map(issue => issue.category))];

  const ViewModal = () => {
    if (!selectedIssue) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Issue Details</h2>
            <button className="close-button" onClick={() => setIsViewModalOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body1">
            <div className="issue-details-header">
              <div className="issue-details-title-section">
                <h3>{selectedIssue.title}</h3>
                <div className="issue-meta">
                  <span className={`status-badge ${getStatusClass(selectedIssue.status)}`}>
                    {selectedIssue.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`priority-badge ${getPriorityClass(selectedIssue.priority)}`}>
                    {selectedIssue.priority.charAt(0).toUpperCase() + selectedIssue.priority.slice(1)}
                  </span>
                  <span className="category-badge">{selectedIssue.category}</span>
                </div>
              </div>

              {(selectedIssue.status === 'pending' || selectedIssue.status === 'in_progress') && (
                <button
                  className={selectedIssue.status === 'pending' ? 'resolve-button' : 'verify-button'}
                  onClick={() => {
                    handleResolveIssue(selectedIssue);
                    setIsViewModalOpen(false);
                  }}
                >
                  <CheckCircle size={16} />
                  {selectedIssue.status === 'pending' ? 'Assign Volunteers' : 'Verify Work'}
                </button>
              )}
            </div>

            <div className="issue-details-grid">
              <div className="issue-details-column">
                <div className="issue-detail-item">
                  <h4>Description</h4>
                  <p>{selectedIssue.description}</p>
                </div>

                <div className="issue-detail-item">
                  <h4>Submitted By</h4>
                  <p>
                    <strong>{selectedIssue.userName}</strong>
                    <br />
                    {selectedIssue.userEmail}
                    <br />
                    User ID: {selectedIssue.userId}
                  </p>
                </div>

                {selectedIssue.location && (
                  <div className="issue-detail-item">
                    <h4>Location</h4>
                    <p>
                      <MapPin size={16} /> {selectedIssue.location}
                    </p>
                  </div>
                )}

                {selectedIssue.wardNumber && (
                  <div className="issue-detail-item">
                    <h4>Ward Number</h4>
                    <p>
                      <MapPin size={16} /> {selectedIssue.wardNumber}
                    </p>
                  </div>
                )}

                {selectedIssue.status === 'resolved' && (
                  <div className="issue-detail-item">
                    <h4>Resolution</h4>
                    <p>
                      <span className="resolution-info">
                        Resolved by {selectedIssue.resolvedBy || 'Unknown'} on{' '}
                        {formatDate(selectedIssue.resolvedAt)} at {formatTime(selectedIssue.resolvedAt)}
                      </span>
                      <br />
                      {selectedIssue.resolution || 'No resolution details provided'}
                    </p>
                  </div>
                )}
              </div>

              <div className="issue-details-column">
                <div className="issue-detail-item">
                  <h4>Timeline</h4>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon created-icon"></div>
                      <div className="timeline-content">
                        <p>
                          <strong>Created</strong>
                        </p>
                        <p>
                          {formatDate(selectedIssue.createdAt)} at {formatTime(selectedIssue.createdAt)}
                        </p>
                      </div>
                    </div>

                    {selectedIssue.updatedAt && selectedIssue.updatedAt !== selectedIssue.createdAt && (
                      <div className="timeline-item">
                        <div className="timeline-icon updated-icon"></div>
                        <div className="timeline-content">
                          <p>
                            <strong>Updated</strong>
                          </p>
                          <p>
                            {formatDate(selectedIssue.updatedAt)} at {formatTime(selectedIssue.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedIssue.status === 'resolved' && (
                      <div className="timeline-item">
                        <div className="timeline-icon resolved-icon"></div>
                        <div className="timeline-content">
                          <p>
                            <strong>Resolved</strong>
                          </p>
                          <p>
                            {formatDate(selectedIssue.resolvedAt)} at {formatTime(selectedIssue.resolvedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedIssue.screenshots && selectedIssue.screenshots.length > 0 && (
                  <div className="issue-detail-item">
                    <h4>Screenshots</h4>
                    <div className="screenshots-grid">
                      {selectedIssue.screenshots.map((screenshot, index) => (
                        <div key={index} className="screenshot-thumbnail">
                          <img src={screenshot} alt={`Screenshot ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="issue-comments">
              <h4>Comments {selectedIssue.comments.length > 0 && `(${selectedIssue.comments.length})`}</h4>
              {selectedIssue.comments.length > 0 ? (
                <div className="comments-list">
                  {selectedIssue.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">
                          {formatDate(comment.timestamp)} at {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">No comments yet</p>
              )}

              <div className="add-comment">
                <textarea placeholder="Add a comment..." rows="3" className="comment-textarea"></textarea>
                <button
                  className="add-comment-button"
                  onClick={() => handleAddComment(document.querySelector('.comment-textarea').value)}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="manage-issues-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Manage Community Issues</h1>
          <p className="subtitle">View and manage community-reported issues and service requests</p>
        </div>
        <div className="page-actions">
          <button className="refresh-button" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="export-button" onClick={handleExportData}>
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={24} />
          <p>{error}</p>
        </div>
      )}

      <div className="controls-container">
        <div className="search-filter-container">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search issues by title, description, user, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <button
            className={`filter-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {Object.values(filters).some(value => value !== 'all') && <span className="filter-badge"></span>}
          </button>

          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority:</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>

            <button className="clear-filters-button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="issues-stats">
        <div className="stat-card">
          <h4>Total Issues</h4>
          <span className="stat-number">{issues.length}</span>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <span className="stat-number">{issues.filter(issue => issue.status === 'pending').length}</span>
        </div>
        <div className="stat-card">
          <h4>In Progress</h4>
          <span className="stat-number">{issues.filter(issue => issue.status === 'in_progress').length}</span>
        </div>
        <div className="stat-card">
          <h4>Resolved</h4>
          <span className="stat-number">{issues.filter(issue => issue.status === 'resolved').length}</span>
        </div>
        <div className="stat-card">
          <h4>High Priority</h4>
          <span className="stat-number">{issues.filter(issue => issue.priority === 'high').length}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading issues...</p>
        </div>
      ) : filteredIssues.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="issues-table-container">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')}>
                      ID
                      {sortConfig.key === 'id' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('title')}>
                      Title
                      {sortConfig.key === 'title' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th onClick={() => handleSort('userName')}>
                      User
                      {sortConfig.key === 'userName' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </th>
                    <th onClick={() => handleSort('createdAt')}>
                      Created
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map(issue => (
                    <tr key={issue.id} className={issue.status === 'resolved' ? 'resolved-row' : ''}>
                      <td>#{issue.id.slice(-6)}</td>
                      <td className="issue-title-cell">
                        <div className="issue-title-wrapper">
                          <span className="issue-title">{issue.title}</span>
                          {issue.screenshots && issue.screenshots.length > 0 && (
                            <span className="attachment-icon" title={`${issue.screenshots.length} screenshot(s) attached`}>
                              📎
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${getStatusClass(issue.priority)}`}>
                          {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                        </span>
                      </td>
                      <td>{issue.category}</td>
                      <td>{issue.userName}</td>
                      <td>
                        <div className="date-cell">
                          <div className="date">{formatDate(issue.createdAt)}</div>
                          <div className="time">{formatTime(issue.createdAt)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-button"
                            title="View Details"
                            onClick={() => handleViewIssue(issue)}
                          >
                            <Eye size={16} />
                          </button>
                          {(issue.status === 'pending' || issue.status === 'in_progress') && (
                            <button
                              className={issue.status === 'pending' ? 'resolve-button' : 'verify-button'}
                              title={issue.status === 'pending' ? 'Assign Volunteers' : 'Verify Work'}
                              onClick={() => handleResolveIssue(issue)}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="issues-grid-view">
              {filteredIssues.map(issue => (
                <div key={issue.id} className={`issue-card ${issue.status === 'resolved' ? 'resolved-card' : ''}`}>
                  <div className="issue-card-header">
                    <span className={`status-badge ${getStatusClass(issue.status)}`}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`priority-badge ${getStatusClass(issue.priority)}`}>
                      {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                    </span>
                  </div>

                  <h3 className="issue-card-title">{issue.title}</h3>
                  <p className="issue-card-desc">{issue.description.substring(0, 100)}...</p>

                  <div className="issue-card-meta">
                    <div className="category-tag">{issue.category}</div>
                    <div className="issue-card-date">
                      <Calendar size={14} />
                      {formatDate(issue.createdAt)}
                    </div>
                  </div>

                  <div className="issue-card-user">
                    <div className="user-avatar">{issue.userName.charAt(0)}</div>
                    <div className="user-info">
                      <p className="user-name">{issue.userName}</p>
                      <p className="user-email">{issue.userEmail}</p>
                    </div>
                  </div>

                  <div className="issue-card-actions">
                    <button
                      className="view-details-button"
                      onClick={() => handleViewIssue(issue)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    {(issue.status === 'pending' || issue.status === 'in_progress') && (
                      <button
                        className={issue.status === 'pending' ? 'resolve-issue-button' : 'verify-issue-button'}
                        onClick={() => handleResolveIssue(issue)}
                      >
                        <CheckCircle size={16} />
                        {issue.status === 'pending' ? 'Assign Volunteers' : 'Verify Work'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-issues">
          <AlertTriangle size={48} />
          <h3>No issues found</h3>
          <p>No issues match your current search filters. Try adjusting your filters or search term.</p>
          <button className="clear-filters-button" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {isViewModalOpen && <ViewModal />}
    </div>
  );
};

export default ManageIssues;