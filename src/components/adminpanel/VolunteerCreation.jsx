import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VolunteerCreation.css';

const VolunteerCreation = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    specializedFields: [],
    availability: '',
    contact: '',
  });
  const [deleteVolunteerId, setDeleteVolunteerId] = useState(null);

  const repairCategories = [
    { name: 'Electrical', icon: '⚡️', fields: ['Wiring Repair', 'Light Fixture Installation', 'Circuit Breaker Issues', 'Generator Maintenance'] },
    { name: 'Plumbing', icon: '🚰', fields: ['Pipe Repair', 'Drainage Issues', 'Water Supply', 'Fixture Installation'] },
    { name: 'Road Repair', icon: '🛣️', fields: ['Pothole Fixing', 'Sidewalk Repair', 'Street Sign Installation', 'Road Marking'] },
    { name: 'Construction', icon: '🏗️', fields: ['Wall Repair', 'Foundation Work', 'Structural Support', 'Building Enhancement'] },
    { name: 'Carpentry', icon: '🪚', fields: ['Woodwork Repair', 'Furniture Making', 'Door Installation', 'Cabinet Work'] },
    { name: 'Garbage Clean', icon: '🗑️', fields: ['Trash Collection', 'Street Sweeping', 'Recycling Pickup', 'Waste Disposal'] },
  ];

  // Fetch all volunteers
  const fetchVolunteers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/volunteers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Open modal for creating or editing a volunteer
  const openModal = (volunteer = null) => {
    setSelectedVolunteer(volunteer);
    setFormData(
      volunteer
        ? { ...volunteer }
        : { name: '', skills: [], specializedFields: [], availability: '', contact: '' }
    );
    setIsModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for skills and specialized fields
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const updatedField = prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value];
      return { ...prev, [field]: updatedField };
    });
  };

  // Submit form for creating or updating a volunteer
// In handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');

  const url = selectedVolunteer
    ? `${import.meta.env.VITE_API_BASE_URL}/api/volunteers/${selectedVolunteer._id}`
    : `${import.meta.env.VITE_API_BASE_URL}/api/volunteers`;
  const method = selectedVolunteer ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Changed to adminToken
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to save volunteer');

    setSuccessMessage(selectedVolunteer ? 'Volunteer updated successfully!' : 'Volunteer created successfully!');
    setIsModalOpen(false);
    fetchVolunteers();

    if (!selectedVolunteer) {
      setTimeout(() => navigate('/adminDashboard/volunteers', { state: { issue: location.state?.issue } }), 1000);
    }
  } catch (err) {
    setError(err.message);
  }
};

  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    setDeleteVolunteerId(id);
    setIsDeleteModalOpen(true);
  };

  // Delete a volunteer
  const handleDelete = async () => {
    try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/volunteers/${deleteVolunteerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });

      if (!response.ok) throw new Error('Failed to delete volunteer');
      setSuccessMessage('Volunteer deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchVolunteers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="volunteer-management-container1">
      <div className="volunteer-management-tab1">
        <div className="tab-header1">
          <h2>Volunteer Management</h2>
          <button className="add-volunteer-button1" onClick={() => openModal()}>
            <span>➕</span> Add Volunteer
          </button>
        </div>

        {error && (
          <div className="error-message1">
            <span>⚠️</span> {error}
          </div>
        )}
        {successMessage && (
          <div className="success-message1">
            <span>✅</span> {successMessage}
          </div>
        )}

        <div className="volunteer-database-list1">
          {volunteers.length === 0 ? (
            <p className="no-volunteers1">No volunteers available.</p>
          ) : (
            volunteers.map((volunteer) => (
              <div key={volunteer._id} className="volunteer-database-card1">
                <div className="volunteer-card-header1">
                  <h3>{volunteer.name}</h3>
                  <div className="volunteer-actions1">
                    <button className="edit-button1" onClick={() => openModal(volunteer)}>
                      ✏️
                    </button>
                    <button className="delete-button1" onClick={() => openDeleteModal(volunteer._id)}>
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="volunteer-card-body1">
                  <p><strong>Skills:</strong> {volunteer.skills.join(', ')}</p>
                  <p><strong>Specialized Fields:</strong> {volunteer.specializedFields.length > 0 ? volunteer.specializedFields.join(', ') : 'None'}</p>
                  <p><strong>Availability:</strong> {volunteer.availability}</p>
                  <p><strong>Contact:</strong> {volunteer.contact}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Volunteer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="volunteer-modal">
            <div className="modal-header">
              <h2>{selectedVolunteer ? 'Edit Volunteer' : 'Add Volunteer'}</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Skills</label>
                  <div className="checkbox-group">
                    {repairCategories.map((category) => (
                      <label key={category.name} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(category.name)}
                          onChange={() => handleCheckboxChange('skills', category.name)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="specialized-field-group">
                  <h4>Specialized Fields</h4>
                  <div className="checkbox-group">
                    {repairCategories.flatMap((category) =>
                      category.fields.map((field) => (
                        <label key={field} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.specializedFields.includes(field)}
                            onChange={() => handleCheckboxChange('specializedFields', field)}
                          />
                          {field}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {selectedVolunteer ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="confirm-delete-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="close-button" onClick={() => setIsDeleteModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this volunteer?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerCreation;