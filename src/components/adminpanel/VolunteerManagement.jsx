import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Wrench, Check, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './VolunteerManagement.css';

const API = "http://localhost:5000";


const VolunteerManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [issue, setIssue] = useState(location.state?.issue || null); // Use state for issue
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [mainVolunteer, setMainVolunteer] = useState('');
  const [subVolunteersCount, setSubVolunteersCount] = useState(0);
  const [workDescription, setWorkDescription] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [volunteerCompleted, setVolunteerCompleted] = useState(false);
  const [volunteerNotes, setVolunteerNotes] = useState('');
  const [volunteers, setVolunteers] = useState([]);

  const repairCategories = [
    { id: 1, name: 'Electrical', icon: '⚡', color: '#FFD700' },
    { id: 2, name: 'Plumbing', icon: '🔧', color: '#4169E1' },
    { id: 3, name: 'Road Repair', icon: '🛣️', color: '#696969' },
    { id: 4, name: 'Construction', icon: '🏗️', color: '#FF8C00' },
    { id: 5, name: 'Carpentry', icon: '🪚', color: '#8B4513' },
    { id: 6, name: 'Garbage Clean', icon: '🗑️', color: '#228B22' },
  ];

  const repairFields = {
    Electrical: ['Wiring Repair', 'Light Fixture Installation', 'Circuit Breaker Issues', 'Generator Maintenance'],
    Plumbing: ['Pipe Repair', 'Drainage Issues', 'Water Supply', 'Fixture Installation'],
    'Road Repair': ['Pothole Fixing', 'Sidewalk Repair', 'Street Sign Installation', 'Road Marking'],
    Construction: ['Wall Repair', 'Foundation Work', 'Structural Support', 'Building Enhancement'],
    Carpentry: ['Woodwork Repair', 'Furniture Making', 'Door Installation', 'Cabinet Work'],
    'Garbage Clean': ['Trash Collection', 'Street Sweeping', 'Recycling Pickup', 'Waste Disposal'],
  };

  useEffect(() => {
    const fetchIssue = async () => {
      if (!issue) {
        try {
          const token = localStorage.getItem('adminToken');
          if (!token) {
            setError('Please login to fetch report data');
            return;
          }

          const issueId = new URLSearchParams(location.search).get('id') || issue?._id || issue?.id;
          console.log('Fetching report with ID:', issueId, 'from location:', location);
          if (!issueId || !/^[0-9a-fA-F]{24}$/.test(issueId)) {
            setError('Invalid or missing report ID');
            return;
          }

          setLoading(true);
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
          console.log(`Fetching report from: ${apiBaseUrl}/api/admin/reports/${issueId}`);
          const response = await fetch(`${apiBaseUrl}/api/admin/reports/${issueId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) {
            let errorMessage = 'Failed to fetch report';
            if (response.status === 404) {
              errorMessage = `Report with ID ${issueId} not found`;
            } else if (response.status === 401) {
              errorMessage = 'Unauthorized: Please log in as admin';
            } else if (response.status === 403) {
              errorMessage = 'Forbidden: Admin access required';
            } else {
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (jsonError) {
                console.error('Error parsing response:', jsonError);
                errorMessage = 'Received unexpected response from server';
              }
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          setIssue({
            id: data._id,
            title: data.title,
            description: data.description,
            status: data.status || 'pending',
            priority: data.urgency || 'medium',
            category: data.category,
            location: data.location?.address || '',
            wardNumber: data.wardNumber || '',
            userName: data.user?.name || 'Unknown',
            userEmail: data.user?.email || 'Unknown',
            userId: data.user?._id || 'Unknown',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || data.createdAt,
            resolvedAt: data.resolvedAt || null,
            resolvedBy: data.resolvedBy || null,
            resolution: data.resolution || null,
            screenshots: data.images ? data.images.map(img => img.url) : [],
            comments: data.comments || [],
          });
          setLoading(false);
        } catch (err) {
          setError(`Error fetching report: ${err.message}`);
          setLoading(false);
        }
      } else {
        console.log('Report received from location.state:', issue);
        if (!issue.id || !/^[0-9a-fA-F]{24}$/.test(issue.id)) {
          setError('Invalid report ID received. Please select a valid report from Manage Issues.');
        }
      }
    };

    fetchIssue();
  }, [location]);

  useEffect(() => {
    if (selectedCategory) {
      fetchVolunteers(selectedCategory.name);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (issue) {
      fetchAssignment();
    }
  }, [issue]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login to fetch assignment data');
        setLoading(false);
        return;
      }

      const issueId = issue._id || issue.id;
      if (!/^[0-9a-fA-F]{24}$/.test(issueId)) {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Fetching assignment from: ${apiBaseUrl}/api/volunteer-assignments/issue/${issueId}`);
      const response = await fetch(`${apiBaseUrl}/api/volunteer-assignments/issue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No assignment found for issue:', issueId);
          setAssignment(null);
          setVolunteerCompleted(false);
          setVolunteerNotes('');
          setLoading(false);
          return;
        }
        let errorMessage = 'Failed to fetch assignment data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const assignments = await response.json();
      console.log('Fetched assignments:', assignments);
      if (assignments.length > 0) {
        const assign = assignments[0];
        console.log('Setting assignment:', assign);
        console.log('Volunteer completed:', assign.volunteerCompleted);
        setAssignment(assign);
        setVolunteerCompleted(assign.volunteerCompleted || false);
        setVolunteerNotes(assign.completionNotes || '');
        setSelectedCategory(repairCategories.find((cat) => cat.name === assign.category) || null);
        setSelectedField(assign.field || '');
        setMainVolunteer(assign.mainVolunteer?._id || assign.mainVolunteer || '');
        setSubVolunteersCount(assign.subVolunteersCount || 0);
        setWorkDescription(assign.workDescription || '');
        setEstimatedCompletionDate(assign.estimatedCompletionDate ? assign.estimatedCompletionDate.split('T')[0] : '');
      } else {
        console.log('No assignments found, resetting assignment state');
        setAssignment(null);
        setVolunteerCompleted(false);
        setVolunteerNotes('');
      }

      setLoading(false);
    } catch (err) {
      setError(`Error fetching assignment data: ${err.message}`);
      console.error('Fetch assignment error:', err.message);
      setLoading(false);
    }
  };

  const fetchVolunteers = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Please login to fetch volunteers');
        setLoading(false);
        return;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Fetching volunteers from: ${apiBaseUrl}/api/volunteers?category=${category}`);
      const response = await fetch(`${apiBaseUrl}/api/volunteers?category=${category}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('No volunteers found for this category');
          setVolunteers([]);
          setLoading(false);
          return;
        }
        let errorMessage = 'Failed to fetch volunteers';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const volunteersData = await response.json();
      setVolunteers(volunteersData);
      setLoading(false);
    } catch (err) {
      setError(`Error fetching volunteers: ${err.message}`);
      setVolunteers([]);
      setLoading(false);
    }
  };

  const getFilteredVolunteers = () => {
    if (!selectedCategory || volunteers.length === 0) return [];
    if (!selectedField) {
      return volunteers.filter(
        (v) => v._id && /^[0-9a-fA-F]{24}$/.test(v._id) && v.skills.includes(selectedCategory.name)
      );
    }
    return volunteers.filter(
      (volunteer) =>
        volunteer._id &&
        /^[0-9a-fA-F]{24}$/.test(volunteer._id) &&
        volunteer.skills.includes(selectedCategory.name) &&
        (!volunteer.specializedFields.length || volunteer.specializedFields.includes(selectedField))
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedField('');
    setMainVolunteer('');
    setSubVolunteersCount(0);
    setVolunteers([]);
  };

  const handleFieldSelect = (field) => {
    setSelectedField(field);
    setMainVolunteer('');
  };

  const handleAssignVolunteers = async () => {
    if (!selectedField || !mainVolunteer || !estimatedCompletionDate || subVolunteersCount < 0) {
      setError('Please fill all required fields: Field, Main Volunteer, Additional Volunteers, and Estimated Completion Date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to assign volunteers');
      }

      const issueId = issue?._id || issue?.id;
      console.log('Issue object:', issue);
      if (!issueId) {
        throw new Error('No report ID provided. Please select a report from Manage Issues.');
      }
      if (!/^[0-9a-fA-F]{24}$/.test(issueId)) {
        throw new Error(`Invalid report ID: ${issueId}`);
      }
      if (!selectedCategory?.name || !repairCategories.some((cat) => cat.name === selectedCategory.name)) {
        throw new Error('Invalid repair category');
      }
      if (!selectedField || !repairFields[selectedCategory.name]?.includes(selectedField)) {
        throw new Error('Invalid repair field');
      }
      if (!/^[0-9a-fA-F]{24}$/.test(mainVolunteer)) {
        throw new Error('Invalid main volunteer ID');
      }
      const date = new Date(estimatedCompletionDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid estimated completion date');
      }

      // Verify issue status
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Verifying report at: ${apiBaseUrl}/api/admin/reports/${issueId}`);
      const issueResponse = await fetch(`${apiBaseUrl}/api/admin/reports/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!issueResponse.ok) {
        let errorMessage = 'Failed to verify report status';
        if (issueResponse.status === 404) {
          errorMessage = `Report with ID ${issueId} not found`;
        } else if (issueResponse.status === 401) {
          errorMessage = 'Unauthorized: Please log in as admin';
        } else if (issueResponse.status === 403) {
          errorMessage = 'Forbidden: Admin access required';
        } else {
          try {
            const errorData = await issueResponse.json(); // Fixed typo
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing issue response:', jsonError);
            errorMessage = 'Received unexpected response from server';
          }
        }
        throw new Error(errorMessage);
      }

      const issueData = await issueResponse.json();
      if (issueData.status === 'resolved') {
        throw new Error('Cannot assign volunteers to a resolved report');
      }

      // Verify volunteer skills and fields
      const selectedVolunteer = volunteers.find((v) => v._id === mainVolunteer);
      if (!selectedVolunteer) {
        throw new Error('Selected volunteer not found');
      }
      if (!selectedVolunteer.skills.includes(selectedCategory.name)) {
        throw new Error(`Selected volunteer does not have ${selectedCategory.name} skill`);
      }
      if (selectedVolunteer.specializedFields.length > 0 && !selectedVolunteer.specializedFields.includes(selectedField)) {
        throw new Error(`Selected volunteer does not specialize in ${selectedField}`);
      }

      const newAssignmentPayload = {
        issueId,
        category: selectedCategory.name,
        field: selectedField,
        mainVolunteer,
        subVolunteersCount: Number(subVolunteersCount),
        workDescription: workDescription || '',
        estimatedCompletionDate: date.toISOString(),
        volunteerCompleted: false,
        completionNotes: '',
      };

      console.log(`Assigning volunteers to: ${apiBaseUrl}/api/volunteer-assignments`);
      console.log('Payload:', newAssignmentPayload);
      const response = await fetch(`${apiBaseUrl}/api/volunteer-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAssignmentPayload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to assign volunteers';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.errors?.map((e) => e.msg).join(', ') ||
            errorData.error ||
            errorMessage;
        } catch (jsonError) {
          console.error('Error parsing assignment response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const createdAssignment = await response.json();

      // Update issue status to in_progress
      console.log(`Updating report status at: ${apiBaseUrl}/api/admin/reports/${issueId}`);
      const updateResponse = await fetch(`${apiBaseUrl}/api/admin/reports/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'in_progress' }),
      });

      if (!updateResponse.ok) {
        let errorMessage = 'Failed to update report status';
        try {
          const errorData = await updateResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing update response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const updatedIssue = await updateResponse.json();
      setAssignment(createdAssignment);
      setAssignmentSuccess(true);
      setVolunteerCompleted(false);
      setVolunteerNotes('');

      // Update issue state
      setIssue({
        ...issue,
        status: updatedIssue.status,
        updatedAt: updatedIssue.updatedAt,
      });

      // Navigate back with updated issue
      setTimeout(() => {
        setAssignmentSuccess(false);
        setLoading(false);
        navigate('/adminDashboard/issues', {
          state: { updatedIssue },
        });
      }, 1000);
    } catch (error) {
      setError(error.message);
      console.error('Assignment error:', error.message);
      setLoading(false);
    }
  };

  const refreshIssueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to refresh report data');
      }

      const issueId = issue._id || issue.id;
      if (!/^[0-9a-fA-F]{24}$/.test(issueId)) {
        throw new Error('Invalid report ID');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Refreshing report from: ${apiBaseUrl}/api/admin/reports/${issueId}`);
      const response = await fetch(`${apiBaseUrl}/api/admin/reports/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to refresh report data';
        if (response.status === 404) {
          errorMessage = `Report with ID ${issueId} not found`;
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized: Please log in as admin';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: Admin access required';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing response:', jsonError);
            errorMessage = 'Received unexpected response from server';
          }
        }
        throw new Error(errorMessage);
      }

      const updatedData = await response.json();
      setIssue({
        id: updatedData._id,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status || 'pending',
        priority: updatedData.urgency || 'medium',
        category: updatedData.category,
        location: updatedData.location?.address || '',
        wardNumber: updatedData.wardNumber || '',
        userName: updatedData.user?.name || 'Unknown',
        userEmail: updatedData.user?.email || 'Unknown',
        userId: updatedData.user?._id || 'Unknown',
        createdAt: updatedData.createdAt,
        updatedAt: updatedData.updatedAt || updatedData.createdAt,
        resolvedAt: updatedData.resolvedAt || null,
        resolvedBy: updatedData.resolvedBy || null,
        resolution: updatedData.resolution || null,
        screenshots: updatedData.images ? updatedData.images.map(img => img.url) : [],
        comments: updatedData.comments || [],
      });

      setLoading(false);
      setAssignment(null);
      setVolunteerCompleted(false);
      setVolunteerNotes('');
      fetchAssignment();

      if (selectedCategory) {
        fetchVolunteers(selectedCategory.name);
      }
    } catch (error) {
      setError(`Failed to refresh report data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleVolunteerCompletionUpdate = async () => {
    if (!assignment) {
      setError('No active assignment found for this report');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to update completion status');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Updating volunteer completion at: ${apiBaseUrl}/api/volunteer-assignments/volunteer-complete/${assignment._id}`);
      const response = await fetch(`${apiBaseUrl}/api/volunteer-assignments/volunteer-complete/${assignment._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completionNotes: volunteerNotes }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update completion status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const updatedAssignment = await response.json();
      console.log('Updated assignment:', updatedAssignment);
      console.log('Volunteer completed after update:', updatedAssignment.volunteerCompleted);
      setAssignment(updatedAssignment);
      setVolunteerCompleted(updatedAssignment.volunteerCompleted || false);
      setVolunteerNotes(updatedAssignment.completionNotes || '');
      setAssignmentSuccess(true);

      // Refresh assignment data
      await fetchAssignment();

      setTimeout(() => {
        setAssignmentSuccess(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError(`Failed to update completion status: ${error.message}`);
      console.error('Completion update error:', error.message);
      setLoading(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!assignment) {
      setError('No active assignment found for this report');
      return;
    }

    if (!volunteerCompleted) {
      setError('Volunteer has not marked the task as completed yet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Please login to complete the work');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${API}`;
      console.log(`Completing assignment at: ${apiBaseUrl}/api/volunteer-assignments/complete/${assignment._id}`);
      const completeResponse = await fetch(`${apiBaseUrl}/api/volunteer-assignments/complete/${assignment._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!completeResponse.ok) {
        let errorMessage = 'Failed to mark work complete';
        try {
          const errorData = await completeResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      // Update issue status to resolved
      const issueId = issue._id || issue.id;
      console.log(`Updating report to resolved at: ${apiBaseUrl}/api/admin/reports/${issueId}`);
      const updateIssueResponse = await fetch(`${apiBaseUrl}/api/admin/reports/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'resolved',
          resolution: volunteerNotes || 'Report resolved by volunteer team.',
        }),
      });

      if (!updateIssueResponse.ok) {
        let errorMessage = 'Failed to update report status';
        try {
          const errorData = await updateIssueResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing response:', jsonError);
          errorMessage = 'Received unexpected response from server';
        }
        throw new Error(errorMessage);
      }

      const updatedIssue = await updateIssueResponse.json();
      setIssue({
        id: updatedIssue._id,
        title: updatedIssue.title,
        description: updatedIssue.description,
        status: updatedIssue.status || 'pending',
        priority: updatedIssue.urgency || 'medium',
        category: updatedIssue.category,
        location: updatedIssue.location?.address || '',
        wardNumber: updatedIssue.wardNumber || '',
        userName: updatedIssue.user?.name || 'Unknown',
        userEmail: updatedIssue.user?.email || 'Unknown',
        userId: updatedIssue.user?._id || 'Unknown',
        createdAt: updatedIssue.createdAt,
        updatedAt: updatedIssue.updatedAt || updatedIssue.createdAt,
        resolvedAt: updatedIssue.resolvedAt || null,
        resolvedBy: updatedIssue.resolvedBy || null,
        resolution: updatedIssue.resolution || null,
        screenshots: updatedIssue.images ? updatedIssue.images.map(img => img.url) : [],
        comments: updatedIssue.comments || [],
      });

      // Navigate back with updated issue
      setTimeout(() => {
        setLoading(false);
        navigate('/adminDashboard/issues', {
          state: { updatedIssue },
        });
      }, 1000);
    } catch (error) {
      setError(`Failed to mark work complete: ${error.message}`);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/adminDashboard/issues');
  };

  const handleVolunteerManagementTab = () => {
    navigate('/adminDashboard/volunteer', { state: { issue } });
  };

  return (
    <div className="volunteer-management-container">
      <header className="volunteer-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>Back to Issues</span>
        </button>
        <h1>Volunteer Management</h1>
        <div className="header-actions">
          <button className="volunteer-tab-button" onClick={handleVolunteerManagementTab}>
            <Users size={18} />
            <span>Manage Volunteers</span>
          </button>
          <button className="refresh-button" onClick={refreshIssueData}>
            Refresh Issue Data
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/adminDashboard/issues')}>
            Back to Manage Issues
          </button>
        </div>
      )}

      {assignmentSuccess && (
        <div className="success-message global">
          <CheckCircle size={20} />
          {volunteerCompleted ? 'Volunteer completion status updated!' : 'Volunteers successfully assigned!'}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {issue ? (
            <div className="issue-card">
              <h2>Issue Details</h2>
              <div className="issue-details">
                <p><strong>ID:</strong> #{issue.id.slice(-6)}</p>
                <p><strong>Title:</strong> {issue.title}</p>
                <p><strong>Description:</strong> {issue.description}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="no-issue-message">
              <p>No report selected. Please select a report from Manage Issues page.</p>
              <button onClick={() => navigate('/adminDashboard/issues')}>Back to Issues</button>
            </div>
          )}

          <div className="volunteer-content">
            <section className="categories-section">
              <h2>Select Repair Category</h2>
              <div className="repair-categories">
                {repairCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                    style={{ borderColor: category.color }}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="category-icon" style={{ backgroundColor: category.color }}>
                      {category.icon}
                    </div>
                    <h3>{category.name}</h3>
                  </div>
                ))}
              </div>
            </section>

            {selectedCategory && (
              <section className="fields-section">
                <h2>Select Field of Work</h2>
                <div className="repair-fields">
                  {repairFields[selectedCategory.name].map((field) => (
                    <div
                      key={field}
                      className={`field-card ${selectedField === field ? 'selected' : ''}`}
                      onClick={() => handleFieldSelect(field)}
                    >
                      <Wrench size={20} />
                      <h3>{field}</h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {selectedField && !assignment && (
              <section className="volunteer-assignment-section">
                <h2>Assign Volunteers</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAssignVolunteers();
                  }}
                >
                  <div className="form-group">
                    <label>Main Volunteer:</label>
                    {volunteers.length === 0 ? (
                      <p>
                        No volunteers available for this category.{' '}
                        <a href="#" onClick={handleVolunteerManagementTab}>
                          Create a new volunteer
                        </a>
                        .
                      </p>
                    ) : (
                      <select
                        value={mainVolunteer}
                        onChange={(e) => setMainVolunteer(e.target.value)}
                        required
                      >
                        <option value="">Select Main Volunteer</option>
                        {getFilteredVolunteers().map((volunteer) => (
                          <option key={volunteer._id} value={volunteer._id}>
                            {volunteer.name} - Skills: {volunteer.skills.join(', ')}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Additional Volunteers Needed:</label>
                    <input
                      type="number"
                      min="0"
                      value={subVolunteersCount}
                      onChange={(e) => setSubVolunteersCount(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Work Description:</label>
                    <textarea
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      placeholder="Describe the work to be done..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Completion Date:</label>
                    <input
                      type="date"
                      value={estimatedCompletionDate}
                      onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="button-group">
                    <button type="submit" className="assign-button" disabled={loading || volunteers.length === 0}>
                      {loading ? 'Assigning...' : 'Assign Volunteers'}
                    </button>
                    <button type="button" className="create-volunteer-button" onClick={handleVolunteerManagementTab}>
                      Create New Volunteer
                    </button>
                  </div>
                </form>
              </section>
            )}

            {assignment && (
              <section className="active-assignment-section">
                <h2>Active Assignment</h2>
                <div className="assignment-details">
                  <p>
                    <strong>Category:</strong> {assignment.category}
                    <span className="field-badge">{assignment.field}</span>
                  </p>
                  <p><strong>Main Volunteer:</strong> {assignment.mainVolunteerName || 'Loading...'}</p>
                  <p><strong>Additional Volunteers:</strong> {assignment.subVolunteersCount}</p>
                  <p><strong>Work Description:</strong> {assignment.workDescription || 'N/A'}</p>
                  <p>
                    <strong>Estimated Completion:</strong>{' '}
                    {new Date(assignment.estimatedCompletionDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Volunteer Completed:</strong>
                    <span className={`completion-status ${volunteerCompleted ? 'completed' : 'pending'}`}>
                      {volunteerCompleted ? 'Yes' : 'No'}
                    </span>
                  </p>

                  {volunteerCompleted && (
                    <div className="completion-notes">
                      <p><strong>Completion Notes:</strong></p>
                      <p>{volunteerNotes || 'None'}</p>
                    </div>
                  )}
                </div>

                {!volunteerCompleted ? (
                  <div className="volunteer-completion-form">
                    <h3>Update Volunteer Completion Status</h3>
                    <textarea
                      value={volunteerNotes}
                      onChange={(e) => setVolunteerNotes(e.target.value)}
                      placeholder="Enter completion notes..."
                    />
                    <button
                      className="completion-button"
                      onClick={handleVolunteerCompletionUpdate}
                      disabled={loading}
                    >
                      <Check size={16} />
                      Mark as Complete
                    </button>
                  </div>
                ) : (
                  <div className="admin-completion-section">
                    <h3>Volunteer Work Complete</h3>
                    <p>The volunteer has marked this work as complete. Please verify the work and finalize the issue resolution.</p>
                    <button
                      className="complete-work-button"
                      onClick={handleCompleteWork}
                      disabled={loading}
                    >
                      <CheckCircle size={16} />
                      Verify & Complete Work
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Debug Section */}
            {assignment && (
              <div className="debug-section">
                <p>Debug: volunteerCompleted = {volunteerCompleted.toString()}</p>
                <p>Debug: assignment.volunteerCompleted = {assignment.volunteerCompleted?.toString()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VolunteerManagement;