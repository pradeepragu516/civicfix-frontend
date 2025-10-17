import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import './Financial.css';

const API = "http://localhost:5000";


// Static data for dropdowns (in a real app, this could come from an API)
const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

const districts = [
  { id: 1, name: 'Coimbatore' }
];

const towns = [
  { id: 1, districtId: 1, name: 'Pollachi' },
  { id: 2, districtId: 1, name: 'Mettupalayam' },
  { id: 3, districtId: 1, name: 'Madhukarai' },

];

const panchayats = [
  // Pollachi village panchayats
  { id: 1, townId: 1, name: 'Achipatti' },
  { id: 2, townId: 1, name: 'Puliampatti' },
  { id: 3, townId: 1, name: 'Kottampatti' },
  { id: 4, townId: 1, name: 'Vellalapalayam' },
  { id: 5, townId: 1, name: 'Rasakapalayam' },
  // Mettupalayam village panchayats
  { id: 6, townId: 2, name: 'Ramasamipuram' },
  { id: 7, townId: 2, name: 'Anumanthapuram' },
  { id: 8, townId: 2, name: 'Pappampalayam' },
  // Valparai village panchayats
  { id: 9, townId: 3, name: 'Malumichampatti' },
  { id: 10, townId: 3, name: 'Valukuparrai' },
  { id: 11, townId: 3, name: 'Palathurai' }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const calculateUtilizationRate = (spent, allocation) => {
  return (spent / allocation * 100).toFixed(1);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function FinancialManagement() {
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);
  const [selectedTown, setSelectedTown] = useState(towns[0]);
  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2024);
  const [financialData, setFinancialData] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'trends', 'comparison'
  const [selectedYear, setSelectedYear] = useState(2024);
  const [comparisonEntity, setComparisonEntity] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Financial Management";
    
    const fetchFinancialData = async () => {
      try {
        let entityType, entityId;
        if (selectedPanchayat) {
          entityType = 'panchayat';
          entityId = selectedPanchayat.id;
        } else if (selectedTown) {
          entityType = 'town';
          entityId = selectedTown.id;
        } else {
          entityType = 'district';
          entityId = selectedDistrict.id;
        }
        
        const response = await fetch(
          `${API}/api/finances/${entityType}/${entityId}?startYear=${startYear}&endYear=${endYear}`,
          {
            headers: {
              'Content-Type': 'application/json',
              // Add authentication headers if required
              // 'Authorization': `Bearer ${token}`,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch financial data');
        }
        
        const data = await response.json();
        setFinancialData(data);
        setError('');
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Unable to load financial data. Please try again later.');
        setFinancialData([]);
      }
    };
    
    fetchFinancialData();
  }, [selectedDistrict, selectedTown, selectedPanchayat, startYear, endYear]);

  useEffect(() => {
    if (comparisonEntity) {
      const fetchComparisonData = async () => {
        try {
          const response = await fetch(
            `${API}/api/finances/panchayat/${comparisonEntity.id}?startYear=${startYear}&endYear=${endYear}`,
            {
              headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if required
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch comparison data');
          }
          
          const data = await response.json();
          setComparisonData(data);
          setError('');
        } catch (err) {
          console.error('Error fetching comparison data:', err);
          setError('Unable to load comparison data. Please try again later.');
          setComparisonData([]);
        }
      };
      
      fetchComparisonData();
    } else {
      setComparisonData([]);
    }
  }, [comparisonEntity, startYear, endYear]);

  const handleDistrictChange = (e) => {
    const district = districts.find(d => d.id === parseInt(e.target.value));
    setSelectedDistrict(district);
    setSelectedTown(towns.filter(t => t.districtId === district.id)[0]);
    setSelectedPanchayat(null);
    setComparisonEntity(null);
  };

  const handleTownChange = (e) => {
    const town = towns.find(t => t.id === parseInt(e.target.value));
    setSelectedTown(town);
    setSelectedPanchayat(null);
    setComparisonEntity(null);
  };

  const handlePanchayatChange = (e) => {
    if (e.target.value === "") {
      setSelectedPanchayat(null);
    } else {
      const panchayat = panchayats.find(p => p.id === parseInt(e.target.value));
      setSelectedPanchayat(panchayat);
    }
    setComparisonEntity(null);
  };

  const handleYearRangeChange = (e) => {
    const range = e.target.value.split("-");
    setStartYear(parseInt(range[0]));
    setEndYear(parseInt(range[1]));
  };

  const handleExportData = () => {
    alert("Data export functionality would be implemented here");
  };

  const handleSubmitFeedback = async () => {
    try {
      // In a real app, send feedback to the backend
      const response = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      alert("Thank you for your feedback!");
      setFeedback('');
      setShowFeedbackModal(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const getCurrentEntityName = () => {
    if (selectedPanchayat) return selectedPanchayat.name;
    if (selectedTown) return selectedTown.name;
    return selectedDistrict.name;
  };

  const getLatestYearData = () => {
    return financialData.find(d => d.year === selectedYear) || {};
  };

  const latestData = getLatestYearData();
  
  const categoryData = latestData.categories ? 
    Object.entries(latestData.categories).map(([name, value]) => ({
      name,
      value
    })) : [];

  const getAverageUtilization = () => {
    if (!financialData.length) return 0;
    let total = 0;
    financialData.forEach(d => {
      total += (d.spent / d.allocation) * 100;
    });
    return (total / financialData.length).toFixed(1);
  };

  const filteredFinancialData = financialData.filter(data => {
    if (searchQuery) {
      return data.year.toString().includes(searchQuery);
    }
    return true;
  });

  const getMergedComparisonData = () => {
    if (!comparisonEntity || !comparisonData.length) return [];
    
    return years
      .filter(year => year >= startYear && year <= endYear)
      .map(year => {
        const primaryData = financialData.find(d => d.year === year) || 
          { allocation: 0, spent: 0, balance: 0 };
        const compareData = comparisonData.find(d => d.year === year) || 
          { allocation: 0, spent: 0, balance: 0 };
        
        return {
          year,
          [`${getCurrentEntityName()} Allocation`]: primaryData.allocation,
          [`${getCurrentEntityName()} Spent`]: primaryData.spent,
          [`${comparisonEntity.name} Allocation`]: compareData.allocation,
          [`${comparisonEntity.name} Spent`]: compareData.spent,
        };
      });
  };

  return (
    <div className="financial-management">
      {/* Page Title */}
      <div className="page-header">
        <h1>Financial Management</h1>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Main Content */}
      <div className="container main-content">
        {/* Selection Controls */}
        <div className="card selection-controls">
          <div className="grid-container">
            <div className="select-group">
              <label>District</label>
              <div className="select-wrapper">
                <select
                  value={selectedDistrict.id}
                  onChange={handleDistrictChange}
                >
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>
            
            <div className="select-group">
              <label>Town Panchayat</label>
              <div className="select-wrapper">
                <select
                  value={selectedTown.id}
                  onChange={handleTownChange}
                >
                  {towns
                    .filter(town => town.districtId === selectedDistrict.id)
                    .map(town => (
                      <option key={town.id} value={town.id}>
                        {town.name}
                      </option>
                    ))}
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>
            
            <div className="select-group">
              <label>Village Panchayat (Optional)</label>
              <div className="select-wrapper">
                <select
                  value={selectedPanchayat ? selectedPanchayat.id : ""}
                  onChange={handlePanchayatChange}
                >
                  <option value="">All Village Panchayats</option>
                  {panchayats
                    .filter(panchayat => panchayat.townId === selectedTown.id)
                    .map(panchayat => (
                      <option key={panchayat.id} value={panchayat.id}>
                        {panchayat.name}
                      </option>
                    ))}
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>
          </div>
          
          <div className="grid-container">
            <div className="select-group">
              <label>Time Period</label>
              <div className="select-wrapper">
                <select
                  value={`${startYear}-${endYear}`}
                  onChange={handleYearRangeChange}
                >
                  <option value="2015-2024">Last 10 Years (2015-2024)</option>
                  <option value="2020-2024">Last 5 Years (2020-2024)</option>
                  <option value="2022-2024">Last 3 Years (2022-2024)</option>
                  <option value="2024-2024">Current Year Only (2024)</option>
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>
            
            <div className="view-mode">
              <label>View Mode</label>
              <div className="button-group">
                <button
                  onClick={() => setViewMode('overview')}
                  className={viewMode === 'overview' ? 'active' : ''}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('trends')}
                  className={viewMode === 'trends' ? 'active' : ''}
                >
                  Trends
                </button>
                <button
                  onClick={() => setViewMode('comparison')}
                  className={viewMode === 'comparison' ? 'active' : ''}
                >
                  Compare
                </button>
              </div>
            </div>
            
            <div className="tools">
              <label>Tools</label>
              <div className="button-group">
                <button onClick={handleExportData} className="btn-secondary">
                  <span className="icon">📊</span> Export
                </button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn-secondary">
                  <span className="icon">💬</span> Feedback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card search-filter">
          <div className="search-filter-container">
            <div className="search-group">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-controls">
              <div className="select-group">
                <label>Select Year for Details</label>
                <div className="select-wrapper">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {years
                      .filter(year => year >= startYear && year <= endYear)
                      .map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                  <span className="select-arrow"></span>
                </div>
              </div>
              <div className="select-group">
                <label>Category Filter</label>
                <div className="select-wrapper">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="welfare">Welfare</option>
                    <option value="administration">Administration</option>
                    <option value="others">Others</option>
                  </select>
                  <span className="select-arrow"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {viewMode === 'overview' && (
          <div className="dashboard-section">
            <div className="card overview-card">
              <h2 className="section-title">
                <span className="icon">📊</span>
                {getCurrentEntityName()} - Financial Overview
              </h2>
              
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card allocation">
                  <h3>Total Allocation</h3>
                  <p className="amount">{formatCurrency(latestData.allocation || 0)}</p>
                  <p className="year">For {selectedYear}</p>
                </div>
                
                <div className="summary-card spent">
                  <h3>Total Spent</h3>
                  <p className="amount">{formatCurrency(latestData.spent || 0)}</p>
                  <p className="year">For {selectedYear}</p>
                </div>
                
                <div className="summary-card balance">
                  <h3>Balance</h3>
                  <p className="amount">{formatCurrency(latestData.balance || 0)}</p>
                  <p className="year">For {selectedYear}</p>
                </div>
                
                <div className="summary-card utilization">
                  <h3>Utilization Rate</h3>
                  <p className="amount">
                    {calculateUtilizationRate(latestData.spent || 0, latestData.allocation || 1)}%
                  </p>
                  <p className="year">Avg: {getAverageUtilization()}%</p>
                </div>
              </div>
              
              {/* Main Chart */}
              <div className="chart-container">
                <h3 className="chart-title">
                  <span className="icon">📈</span>
                  Fund Allocation & Spending by Year
                </h3>
                <div className="chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={filteredFinancialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="allocation" name="Allocation" fill="#3b82f6" />
                      <Bar dataKey="spent" name="Spent" fill="#10b981" />
                      <Bar dataKey="balance" name="Balance" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Categories Section */}
            <div className="card categories-card">
              <h2 className="section-title">
                <span className="icon">📋</span>
                Spending by Category ({selectedYear})
              </h2>
              
              <div className="categories-container">
                <div className="pie-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="category-details">
                  <h3>Category Details</h3>
                  <div className="category-list">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="category-item">
                        <div className="category-name">
                          <div 
                            className="color-indicator" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="name">{category.name}</span>
                        </div>
                        <span className="value">{formatCurrency(category.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'trends' && (
          <div className="card trends-card">
            <h2 className="section-title">
              <span className="icon">📈</span>
              Financial Trends ({startYear}-{endYear})
            </h2>
            
            <div className="trends-container">
              <div className="trend-chart">
                <h3>Allocation Trend</h3>
                <div className="chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={filteredFinancialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="allocation" name="Allocation" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="trend-chart">
                <h3>Spending Trend</h3>
                <div className="chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={filteredFinancialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="spent" name="Spent" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="utilization-chart">
              <h3>Utilization Rate by Year</h3>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={filteredFinancialData.map(item => ({
                      year: item.year,
                      utilizationRate: (item.spent / item.allocation) * 100
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="utilizationRate" name="Utilization Rate" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'comparison' && (
          <div className="card comparison-card">
            <h2 className="section-title">
              <span className="icon">🔄</span>
              Comparative Analysis
            </h2>
            
            <div className="comparison-controls">
              <label>Compare with another Village Panchayat</label>
              <div className="select-wrapper medium-width">
                <select
                  value={comparisonEntity ? comparisonEntity.id : ""}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setComparisonEntity(null);
                    } else {
                      const entity = panchayats.find(p => p.id === parseInt(e.target.value));
                      setComparisonEntity(entity);
                    }
                  }}
                >
                  <option value="">Select a Village Panchayat</option>
                  {panchayats
                    .filter(panchayat => 
                      panchayat.townId === selectedTown.id && 
                      (!selectedPanchayat || panchayat.id !== selectedPanchayat.id)
                    )
                    .map(panchayat => (
                      <option key={panchayat.id} value={panchayat.id}>
                        {panchayat.name}
                      </option>
                    ))}
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>
            
            {comparisonEntity ? (
              <div className="comparison-content">
                <div className="comparison-chart">
                  <h3>Allocation Comparison</h3>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={getMergedComparisonData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar 
                          dataKey={`${getCurrentEntityName()} Allocation`} 
                          name={`${getCurrentEntityName()} Allocation`} 
                          fill="#3b82f6" 
                        />
                        <Bar 
                          dataKey={`${comparisonEntity.name} Allocation`} 
                          name={`${comparisonEntity.name} Allocation`} 
                          fill="#8b5cf6" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="comparison-chart">
                  <h3>Spending Comparison</h3>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={getMergedComparisonData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `₹${value / 1000000}M`} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar 
                          dataKey={`${getCurrentEntityName()} Spent`} 
                          name={`${getCurrentEntityName()} Spent`} 
                          fill="#10b981" 
                        />
                        <Bar 
                          dataKey={`${comparisonEntity.name} Spent`} 
                          name={`${comparisonEntity.name} Spent`} 
                          fill="#f59e0b" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="comparison-stats">
                  <h3>Utilization Rate Comparison ({selectedYear})</h3>
                  <div className="stats-container">
                    <div className="stat-item">
                      <div className="stat-label">{getCurrentEntityName()}</div>
                      <div className="progress-bar">
                        <div 
                          className="progress" 
                          style={{ 
                            width: `${calculateUtilizationRate(
                              filteredFinancialData.find(d => d.year === selectedYear)?.spent || 0,
                              filteredFinancialData.find(d => d.year === selectedYear)?.allocation || 1
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">
                        {calculateUtilizationRate(
                          filteredFinancialData.find(d => d.year === selectedYear)?.spent || 0,
                          filteredFinancialData.find(d => d.year === selectedYear)?.allocation || 1
                        )}%
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-label">{comparisonEntity.name}</div>
                      <div className="progress-bar">
                        <div
                          className="progress comparison" 
                          style={{ 
                            width: `${calculateUtilizationRate(
                              comparisonData.find(d => d.year === selectedYear)?.spent || 0,
                              comparisonData.find(d => d.year === selectedYear)?.allocation || 1
                            )}%` 
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">
                        {calculateUtilizationRate(
                          comparisonData.find(d => d.year === selectedYear)?.spent || 0,
                          comparisonData.find(d => d.year === selectedYear)?.allocation || 1
                        )}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-comparison">
                <p>Please select a village panchayat to compare with {getCurrentEntityName()}</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Submit Feedback</h3>
                <button className="close-button" onClick={() => setShowFeedbackModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>Your feedback helps us improve the transparency portal. Please share your thoughts, suggestions, or report any issues.</p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback here..."
                  rows={5}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmitFeedback}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}