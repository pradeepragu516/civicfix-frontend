import React, { useState, useRef, useEffect } from 'react';
import { Camera, Edit2, Save, X, Mail, Phone, MapPin, Briefcase, Calendar, User, FileText, Home, Map } from 'lucide-react';
import './Profiles.css';

const UserProfile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'User',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    panchayat: '',
    wardNumber: '',
    occupation: '',
    organization: '',
    joinDate: '',
    idType: '',
    idNumber: '',
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...profileData });
  const [activeSection, setActiveSection] = useState('personal');
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (userId && token) {
      setIsLoggedIn(true);
      fetchUserData(userId, token);
    } else {
      console.error('Authentication missing: userId or token not found in localStorage', { userId, token });
      setError('Please log in to view your profile.');
    }
  }, []);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const userData = {
          name: data.name || '',
          role: data.role || 'User',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pincode || '',
          panchayat: data.panchayat || '',
          wardNumber: data.wardNumber || '',
          occupation: data.occupation || '',
          organization: data.organization || '',
          joinDate: data.joinDate ? new Date(data.joinDate).toLocaleDateString() : '',
          idType: data.idType || '',
          idNumber: data.idNumber || '',
          profileImage: data.profileImage || ''
        };
        setProfileData(userData);
        setEditedData(userData);
        setProfileImage(userData.profileImage || null);
      } else {
        console.error('Error fetching user data:', data.error, { status: response.status, data });
        setError(`Failed to fetch profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Network or client error fetching user data:', error.message);
      setError(`Failed to fetch profile data: ${error.message}`);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit to 2MB
        alert('Image size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        try {
          const response = await fetch(`http://localhost:5000/api/user/${userId}/upload-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: base64Image })
          });
          const data = await response.json();
          if (response.ok) {
            setProfileImage(data.imageUrl);
            setEditedData({ ...editedData, profileImage: data.imageUrl });
            setShowImageOptions(false);
          } else {
            alert(`Failed to upload image: ${data.error}`);
          }
        } catch (error) {
          alert(`Error uploading image: ${error.message}`);
        }
      };
      reader.onerror = () => {
        alert('Error reading image file.');
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({ ...editedData, [name]: value });
  };

  const saveChanges = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      console.error('Authentication missing: userId or token not found in localStorage', { userId, token });
      setError('Please log in to save changes.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedData.email && !emailRegex.test(editedData.email)) {
      setError('Invalid email format.');
      return;
    }

    // Validate required fields
    if (!editedData.name || !editedData.email) {
      setError('Name and email are required.');
      return;
    }

    // Prepare data to send to backend
    const dataToSend = { ...editedData };

    try {
      console.log('Sending PUT request to:', `http://localhost:5000/api/user/${userId}`);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      console.log('Request body:', dataToSend);

      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      if (response.ok) {
        setProfileData({ ...editedData });
        setIsEditing(false);
        setError(null);
        alert('Profile updated successfully!');
      } else {
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error
        });
        setError(`Failed to save profile: ${data.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Network or client error saving profile data:', error.message);
      setError(`Failed to save profile data: ${error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditedData({ ...profileData });
    setProfileImage(profileData.profileImage || null);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="US8-profile-container">
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <div className="US8-profile-header">
        <h1>User Profile</h1>
        <p>Manage your account information and settings</p>
      </div>
      <div className="US8-profile-content">
        <div className="US8-profile-image-section">
          <div 
            className="US8-profile-image-container"
            onMouseEnter={() => setShowImageOptions(true)}
            onMouseLeave={() => setShowImageOptions(false)}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="US8-profile-image" 
              />
            ) : (
              <div className="US8-profile-image-placeholder">
                <User size={50} />
              </div>
            )}
            {showImageOptions && (
              <div className="US8-image-options">
                <button 
                  className="US8-image-option-btn"
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
          <div className="US8-profile-image-info">
            <h2>{profileData.name}</h2>
            <span className="US8-role-badge">{profileData.role}</span>
          </div>
        </div>
        <div className="US8-profile-details-section">
          <div className="US8-section-header">
            <h2>User Information</h2>
            {!isEditing ? (
              <button className="US8-edit-btn" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="US8-edit-actions">
                <button className="US8-save-btn" onClick={saveChanges}>
                  <Save size={16} />
                  Save
                </button>
                <button className="US8-cancel-btn" onClick={cancelEdit}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="US8-profile-tabs">
            <button 
              className={`US8-tab-btn ${activeSection === 'personal' ? 'US8-active-tab' : ''}`}
              onClick={() => setActiveSection('personal')}
            >
              <User size={16} />
              Personal
            </button>
            <button 
              className={`US8-tab-btn ${activeSection === 'location' ? 'US8-active-tab' : ''}`}
              onClick={() => setActiveSection('location')}
            >
              <MapPin size={16} />
              Location
            </button>
            <button 
              className={`US8-tab-btn ${activeSection === 'professional' ? 'US8-active-tab' : ''}`}
              onClick={() => setActiveSection('professional')}
            >
              <Briefcase size={16} />
              Professional
            </button>
            <button 
              className={`US8-tab-btn ${activeSection === 'account' ? 'US8-active-tab' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              <FileText size={16} />
              Account
            </button>
          </div>
          <div className="US8-profile-details">
            {isEditing ? (
              <div className="US8-edit-form">
                {activeSection === 'personal' && (
                  <>
                    <div className="US8-form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={editedData.name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Email Address</label>
                      <input 
                        type="email"
                        name="email" 
                        value={editedData.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={editedData.phone} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Date of Birth</label>
                      <input 
                        type="text" 
                        name="dateOfBirth" 
                        value={editedData.dateOfBirth} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Gender</label>
                      <select 
                        name="gender" 
                        value={editedData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </>
                )}
                {activeSection === 'location' && (
                  <>
                    <div className="US8-form-group">
                      <label>Address</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={editedData.address} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>City/Town</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={editedData.city} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>District</label>
                      <input 
                        type="text" 
                        name="district" 
                        value={editedData.district} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={editedData.state} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Pincode</label>
                      <input 
                        type="text" 
                        name="pincode" 
                        value={editedData.pincode} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Panchayat</label>
                      <input 
                        type="text" 
                        name="panchayat" 
                        value={editedData.panchayat} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Ward Number</label>
                      <input 
                        type="text" 
                        name="wardNumber" 
                        value={editedData.wardNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                )}
                {activeSection === 'professional' && (
                  <>
                    <div className="US8-form-group">
                      <label>Occupation</label>
                      <input 
                        type="text" 
                        name="occupation" 
                        value={editedData.occupation} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>Organization</label>
                      <input 
                        type="text" 
                        name="organization" 
                        value={editedData.organization} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                )}
                {activeSection === 'account' && (
                  <>
                    <div className="US8-form-group">
                      <label>Join Date</label>
                      <input 
                        type="text" 
                        name="joinDate" 
                        value={editedData.joinDate} 
                        disabled
                      />
                    </div>
                    <div className="US8-form-group">
                      <label>ID Type</label>
                      <select 
                        name="idType" 
                        value={editedData.idType}
                        onChange={handleInputChange}
                      >
                        <option value="Aadhar Card">Aadhar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div className="US8-form-group">
                      <label>ID Number</label>
                      <input 
                        type="text" 
                        name="idNumber" 
                        value={editedData.idNumber} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="US8-info-list">
                {activeSection === 'personal' && (
                  <>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Mail size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Email</span>
                        <span className="US8-info-value">{profileData.email}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Phone size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Phone</span>
                        <span className="US8-info-value">{profileData.phone}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Date of Birth</span>
                        <span className="US8-info-value">{profileData.dateOfBirth}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <User size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Gender</span>
                        <span className="US8-info-value">{profileData.gender}</span>
                      </div>
                    </div>
                  </>
                )}
                {activeSection === 'location' && (
                  <>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Home size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Address</span>
                        <span className="US8-info-value">{profileData.address}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">City/Town</span>
                        <span className="US8-info-value">{profileData.city}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Map size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">District</span>
                        <span className="US8-info-value">{profileData.district}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">State</span>
                        <span className="US8-info-value">{profileData.state}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <FileText size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Pincode</span>
                        <span className="US8-info-value">{profileData.pincode}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Home size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Panchayat</span>
                        <span className="US8-info-value">{profileData.panchayat}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <FileText size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Ward Number</span>
                        <span className="US8-info-value">{profileData.wardNumber}</span>
                      </div>
                    </div>
                  </>
                )}
                {activeSection === 'professional' && (
                  <>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Briefcase size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Occupation</span>
                        <span className="US8-info-value">{profileData.occupation}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Briefcase size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Organization</span>
                        <span className="US8-info-value">{profileData.organization}</span>
                      </div>
                    </div>
                  </>
                )}
                {activeSection === 'account' && (
                  <>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">Join Date</span>
                        <span className="US8-info-value">{profileData.joinDate}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <FileText size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">ID Type</span>
                        <span className="US8-info-value">{profileData.idType}</span>
                      </div>
                    </div>
                    <div className="US8-info-item">
                      <div className="US8-info-icon">
                        <FileText size={18} />
                      </div>
                      <div className="US8-info-content">
                        <span className="US8-info-label">ID Number</span>
                        <span className="US8-info-value">{profileData.idNumber}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;