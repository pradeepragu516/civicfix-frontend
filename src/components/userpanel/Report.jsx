import React, { useState, useRef, useEffect } from "react";
import "./Report.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt, FaFileAlt, FaExclamationTriangle, FaCheck, FaTimes, FaCloudUploadAlt, FaCrosshairs } from 'react-icons/fa';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Location Picker
const LocationPicker = ({ onLocationSelected }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelected({ lat, lng });
    },
  });
  return null;
};

const Report = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    wardNumber: "",
    category: "",
    urgency: "medium",
    contactName: "",
    contactPhone: "",
    contactEmail: ""
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);

  const categories = [
    "Road Damage", 
    "Garbage Collection", 
    "Street Lighting",
    "Water Supply",
    "Drainage Issues",
    "Public Property Damage",
    "Illegal Construction",
    "Stray Animals",
    "Other"
  ];

  // Get user's current location initially
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setZoom(15);
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { timeout: 10000 }
      );
    }
  }, []);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 3) {
        alert("You can upload up to 3 images only.");
        return;
      }

      const newImages = [];
      const newPreviewUrls = [];

      filesArray.forEach(file => {
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} exceeds 5MB limit.`);
          return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert(`File ${file.name} is not a supported format. Use JPG, PNG, or WEBP.`);
          return;
        }

        newImages.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      });

      setImages(prev => [...prev, ...newImages]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelected = (location) => {
    setPosition([location.lat, location.lng]);
    setFormData(prev => ({
      ...prev,
      location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setZoom(15);
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          alert("Error getting location. Please try again or select manually.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.title || !formData.description || !formData.category || !formData.wardNumber || !position) {
        throw new Error("Please fill all required fields and select a location.");
      }

      // Convert images to base64
      const base64Images = await Promise.all(
        images.map(file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }))
      );

      const payload = {
        title: formData.title,
        description: formData.description,
        wardNumber: formData.wardNumber,
        category: formData.category,
        urgency: formData.urgency,
        location: JSON.stringify({
          type: "Point",
          coordinates: [position[1], position[0]], // [lng, lat]
          address: formData.location
        }),
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        images: base64Images
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authentication required. Please login.");
      }

      await axios.post('/api/reports', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setSubmitted(true);

      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          location: "",
          wardNumber: "",
          category: "",
          urgency: "medium",
          contactName: "",
          contactPhone: "",
          contactEmail: ""
        });
        setImages([]);
        setPreviewUrls([]);
        setPosition(null);
        setSubmitting(false);
        setSubmitted(false);
        navigate('/dashboard/myreports');
      }, 3000);

    } catch (error) {
      console.error("Error submitting report:", error);
      setError(error.response?.data?.error || error.message || "Failed to submit report.");
      setSubmitting(false);
    }
  };

  const urgencyOptions = [
    { value: "low", label: "Low", className: "urgency-low" },
    { value: "medium", label: "Medium", className: "urgency-medium" },
    { value: "high", label: "High", className: "urgency-high" },
    { value: "critical", label: "Critical", className: "urgency-critical" }
  ];

  if (submitted) {
    return (
      <div className="report-container">
        <div className="success-message">
          <div className="success-icon">
            <FaCheck />
          </div>
          <h2>Report Submitted Successfully!</h2>
          <p>Thank you for helping improve our community. Your report has been received and will be addressed by our team.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn primary-btn"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h1>Report an Issue</h1>
        <p>Help us improve your ward by reporting issues you encounter</p>
      </div>
      
      {error && (
        <div className="error-message">
          <FaTimes className="error-icon" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="report-form">
        {/* Issue Details Section */}
        <div className="form-section">
          <h2 className="section-title">
            <FaExclamationTriangle className="section-icon" />
            Issue Details
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">
                Issue Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title of the issue"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide a detailed description of the issue"
                rows={4}
                required
              />
            </div>
          </div>
          
          <div className="urgency-selector">
            <p className="form-label">
              Urgency Level <span className="required">*</span>
            </p>
            <div className="urgency-options">
              {urgencyOptions.map((option) => (
                <label key={option.value} className="urgency-option">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={formData.urgency === option.value}
                    onChange={handleChange}
                    className="visually-hidden"
                  />
                  <span 
                    className={`urgency-badge ${option.className} ${
                      formData.urgency === option.value ? "selected" : ""
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <div className="form-section">
          <h2 className="section-title">
            <FaMapMarkerAlt className="section-icon" />
            Location Information
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="wardNumber">
                Ward Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="wardNumber"
                name="wardNumber"
                value={formData.wardNumber}
                onChange={handleChange}
                placeholder="Enter ward number"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">
                Specific Location <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Street name, landmark, or coordinates"
                required
              />
            </div>
          </div>
          
          {/* Map Integration with Leaflet */}
          <div className="map-container">
            <div className="map-controls">
              <button 
                type="button" 
                className="locate-btn"
                onClick={getCurrentLocation}
                title="Use my current location"
              >
                <FaCrosshairs />
                <span>My Location</span>
              </button>
              <p className="map-instructions">
                Click on the map to pinpoint the exact location of the issue
              </p>
            </div>
            
            <div className="leaflet-map">
              <MapContainer 
                center={mapCenter} 
                zoom={zoom} 
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                key={`${mapCenter[0]}-${mapCenter[1]}-${zoom}`}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <LocationPicker onLocationSelected={handleLocationSelected} />
                
                {position && (
                  <Marker position={position}>
                    <Popup>
                      Issue location<br />
                      {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            
            {position && (
              <div className="selected-location-info">
                <FaMapMarkerAlt />
                <span>Selected Location: {position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Image Upload Section */}
        <div className="form-section">
          <h2 className="section-title">
            <FaCamera className="section-icon" />
            Upload Images
          </h2>
          
          <div className="image-upload-area">
            <p className="upload-instructions">
              Upload up to 3 images that clearly show the issue (Max 5MB each)
            </p>
            
            <div 
              onClick={() => fileInputRef.current.click()}
              className="upload-dropzone"
            >
              <FaCloudUploadAlt className="upload-icon" />
              <p className="upload-text">Click to upload or drag and drop</p>
              <p className="upload-formats">Supported formats: JPG, PNG, WEBP</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="visually-hidden"
              />
            </div>
          </div>
          
          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="image-previews">
              {previewUrls.map((url, index) => (
                <div key={index} className="image-preview-container">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Contact Details Section */}
        <div className="form-section">
          <h2 className="section-title">
            <FaFileAlt className="section-icon" />
            Contact Information
          </h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contactName">Your Name</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactPhone">Phone Number</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Your contact number"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="contactEmail">Email Address</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="Your email address"
              />
              <p className="field-note">
                We'll only contact you for updates on this report or if more information is needed
              </p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={submitting}
            className={`btn submit-btn ${submitting ? "disabled" : ""}`}
          >
            {submitting ? (
              <>
                <div className="spinner"></div>
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Report;