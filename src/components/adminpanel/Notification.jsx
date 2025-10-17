import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Settings, Filter } from 'lucide-react';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Mock notification data - in a real app, you'd fetch this from an API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'success',
          message: 'New user registered: John Smith',
          time: '10 minutes ago',
          isRead: false
        },
        {
          id: 2,
          type: 'warning',
          message: 'User payment failed: Transaction #38291',
          time: '25 minutes ago',
          isRead: false
        },
        {
          id: 3,
          type: 'info',
          message: 'System update scheduled for tomorrow at 2:00 AM',
          time: '1 hour ago',
          isRead: true
        },
        {
          id: 4,
          type: 'success',
          message: 'New order placed: Order #4592',
          time: '2 hours ago',
          isRead: true
        },
        {
          id: 5,
          type: 'warning',
          message: 'Low inventory alert: Product SKU-293',
          time: '3 hours ago',
          isRead: true
        },
        {
          id: 6,
          type: 'info',
          message: 'Weekly analytics report is ready to view',
          time: '5 hours ago',
          isRead: true
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircle className="notification-icon success" />;
      case 'warning':
        return <AlertTriangle className="notification-icon warning" />;
      case 'info':
        return <Info className="notification-icon info" />;
      default:
        return <Bell className="notification-icon" />;
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? {...notification, isRead: true} : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({...notification, isRead: true}))
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.isRead;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2>Notifications</h2>
        <div className="notification-actions">
          <div className="notification-badge">
            <Bell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
          <button 
            className="icon-button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Notification settings"
          >
            <Settings />
          </button>
        </div>
      </div>

      <div className="notification-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'success' ? 'active' : ''}`}
          onClick={() => setActiveFilter('success')}
        >
          Success
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'warning' ? 'active' : ''}`}
          onClick={() => setActiveFilter('warning')}
        >
          Warnings
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'info' ? 'active' : ''}`}
          onClick={() => setActiveFilter('info')}
        >
          Info
        </button>
      </div>

      {showSettings && (
        <div className="notification-settings">
          <h3>Settings</h3>
          <div className="settings-actions">
            <button className="action-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
            <button className="action-btn danger" onClick={handleClearAll}>
              Clear all notifications
            </button>
          </div>
        </div>
      )}

      <div className="notification-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.type)}
                <div className="notification-details">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    className="action-btn small"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                )}
                <button 
                  className="icon-button delete"
                  onClick={() => handleDelete(notification.id)}
                  aria-label="Delete notification"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Bell size={48} />
            <p>No notifications to display</p>
            {activeFilter !== 'all' && (
              <button 
                className="action-btn"
                onClick={() => setActiveFilter('all')}
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;