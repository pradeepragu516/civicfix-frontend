import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, AlertTriangle, Info, Star, Settings } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  // Sample notification data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Simulate fetching notifications from an API
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - in a real app, this would be fetched from your backend
      const sampleNotifications = [
        {
          id: 1,
          type: 'info',
          title: 'System Update',
          message: 'The system will undergo maintenance tonight from 2 AM to 4 AM.',
          time: '2 hours ago',
          read: false,
          important: true
        },
        {
          id: 2,
          type: 'success',
          title: 'Order Confirmed',
          message: 'Your order #38295 has been confirmed and is being processed.',
          time: '5 hours ago',
          read: true,
          important: false
        },
        {
          id: 3,
          type: 'warning',
          title: 'Payment Due',
          message: 'Your subscription payment is due in 3 days. Please update your payment method.',
          time: '1 day ago',
          read: false,
          important: true
        },
        {
          id: 4,
          type: 'error',
          title: 'Login Alert',
          message: 'A new login was detected from an unrecognized device. Please verify if this was you.',
          time: '2 days ago',
          read: false,
          important: true
        },
        {
          id: 5,
          type: 'info',
          title: 'New Feature Available',
          message: 'Check out our new dashboard analytics features that are now available.',
          time: '3 days ago',
          read: true,
          important: false
        },
        {
          id: 6,
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile information has been successfully updated.',
          time: '4 days ago',
          read: true,
          important: false
        },
      ];
      
      setNotifications(sampleNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on the selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'important') return notification.important;
    return notification.type === filter;
  });

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Toggle important flag
  const toggleImportant = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, important: !notification.important } : notification
    ));
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="notification-icon info" />;
      case 'success':
        return <Check className="notification-icon success" />;
      case 'warning':
        return <AlertTriangle className="notification-icon warning" />;
      case 'error':
        return <AlertTriangle className="notification-icon error" />;
      default:
        return <Bell className="notification-icon" />;
    }
  };

  // Get count of unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>
          <Bell className="header-icon" />
          Notifications 
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </h1>
        <div className="notifications-actions">
          <button 
            className="action-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check size={16} /> Mark all as read
          </button>
          <button className="action-button settings-button">
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-tab ${filter === 'important' ? 'active' : ''}`}
          onClick={() => setFilter('important')}
        >
          Important
        </button>
        <button 
          className={`filter-tab ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
        >
          Info
        </button>
        <button 
          className={`filter-tab ${filter === 'success' ? 'active' : ''}`}
          onClick={() => setFilter('success')}
        >
          Success
        </button>
        <button 
          className={`filter-tab ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          Warning
        </button>
        <button 
          className={`filter-tab ${filter === 'error' ? 'active' : ''}`}
          onClick={() => setFilter('error')}
        >
          Error
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <h3>No notifications to display</h3>
            <p>All caught up! Check back later for updates.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-text">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    <div className="notification-time">
                      <Clock size={14} />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>
              </div>
              <div className="notification-actions">
                <button 
                  className={`action-icon ${notification.important ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleImportant(notification.id);
                  }}
                  title={notification.important ? "Unmark as important" : "Mark as important"}
                >
                  <Star size={18} />
                </button>
                {!notification.read && (
                  <button 
                    className="action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button 
                  className="action-icon delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;