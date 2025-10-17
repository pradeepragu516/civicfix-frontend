import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Calendar, Clock, Tag, MapPin, AlertCircle, CheckCircle, Clock as PendingIcon } from 'lucide-react';
import './MyReports.css';

const API = "http://localhost:5000";


const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [expandedId, setExpandedId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to view your reports');
        }

        const response = await fetch(`${API}/api/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch reports');
        }

        const data = await response.json();
        console.log('Fetched reports:', data); // Debug: Log raw API response
        const transformedReports = data.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          category: report.category,
          location: report.location.address,
          wardNumber: report.wardNumber,
          date: new Date(report.createdAt).toISOString().split('T')[0],
          time: new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: report.status || 'pending', // Ensure status is always set
          urgency: report.urgency || 'medium', // Include urgency
          images: report.images || [],
        }));

        setReports(transformedReports);
        setFilteredReports(transformedReports);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filtering and searching logic
  useEffect(() => {
    let result = [...reports];

    if (searchTerm) {
      result = result.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.wardNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(report => report.status === filterStatus);
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'title') {
        return sortConfig.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredReports(result);
  }, [reports, searchTerm, filterStatus, sortConfig]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { icon: <PendingIcon size={16} />, className: 'us-status-badge-pending', text: 'Pending' },
      in_progress: { icon: <Clock size={16} />, className: 'us-status-badge-progress', text: 'In Progress' },
      resolved: { icon: <CheckCircle size={16} />, className: 'us-status-badge-resolved', text: 'Resolved' },
      rejected: { icon: <AlertCircle size={16} />, className: 'us-status-badge-rejected', text: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div className={`us-status-badge ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="us-my-reports-container">
      <div className="us-my-reports-header">
        <h1>My Reports</h1>
        <p>Track and manage all your submitted reports</p>
      </div>

      <div className="us-reports-actions">
        <div className="us-search-container">
          <Search size={18} className="us-search-icon" />
          <input
            type="text"
            placeholder="Search reports..."
            className="us-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="us-filter-container">
          <button
            className="us-filter-button"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={18} />
            <span>Filter</span>
            {filterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {filterOpen && (
            <div className="us-filter-dropdown">
              <div className="us-filter-group">
                <h4>Status</h4>
                <div className="us-filter-options">
                  <label className={`us-filter-option ${filterStatus === 'all' ? 'us-active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={filterStatus === 'all'}
                      onChange={() => setFilterStatus('all')}
                    />
                    <span>All</span>
                  </label>
                  <label className={`us-filter-option ${filterStatus === 'pending' ? 'us-active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={filterStatus === 'pending'}
                      onChange={() => setFilterStatus('pending')}
                    />
                    <span>Pending</span>
                  </label>
                  <label className={`us-filter-option ${filterStatus === 'in_progress' ? 'us-active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="in_progress"
                      checked={filterStatus === 'in_progress'}
                      onChange={() => setFilterStatus('in_progress')}
                    />
                    <span>In Progress</span>
                  </label>
                  <label className={`us-filter-option ${filterStatus === 'resolved' ? 'us-active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="resolved"
                      checked={filterStatus === 'resolved'}
                      onChange={() => setFilterStatus('resolved')}
                    />
                    <span>Resolved</span>
                  </label>
                  <label className={`us-filter-option ${filterStatus === 'rejected' ? 'us-active' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={filterStatus === 'rejected'}
                      onChange={() => setFilterStatus('rejected')}
                    />
                    <span>Rejected</span>
                  </label>
                </div>
              </div>
              <div className="us-filter-actions">
                <button
                  className="us-filter-clear"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterOpen(false);
                  }}
                >
                  Clear filters
                </button>
                <button
                  className="us-filter-apply"
                  onClick={() => setFilterOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="us-sort-options">
        <button
          className={`us-sort-button ${sortConfig.key === 'date' ? 'us-active' : ''}`}
          onClick={() => requestSort('date')}
        >
          Sort by Date
          {sortConfig.key === 'date' && (
            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          )}
        </button>
        <button
          className={`us-sort-button ${sortConfig.key === 'title' ? 'us-active' : ''}`}
          onClick={() => requestSort('title')}
        >
          Sort by Title
          {sortConfig.key === 'title' && (
            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          )}
        </button>
      </div>

      {loading ? (
        <div className="us-loading-container">
          <div className="us-loading-spinner"></div>
          <p>Loading your reports...</p>
        </div>
      ) : error ? (
        <div className="us-empty-state">
          <AlertCircle size={48} className="us-empty-icon" />
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="us-empty-state">
          <AlertCircle size={48} className="us-empty-icon" />
          <h3>No reports found</h3>
          <p>We couldn't find any reports matching your criteria.</p>
        </div>
      ) : (
        <div className="us-reports-list">
          {filteredReports.map(report => (
            <div key={report.id} className="us-report-card">
              <div
                className="us-report-header"
                onClick={() => toggleExpand(report.id)}
              >
                <div className="us-report-title-area">
                  <h3 className="us-report-title">{report.title}</h3>
                  <StatusBadge status={report.status} />
                </div>
                <div className="us-report-meta">
                  <div className="us-report-meta-item">
                    <Calendar size={16} />
                    <span>{report.date}</span>
                  </div>
                  <div className="us-report-meta-item">
                    <Tag size={16} />
                    <span>{report.category}</span>
                  </div>
                  <div className="us-report-toggle">
                    {expandedId === report.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {expandedId === report.id && (
                <div className="us-report-details">
                  <div className="us-report-section">
                    <h4 className="us-section-title">Description</h4>
                    <p className="us-report-description">{report.description}</p>
                  </div>

                  <div className="us-report-details-grid">
                    <div className="us-report-detail-item">
                      <MapPin size={16} />
                      <div>
                        <h5>Location</h5>
                        <p>{report.location}</p>
                      </div>
                    </div>
                    <div className="us-report-detail-item">
                      <MapPin size={16} />
                      <div>
                        <h5>Ward Number</h5>
                        <p>{report.wardNumber}</p>
                      </div>
                    </div>
                    <div className="us-report-detail-item">
                      <Clock size={16} />
                      <div>
                        <h5>Time Reported</h5>
                        <p>{report.time}</p>
                      </div>
                    </div>
                    <div className="us-report-detail-item">
                      <Tag size={16} />
                      <div>
                        <h5>Urgency</h5>
                        <p>{report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1)}</p>
                      </div>
                    </div>
                  </div>

                  {report.images.length > 0 && (
                    <div className="us-report-section">
                      <h4 className="us-section-title">Images</h4>
                      <div className="us-attachments-list">
                        {report.images.map((image, index) => (
                          <div key={index} className="us-attachment-item">
                            <div className="us-attachment-preview">
                              <img src={image.url} alt={`Report image ${index + 1}`} />
                            </div>
                            <span className="us-attachment-name">Image {index + 1}</span>
            </div>
          ))} 
        </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;