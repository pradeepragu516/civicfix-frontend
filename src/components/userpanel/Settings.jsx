import React, { useState } from 'react';
import { Bell, Moon, User, Shield, Globe, HelpCircle, LogOut } from 'lucide-react';
import './Settings.css';
import profileImageFile from '../../assets/pradeep.jpg'; // Import a default profile image

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('english');
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'everyone',
    activityStatus: true,
    dataSharing: false
  });

  const handlePrivacyChange = (field, value) => {
    setPrivacy({
      ...privacy,
      [field]: value
    });
  };

  const handleSaveChanges = () => {
    // Implementation would go here - API calls to save settings
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Account Information</h3>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Name</label>
              <input type="text" className="US4-settings-input" defaultValue="John Doe" />
            </div>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Email</label>
              <input type="email" className="US4-settings-input" defaultValue="john.doe@example.com" />
            </div>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Username</label>
              <input type="text" className="US4-settings-input" defaultValue="johndoe" />
            </div>
            <h3 className="US4-settings-section-title US4-section-margin-top">Password</h3>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Current Password</label>
              <input type="password" className="US4-settings-input" placeholder="Enter current password" />
            </div>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">New Password</label>
              <input type="password" className="US4-settings-input" placeholder="Enter new password" />
            </div>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Confirm New Password</label>
              <input type="password" className="US4-settings-input" placeholder="Confirm new password" />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Notification Preferences</h3>
            <div className="US4-settings-toggle-group">
              <div className="US4-settings-toggle-label">
                <span>Email Notifications</span>
                <p className="US4-settings-toggle-description">Receive updates and alerts via email</p>
              </div>
              <label className="US4-settings-toggle">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  className="US4-settings-toggle-input"
                />
                <span className="US4-settings-toggle-slider"></span>
              </label>
            </div>
            <div className="US4-settings-toggle-group">
              <div className="US4-settings-toggle-label">
                <span>Push Notifications</span>
                <p className="US4-settings-toggle-description">Receive notifications on your device</p>
              </div>
              <label className="US4-settings-toggle">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                  className="US4-settings-toggle-input"
                />
                <span className="US4-settings-toggle-slider"></span>
              </label>
            </div>
            <h3 className="US4-settings-section-title US4-section-margin-top">Notification Categories</h3>
            <div className="US4-settings-checkbox-group">
              <label className="US4-settings-checkbox">
                <input type="checkbox" defaultChecked={true} className="US4-settings-checkbox-input" />
                <span className="US4-settings-checkbox-text">New messages</span>
              </label>
            </div>
            <div className="US4-settings-checkbox-group">
              <label className="US4-settings-checkbox">
                <input type="checkbox" defaultChecked={true} className="US4-settings-checkbox-input" />
                <span className="US4-settings-checkbox-text">Account updates</span>
              </label>
            </div>
            <div className="US4-settings-checkbox-group">
              <label className="US4-settings-checkbox">
                <input type="checkbox" defaultChecked={false} className="US4-settings-checkbox-input" />
                <span className="US4-settings-checkbox-text">Marketing and promotions</span>
              </label>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Theme Settings</h3>
            <div className="US4-settings-toggle-group">
              <div className="US4-settings-toggle-label">
                <span>Dark Mode</span>
                <p className="US4-settings-toggle-description">Switch between light and dark theme</p>
              </div>
              <label className="US4-settings-toggle">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="US4-settings-toggle-input"
                />
                <span className="US4-settings-toggle-slider"></span>
              </label>
            </div>
            <h3 className="US4-settings-section-title US4-section-margin-top">Layout Preferences</h3>
            <div className="US4-settings-radio-group">
              <label className="US4-settings-radio">
                <input type="radio" name="layout" defaultChecked={true} className="US4-settings-radio-input" />
                <span className="US4-settings-radio-text">Default layout</span>
              </label>
            </div>
            <div className="US4-settings-radio-group">
              <label className="US4-settings-radio">
                <input type="radio" name="layout" className="US4-settings-radio-input" />
                <span className="US4-settings-radio-text">Compact layout</span>
              </label>
            </div>
            <div className="US4-settings-radio-group">
              <label className="US4-settings-radio">
                <input type="radio" name="layout" className="US4-settings-radio-input" />
                <span className="US4-settings-radio-text">Comfortable layout</span>
              </label>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Privacy Settings</h3>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Profile Visibility</label>
              <select 
                className="US4-settings-select"
                value={privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="US4-settings-toggle-group">
              <div className="US4-settings-toggle-label">
                <span>Online Status</span>
                <p className="US4-settings-toggle-description">Show when you're active</p>
              </div>
              <label className="US4-settings-toggle">
                <input
                  type="checkbox"
                  checked={privacy.activityStatus}
                  onChange={() => handlePrivacyChange('activityStatus', !privacy.activityStatus)}
                  className="US4-settings-toggle-input"
                />
                <span className="US4-settings-toggle-slider"></span>
              </label>
            </div>
            <div className="US4-settings-toggle-group">
              <div className="US4-settings-toggle-label">
                <span>Data Sharing</span>
                <p className="US4-settings-toggle-description">Share usage data to improve our services</p>
              </div>
              <label className="US4-settings-toggle">
                <input
                  type="checkbox"
                  checked={privacy.dataSharing}
                  onChange={() => handlePrivacyChange('dataSharing', !privacy.dataSharing)}
                  className="US4-settings-toggle-input"
                />
                <span className="US4-settings-toggle-slider"></span>
              </label>
            </div>
            <h3 className="US4-settings-section-title US4-section-margin-top">Data & Security</h3>
            <button className="US4-settings-action-button US4-settings-secondary-button">
              Download My Data
            </button>
            <button className="US4-settings-action-button US4-settings-danger-button">
              Delete Account
            </button>
          </div>
        );
      case 'language':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Language Settings</h3>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Display Language</label>
              <select 
                className="US4-settings-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>
            <h3 className="US4-settings-section-title US4-section-margin-top">Region Settings</h3>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Time Zone</label>
              <select className="US4-settings-select">
                <option>UTC (GMT+0)</option>
                <option>Eastern Time (GMT-5)</option>
                <option>Pacific Time (GMT-8)</option>
                <option>Central European Time (GMT+1)</option>
                <option>Japan Standard Time (GMT+9)</option>
              </select>
            </div>
            <div className="US4-settings-form-group">
              <label className="US4-settings-label">Date Format</label>
              <select className="US4-settings-select">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="US4-settings-tab-content">
            <h3 className="US4-settings-section-title">Help & Support</h3>
            <div className="US4-settings-help-card">
              <h4 className="US4-settings-help-title">FAQs</h4>
              <p className="US4-settings-help-text">Find answers to commonly asked questions</p>
              <a href="#" className="US4-settings-help-link">Browse FAQs</a>
            </div>
            <div className="US4-settings-help-card">
              <h4 className="US4-settings-help-title">Contact Support</h4>
              <p className="US4-settings-help-text">Get help from our support team</p>
              <a href="#" className="US4-settings-help-link">Submit a Ticket</a>
            </div>
            <div className="US4-settings-help-card">
              <h4 className="US4-settings-help-title">Documentation</h4>
              <p className="US4-settings-help-text">Browse user guides and documentation</p>
              <a href="#" className="US4-settings-help-link">View Guides</a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`US4-settings-container ${darkMode ? 'US4-dark-mode' : ''}`}>
      <div className="US4-settings-header">
        <h2 className="US4-settings-title">Account Settings</h2>
        <p className="US4-settings-subtitle">Manage your account preferences and settings</p>
      </div>
      
      <div className="US4-settings-content">
        <div className="US4-settings-sidebar">
          <div className="US4-settings-profile-preview">
            <div className="US4-settings-avatar">
              <img src= {profileImageFile} alt="Profile" className="US4-settings-avatar-img" />
              <div className="US4-settings-avatar-edit">
                <span className="US4-settings-avatar-edit-icon">+</span>
              </div>
            </div>
            <div className="US4-settings-profile-info">
              <h3 className="US4-settings-profile-name">John Doe</h3>
              <p className="US4-settings-profile-email">john.doe@example.com</p>
            </div>
          </div>
          
          <nav className="US4-settings-navigation">
            <button 
              className={`US4-settings-nav-item ${activeTab === 'account' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={18} className="US4-settings-nav-icon" />
              <span>Account</span>
            </button>
            <button 
              className={`US4-settings-nav-item ${activeTab === 'notifications' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} className="US4-settings-nav-icon" />
              <span>Notifications</span>
            </button>
            <button 
              className={`US4-settings-nav-item ${activeTab === 'appearance' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Moon size={18} className="US4-settings-nav-icon" />
              <span>Appearance</span>
            </button>
            <button 
              className={`US4-settings-nav-item ${activeTab === 'privacy' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <Shield size={18} className="US4-settings-nav-icon" />
              <span>Privacy & Security</span>
            </button>
            <button 
              className={`US4-settings-nav-item ${activeTab === 'language' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              <Globe size={18} className="US4-settings-nav-icon" />
              <span>Language & Region</span>
            </button>
            <button 
              className={`US4-settings-nav-item ${activeTab === 'help' ? 'US4-active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <HelpCircle size={18} className="US4-settings-nav-icon" />
              <span>Help & Support</span>
            </button>
            <button className="US4-settings-nav-item US4-settings-logout">
              <LogOut size={18} className="US4-settings-nav-icon" />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
        
        <div className="US4-settings-main">
          {renderTabContent()}
          
          <div className="US4-settings-actions">
            <button className="US4-settings-button US4-settings-cancel-button">Cancel</button>
            <button className="US4-settings-button US4-settings-save-button" onClick={handleSaveChanges}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;