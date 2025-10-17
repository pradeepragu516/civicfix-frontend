import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, AlertTriangle, Bell, Shield, Database, Eye, BarChart2, HelpCircle, Save } from 'lucide-react';
import './Setting.css';

const SettingsPage = () => {
  // State for various settings
  const [activeTab, setActiveTab] = useState('general');
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    issueUpdates: true,
    fundingAlerts: true,
    weeklyReports: false
  });
  
  const [transparencySettings, setTransparencySettings] = useState({
    showDonorNames: true,
    showExpenditureDetails: true,
    publicProjectTimeline: true,
    displayVolunteerHours: true,
    showIssueReporterNames: false,
    displayAdminActions: true
  });
  
  const [systemSettings, setSystemSettings] = useState({
    autoAssignVolunteers: false,
    priorityCalculationMethod: 'votes',
    issueExpiryDays: 30,
    requireApproval: true,
    autoArchive: true,
    dataRetentionMonths: 24
  });

  const [savedMessage, setSavedMessage] = useState('');

  // Handle saving settings
  const saveSettings = (settingType) => {
    // In a real app, this would save to a backend
    console.log(`Saving ${settingType} settings...`);
    
    // Show saved message
    setSavedMessage(`${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings saved successfully!`);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  // Toggle notification settings
  const toggleNotification = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };

  // Toggle transparency settings
  const toggleTransparency = (setting) => {
    setTransparencySettings({
      ...transparencySettings,
      [setting]: !transparencySettings[setting]
    });
  };

  // Handle system setting changes
  const handleSystemSettingChange = (setting, value) => {
    setSystemSettings({
      ...systemSettings,
      [setting]: value
    });
  };

  return (
    <div className="settings-container2">
      <div className="settings-header">
        <h1><Settings className="header-icon" /> Admin Settings</h1>
        <p>Configure system settings and transparency options for your panchayat portal</p>
      </div>

      {savedMessage && (
        <div className="save-message">
          <p>{savedMessage}</p>
        </div>
      )}

      <div className="settings-content">
        <div className="settings-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Settings size={20} />
            <span>General</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'transparency' ? 'active' : ''}`}
            onClick={() => setActiveTab('transparency')}
          >
            <Eye size={20} />
            <span>Transparency</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>User Management</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={20} />
            <span>Reports</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={20} />
            <span>Security</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Database size={20} />
            <span>Data Management</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={20} />
            <span>Analytics</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </div>
        </div>

        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="setting-card">
                <h3>System Configuration</h3>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Panchayat Name</label>
                    <input type="text" defaultValue="Gram Panchayat Sundarpur" className="form-control" />
                  </div>
                  <div className="setting-item">
                    <label>Admin Contact Email</label>
                    <input type="email" defaultValue="admin@sundarpur.gov.in" className="form-control" />
                  </div>
                </div>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Language</label>
                    <select className="form-control">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="bn">Bengali</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Time Zone</label>
                    <select className="form-control">
                      <option value="IST">India Standard Time (IST)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Fiscal Year Start</label>
                    <input type="date" defaultValue="2025-04-01" className="form-control" />
                  </div>
                  <div className="setting-item">
                    <label>Currency</label>
                    <select className="form-control">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3>System Behavior</h3>
                <div className="setting-row">
                  <div className="setting-label">Auto-assign volunteers to issues</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={systemSettings.autoAssignVolunteers}
                        onChange={() => handleSystemSettingChange('autoAssignVolunteers', !systemSettings.autoAssignVolunteers)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Priority calculation method</div>
                  <div className="setting-control">
                    <select 
                      className="form-control" 
                      value={systemSettings.priorityCalculationMethod}
                      onChange={(e) => handleSystemSettingChange('priorityCalculationMethod', e.target.value)}
                    >
                      <option value="votes">By Number of Votes</option>
                      <option value="impact">By Impact Assessment</option>
                      <option value="cost">By Cost-Benefit Ratio</option>
                      <option value="manual">Manual Assignment</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Issue expiry days</div>
                  <div className="setting-control">
                    <input 
                      type="number" 
                      className="form-control" 
                      value={systemSettings.issueExpiryDays}
                      onChange={(e) => handleSystemSettingChange('issueExpiryDays', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Require admin approval for all expense reports</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={systemSettings.requireApproval}
                        onChange={() => handleSystemSettingChange('requireApproval', !systemSettings.requireApproval)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings('general')}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="setting-card">
                <h3>Admin Notifications</h3>
                <div className="setting-row">
                  <div className="setting-label">Email Alerts</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.emailAlerts}
                        onChange={() => toggleNotification('emailAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">SMS Alerts</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.smsAlerts}
                        onChange={() => toggleNotification('smsAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Push Notifications</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.pushNotifications}
                        onChange={() => toggleNotification('pushNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3>Notification Types</h3>
                <div className="setting-row">
                  <div className="setting-label">New Issue Reports</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.issueUpdates}
                        onChange={() => toggleNotification('issueUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Funding Allocation Alerts</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.fundingAlerts}
                        onChange={() => toggleNotification('fundingAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Weekly Summary Reports</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.weeklyReports}
                        onChange={() => toggleNotification('weeklyReports')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings('notification')}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'transparency' && (
            <div className="settings-section">
              <h2>Transparency Settings</h2>
              <div className="setting-card">
                <h3>Public Information Display</h3>
                <div className="setting-row">
                  <div className="setting-label">Show donor names in financial reports</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.showDonorNames}
                        onChange={() => toggleTransparency('showDonorNames')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Show detailed expenditure breakdown</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.showExpenditureDetails}
                        onChange={() => toggleTransparency('showExpenditureDetails')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Display public project timeline</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.publicProjectTimeline}
                        onChange={() => toggleTransparency('publicProjectTimeline')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Show volunteer contribution hours</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.displayVolunteerHours}
                        onChange={() => toggleTransparency('displayVolunteerHours')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Display issue reporter names</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.showIssueReporterNames}
                        onChange={() => toggleTransparency('showIssueReporterNames')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Log and display admin actions</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input 
                        type="checkbox" 
                        checked={transparencySettings.displayAdminActions}
                        onChange={() => toggleTransparency('displayAdminActions')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3>Financial Transparency</h3>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Default Budget Display Format</label>
                    <select className="form-control">
                      <option value="categoryBased">Category-based Breakdown</option>
                      <option value="projectBased">Project-based Allocation</option>
                      <option value="timeline">Timeline View</option>
                      <option value="comparison">Year-to-Year Comparison</option>
                    </select>
                  </div>
                  <div className="setting-item">
                    <label>Budget Update Frequency</label>
                    <select className="form-control">
                      <option value="realtime">Real-time Updates</option>
                      <option value="daily">Daily Updates</option>
                      <option value="weekly">Weekly Updates</option>
                      <option value="monthly">Monthly Updates</option>
                    </select>
                  </div>
                </div>
                <div className="setting-group">
                  <div className="setting-item">
                    <label>Mandatory Fields for Expense Reports</label>
                    <div className="checkbox-group">
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked /> Receipt/Invoice
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked /> Project ID
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked /> Expense Category
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" /> Beneficiary Count
                      </label>
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked /> Approval Chain
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings('transparency')}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="settings-section">
              <h2>User Management</h2>
              <div className="setting-card">
                <h3>User Permissions</h3>
                <p className="setting-description">Configure role-based access controls for different user types</p>
                
                <div className="user-roles-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Permission</th>
                        <th>Admin</th>
                        <th>Moderator</th>
                        <th>Finance Officer</th>
                        <th>Volunteer</th>
                        <th>Citizen</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>View Issues</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked disabled /></td>
                      </tr>
                      <tr>
                        <td>Create Issues</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" checked /></td>
                      </tr>
                      <tr>
                        <td>Edit Issues</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                      <tr>
                        <td>Assign Volunteers</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                      <tr>
                        <td>View Financial Data</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" checked /></td>
                      </tr>
                      <tr>
                        <td>Edit Financial Data</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                      <tr>
                        <td>Approve Expenses</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                      <tr>
                        <td>Access Reports</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" checked /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                      <tr>
                        <td>System Settings</td>
                        <td><input type="checkbox" checked disabled /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                        <td><input type="checkbox" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="setting-card">
                <h3>User Registration</h3>
                <div className="setting-row">
                  <div className="setting-label">Require email verification</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Allow self-registration</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Require address verification</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Identity verification method</div>
                  <div className="setting-control">
                    <select className="form-control">
                      <option value="none">None</option>
                      <option value="aadhaar">Aadhaar Verification</option>
                      <option value="voterID">Voter ID</option>
                      <option value="manual">Manual Admin Verification</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings('user')}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data Management</h2>
              <div className="setting-card">
                <h3>Data Retention</h3>
                <div className="setting-row">
                  <div className="setting-label">Auto-archive resolved issues after</div>
                  <div className="setting-control">
                    <select 
                      className="form-control"
                      value={systemSettings.dataRetentionMonths}
                      onChange={(e) => handleSystemSettingChange('dataRetentionMonths', parseInt(e.target.value))}
                    >
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="36">36 months</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Enable automatic data backup</div>
                  <div className="setting-control">
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Backup frequency</div>
                  <div className="setting-control">
                    <select className="form-control">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="setting-card">
                <h3>Data Export Options</h3>
                <div className="data-export-options">
                  <button className="export-button">
                    <span>Export Financial Records</span>
                  </button>
                  <button className="export-button">
                    <span>Export User Database</span>
                  </button>
                  <button className="export-button">
                    <span>Export Issue Reports</span>
                  </button>
                  <button className="export-button">
                    <span>Export System Logs</span>
                  </button>
                </div>
                <div className="setting-row">
                  <div className="setting-label">Default export format</div>
                  <div className="setting-control">
                    <select className="form-control">
                      <option value="csv">CSV</option>
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings('data')}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {(activeTab === 'reports' || activeTab === 'security' || activeTab === 'analytics' || activeTab === 'help') && (
            <div className="settings-section">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h2>
              <div className="setting-card">
                <p>Configure {activeTab} settings for your panchayat portal.</p>
                <div className="placeholder-content">
                  <p>This section is under development. Additional {activeTab} configuration options will be available soon.</p>
                </div>
              </div>

              <button className="save-button" onClick={() => saveSettings(activeTab)}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;