import React, { useState, useRef } from 'react';
import { Camera, Edit2, Save, X, Mail, Phone, MapPin, Briefcase, Calendar, Shield, FileText, Folder, CheckCircle, Star, DollarSign, AlertTriangle } from 'lucide-react';
import './Profile.css';
import profileImageFile from '../../assets/pradeep.jpg'; // Adjust the path as necessary

const API = "http://localhost:5000";


const Profile = () => {
  // Sample admin data - replace with your actual data source
  const [profileData, setProfileData] = useState({
    name: 'Pradeep M',
    role: 'Project Administrator',
    email: 'Pradeep.ragu@gmail.com',
    phone: '+91 8807802256',
    location: 'Pollachi ,Coimbatore, Tamilnadu, India',
    department: 'Management',
    joinDate: 'June 16, 2010',
    accessLevel: 'CEO'
  });

  // State for controlling edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...profileData});
  
  // State for profile image
  const [profileImage, setProfileImage] = useState(profileImageFile);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef(null);

  // Handler for image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Prepare form data
        const formData = new FormData();
        formData.append('image', file);

        // Get user ID and token from localStorage or context (adjust as needed)
        const userId = localStorage.getItem('userId'); // Adjust if stored differently
        const token = localStorage.getItem('token'); // Adjust if stored differently

        if (!userId || !token) {
          alert('User not authenticated');
          return;
        }

        // Upload image to backend API
        const response = await fetch(`${API}/api/user/${userId}/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert('Image upload failed: ' + (errorData.error || 'Unknown error'));
          return;
        }

        const data = await response.json();
        setProfileImage(data.imageUrl);
        setShowImageOptions(false);
      } catch (error) {
        alert('Error uploading image: ' + error.message);
      }
    }
  };

  // Handler for edit form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  // Save profile changes
  const saveChanges = () => {
    setProfileData({...editedData});
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditedData({...profileData});
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your account information and settings</p>
      </div>

      <div className="profile-content">
        {/* Left side - Profile Image */}
        <div className="profile-image-section">
          <div 
            className="profile-image-container"
            onMouseEnter={() => setShowImageOptions(true)}
            onMouseLeave={() => setShowImageOptions(false)}
          >
            <img 
              src={profileImage} 
              alt="Profile" 
              className="profile-image" 
            />
            
            {showImageOptions && (
              <div className="image-options">
                <button 
                  className="image-option-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera size={20} />
                  <span>Change Photo</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          <div className="profile-image-info">
            <h2>{profileData.name}</h2>
            <span className="role-badge">{profileData.role}</span>
          </div>
          

        </div>

        {/* Right side - Profile Details */}
        <div className="profile-details-section">
          <div className="section-header">
            <h2>Admin Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={saveChanges}>
                  <Save size={16} />
                  Save
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={editedData.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={editedData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={editedData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={editedData.location} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={editedData.department} 
                    onChange={handleInputChange} 
                  />
                </div>

              </div>
            ) : (
              <>
                <div className="info-list">
                  <div className="info-item">
                    <div className="info-icon">
                      <Mail size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">{profileData.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Phone size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{profileData.phone}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Location</span>
                      <span className="info-value">{profileData.location}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Briefcase size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Department</span>
                      <span className="info-value">{profileData.department}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Calendar size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Join Date</span>
                      <span className="info-value">{profileData.joinDate}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Shield size={18} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Access Level</span>
                      <span className="info-value">{profileData.accessLevel}</span>
                    </div>
                  </div>
                </div>
                
                <div className="section-divider"></div>
                
                <div className="section-header" style={{ marginTop: '24px' }}>
                  <h2>Transparency Dashboard</h2>
                </div>
                
                <div className="transparency-metrics-wrapper">
                  <div className="transparency-metrics">
                    <div className="metric-card">
                      <div className="metric-header">
                        <DollarSign size={20} />
                        <h3>Funds Oversight</h3>
                      </div>
                      <div className="metric-content">
                        <div className="metric-stat">
                          <span className="metric-value">$2.8M</span>
                          <span className="metric-label">Total Managed</span>
                        </div>
                        <div className="metric-stat">
                          <span className="metric-value">32</span>
                          <span className="metric-label">Active Projects</span>
                        </div>
                        <div className="metric-progress">
                          <div className="progress-label">
                            <span>Allocation Efficiency</span>
                            <span>94%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '94%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-header">
                        <AlertTriangle size={20} />
                        <h3>Issue Management</h3>
                      </div>
                      <div className="metric-content">
                        <div className="metric-stat">
                          <span className="metric-value">178</span>
                          <span className="metric-label">Current Issues</span>
                        </div>
                        <div className="metric-stat">
                          <span className="metric-value">86%</span>
                          <span className="metric-label">Resolution Rate</span>
                        </div>
                        <div className="metric-progress">
                          <div className="progress-label">
                            <span>Response Time</span>
                            <span>24h</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '88%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;