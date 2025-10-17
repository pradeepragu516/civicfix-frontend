
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import './FinancialManagement.css';

// Demo data - in a real app, this would come from an API
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

const generateFinancialData = (entityId, startYear, endYear) => {
  const data = [];
  for (let year = startYear; year <= endYear; year++) {
    const allocation = Math.floor(Math.random() * 5000000) + 10000000;
    const spent = Math.floor(Math.random() * allocation);
    const balance = allocation - spent;
    
    data.push({
      year,
      allocation,
      spent,
      balance,
      categories: {
        infrastructure: Math.floor(spent * (Math.random() * 0.3 + 0.2)),
        education: Math.floor(spent * (Math.random() * 0.2 + 0.15)),
        healthcare: Math.floor(spent * (Math.random() * 0.2 + 0.1)),
        welfare: Math.floor(spent * (Math.random() * 0.15 + 0.1)),
        administration: Math.floor(spent * (Math.random() * 0.1 + 0.05)),
        others: Math.floor(spent * (Math.random() * 0.1 + 0.05))
      }
    });
  }
  return data;
};

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

export default function AdminFinancialManagement() {
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);
  const [selectedTown, setSelectedTown] = useState(towns[0]);
  const [selectedPanchayat, setSelectedPanchayat] = useState(null);
  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2024);
  const [financialData, setFinancialData] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'trends', 'allocation'
  const [selectedYear, setSelectedYear] = useState(2024);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedback, setFeedback] = useState('');
  
  // Admin-specific states
  const [updateFormData, setUpdateFormData] = useState({
    allocation: 0,
    categories: {
      infrastructure: 0,
      education: 0,
      healthcare: 0,
      welfare: 0,
      administration: 0,
      others: 0
    }
  });
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');

  useEffect(() => {
    document.title = "Admin Financial Management";
    
    const fetchData = async () => {
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
          `/api/finances/${entityType}/${entityId}?startYear=${startYear}&endYear=${endYear}`
        );
        const data = await response.json();
        setFinancialData(data);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };
    
    fetchData();
  }, [selectedDistrict, selectedTown, selectedPanchayat, startYear, endYear]);

  useEffect(() => {
    // Update form data when selected year changes
    const yearData = financialData.find(d => d.year === selectedYear) || { 
      allocation: 0, 
      categories: {
        infrastructure: 0,
        education: 0,
        healthcare: 0,
        welfare: 0,
        administration: 0,
        others: 0
      }
    };
    
    setUpdateFormData({
      allocation: yearData.allocation || 0,
      categories: {
        infrastructure: yearData.categories?.infrastructure || 0,
        education: yearData.categories?.education || 0,
        healthcare: yearData.categories?.healthcare || 0,
        welfare: yearData.categories?.welfare || 0,
        administration: yearData.categories?.administration || 0,
        others: yearData.categories?.others || 0
      }
    });
  }, [selectedYear, financialData]);

  const handleDistrictChange = (e) => {
    const district = districts.find(d => d.id === parseInt(e.target.value));
    setSelectedDistrict(district);
    setSelectedTown(towns.filter(t => t.districtId === district.id)[0]);
    setSelectedPanchayat(null);
  };

  const handleTownChange = (e) => {
    const town = towns.find(t => t.id === parseInt(e.target.value));
    setSelectedTown(town);
    setSelectedPanchayat(null);
  };

  const handlePanchayatChange = (e) => {
    if (e.target.value === "") {
      setSelectedPanchayat(null);
    } else {
      const panchayat = panchayats.find(p => p.id === parseInt(e.target.value));
      setSelectedPanchayat(panchayat);
    }
  };

  const handleYearRangeChange = (e) => {
    const range = e.target.value.split("-");
    setStartYear(parseInt(range[0]));
    setEndYear(parseInt(range[1]));
  };

  const handleExportData = () => {
    // In a real app, this would generate and download CSV/Excel data
    alert("Data export functionality would be implemented here");
  };

  const handleSubmitFeedback = () => {
    // In a real app, this would submit the feedback to a server
    alert("Thank you for your feedback!");
    setFeedback('');
    setShowFeedbackModal(false);
  };

  const handleAllocationChange = (e) => {
    setUpdateFormData({
      ...updateFormData,
      allocation: parseInt(e.target.value) || 0
    });
  };

  const handleCategoryAllocationChange = (category, value) => {
    setUpdateFormData({
      ...updateFormData,
      categories: {
        ...updateFormData.categories,
        [category]: parseInt(value) || 0
      }
    });
  };

  const handleUpdateFinancialData = async () => {
    try {
      let entityType, entityId, entityName, districtId, townId;
      if (selectedPanchayat) {
        entityType = 'panchayat';
        entityId = selectedPanchayat.id;
        entityName = selectedPanchayat.name;
        districtId = selectedDistrict.id;
        townId = selectedTown.id;
      } else if (selectedTown) {
        entityType = 'town';
        entityId = selectedTown.id;
        entityName = selectedTown.name;
        districtId = selectedDistrict.id;
      } else {
        entityType = 'district';
        entityId = selectedDistrict.id;
        entityName = selectedDistrict.name;
      }
      
      const totalSpent = Object.values(updateFormData.categories).reduce((sum, value) => sum + value, 0);
      
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          entityName,
          districtId,
          townId,
          year: selectedYear,
          allocation: updateFormData.allocation,
          categories: updateFormData.categories,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update financial data');
      }
      
      const updatedFinance = await response.json();
      setFinancialData(prevData =>
        prevData.map(item =>
          item.year === selectedYear ? updatedFinance : item
        )
      );
      setUpdateSuccessMessage('Financial data updated successfully!');
      setTimeout(() => setUpdateSuccessMessage(''), 3000);
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating financial data:', error);
      setUpdateSuccessMessage('Failed to update financial data');
      setTimeout(() => setUpdateSuccessMessage(''), 3000);
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

  const getTotalCategoryAllocation = () => {
    return Object.values(updateFormData.categories).reduce((sum, value) => sum + value, 0);
  };

  const filteredFinancialData = financialData.filter(data => {
    if (searchQuery) {
      return data.year.toString().includes(searchQuery);
    }
    return true;
  });

  return (
    <div className="AdFinancialManagement">
      {/* Page Title */}
      <div className="AdPageHeader">
        <h1 className="AdPageTitle1">Admin Financial Management</h1>
      </div>
      
      {/* Main Content */}
      <div className="AdContainer AdMainContent">
        {/* Selection Controls */}
        <div className="AdCard AdSelectionControls">
          <div className="AdGridContainer">
            <div className="AdSelectGroup">
              <label>District</label>
              <div className="AdSelectWrapper">
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
                <span className="AdSelectArrow"></span>
              </div>
            </div>
            
            <div className="AdSelectGroup">
              <label>Town Panchayat</label>
              <div className="AdSelectWrapper">
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
                <span className="AdSelectArrow"></span>
              </div>
            </div>
            
            <div className="AdSelectGroup">
              <label>Village Panchayat (Optional)</label>
              <div className="AdSelectWrapper">
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
                <span className="AdSelectArrow"></span>
              </div>
            </div>
          </div>
          
          <div className="AdGridContainer">
            <div className="AdSelectGroup">
              <label>Time Period</label>
              <div className="AdSelectWrapper">
                <select
                  value={`${startYear}-${endYear}`}
                  onChange={handleYearRangeChange}
                >
                  <option value="2015-2024">Last 10 Years (2015-2024)</option>
                  <option value="2020-2024">Last 5 Years (2020-2024)</option>
                  <option value="2022-2024">Last 3 Years (2022-2024)</option>
                  <option value="2024-2024">Current Year Only (2024)</option>
                </select>
                <span className="AdSelectArrow"></span>
              </div>
            </div>
            
            <div className="AdViewMode">
              <label>View Mode</label>
              <div className="AdButtonGroup">
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
                  onClick={() => setViewMode('allocation')}
                  className={viewMode === 'allocation' ? 'active' : ''}
                >
                  Allocations
                </button>
              </div>
            </div>
            
            <div className="AdTools">
              <label>Admin Tools</label>
              <div className="AdButtonGroup">
                <button onClick={() => setShowUpdateModal(true)} className="AdBtnPrimary">
                  <span className="AdIcon">🔄</span> Update Funds
                </button>
                <button onClick={handleExportData} className="AdBtnSecondary">
                  <span className="AdIcon">📊</span> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {updateSuccessMessage && (
          <div className="AdSuccessMessage">
            {updateSuccessMessage}
          </div>
        )}

        {/* Search and Filter */}
        <div className="AdCard AdSearchFilter">
          <div className="AdSearchFilterContainer">
            <div className="AdSearchGroup">
              <div className="AdSearchWrapper">
                <span className="AdSearchIcon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="AdFilterControls">
              <div className="AdSelectGroup">
                <label>Select Year for Details</label>
                <div className="AdSelectWrapper">
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
                  <span className="AdSelectArrow"></span>
                </div>
              </div>
              <div className="AdSelectGroup">
                <label>Category Filter</label>
                <div className="AdSelectWrapper">
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
                  <span className="AdSelectArrow"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {viewMode === 'overview' && (
          <div className="AdDashboardSection">
            <div className="AdCard AdOverviewCard">
              <h2 className="AdSectionTitle">
                <span className="AdIcon">📊</span>
                {getCurrentEntityName()} - Financial Overview
              </h2>
              
              {/* Summary Cards */}
              <div className="AdSummaryCards">
                <div className="AdSummaryCard AdAllocation">
                  <h3>Total Allocation</h3>
                  <p className="AdAmount">{formatCurrency(latestData.allocation || 0)}</p>
                  <p className="AdYear">For {selectedYear}</p>
                </div>
                
                <div className="AdSummaryCard AdSpent">
                  <h3>Total Spent</h3>
                  <p className="AdAmount">{formatCurrency(latestData.spent || 0)}</p>
                  <p className="AdYear">For {selectedYear}</p>
                </div>
                
                <div className="AdSummaryCard AdBalance">
                  <h3>Balance</h3>
                  <p className="AdAmount">{formatCurrency(latestData.balance || 0)}</p>
                  <p className="AdYear">For {selectedYear}</p>
                </div>
                
                <div className="AdSummaryCard AdUtilization">
                  <h3>Utilization Rate</h3>
                  <p className="AdAmount">
                    {calculateUtilizationRate(latestData.spent || 0, latestData.allocation || 1)}%
                  </p>
                  <p className="AdYear">Avg: {getAverageUtilization()}%</p>
                </div>
              </div>
              
              {/* Main Chart */}
              <div className="AdChartContainer">
                <h3 className="AdChartTitle">
                  <span className="AdIcon">📈</span>
                  Fund Allocation & Spending by Year
                </h3>
                <div className="AdChart">
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
            <div className="AdCard AdCategoriesCard">
              <h2 className="AdSectionTitle">
                <span className="AdIcon">📋</span>
                Spending by Category ({selectedYear})
              </h2>
              
              <div className="AdCategoriesContainer">
                <div className="AdPieChart">
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
                
                <div className="AdCategoryDetails">
                  <h3>Category Details</h3>
                  <div className="AdCategoryList">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="AdCategoryItem">
                        <div className="AdCategoryName">
                          <div 
                            className="AdColorIndicator" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="AdName">{category.name}</span>
                        </div>
                        <span className="AdValue">{formatCurrency(category.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'trends' && (
          <div className="AdCard AdTrendsCard">
            <h2 className="AdSectionTitle">
              <span className="AdIcon">📈</span>
              Financial Trends ({startYear}-{endYear})
            </h2>
            
            <div className="AdTrendsContainer">
              <div className="AdTrendChart">
                <h3>Allocation Trend</h3>
                <div className="AdChart">
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
              
              <div className="AdTrendChart">
                <h3>Spending Trend</h3>
                <div className="AdChart">
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
            
            <div className="AdUtilizationChart">
              <h3>Utilization Rate by Year</h3>
              <div className="AdChart">
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

        {viewMode === 'allocation' && (
          <div className="AdCard AdAllocationCard">
            <h2 className="AdSectionTitle">
              <span className="AdIcon">💰</span>
              Fund Allocation Management
            </h2>
            
            <div className="AdAllocationContent">
              <div className="AdAllocationHeader">
                <h3>Current Allocations for {selectedYear}</h3>
                <button 
                  onClick={() => setShowUpdateModal(true)} 
                  className="AdBtnPrimary"
                >
                  Update Allocations
                </button>
              </div>
              
              <div className="AdAllocationSummary">
                <div className="AdAllocationItem">
                  <div className="AdAllocationLabel">Total Allocation</div>
                  <div className="AdAllocationValue">{formatCurrency(latestData.allocation || 0)}</div>
                </div>
                
                <div className="AdAllocationItem">
                  <div className="AdAllocationLabel">Total Spent</div>
                  <div className="AdAllocationValue">{formatCurrency(latestData.spent || 0)}</div>
                </div>
                
                <div className="AdAllocationItem">
                  <div className="AdAllocationLabel">Balance</div>
                  <div className="AdAllocationValue">{formatCurrency(latestData.balance || 0)}</div>
                </div>
              </div>
              
              <h3 className="AdCategoryTitle">Category Allocations</h3>
              <div className="AdCategoryAllocations">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="AdCategoryAllocationItem">
                    <div className="AdCategoryName">
                      <div 
                        className="AdColorIndicator" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="AdName">{category.name}</span>
                    </div>
                    <span className="AdValue">{formatCurrency(category.value)}</span>
                    <div className="AdProgressBar">
                      <div 
                        className="AdProgress" 
                        style={{ width: `${(category.value / latestData.spent * 100)}%` }}
                      ></div>
                    </div>
                    <span className="AdPercentage">
                      {latestData.spent ? ((category.value / latestData.spent) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && (
          <div className="AdModalOverlay">
            <div className="AdModal">
              <div className="AdModalHeader">
                <h3>Update Financial Allocation for {selectedYear}</h3>
                <button className="AdCloseButton" onClick={() => setShowUpdateModal(false)}>×</button>
              </div>
              <div className="AdModalBody">
                <div className="AdUpdateForm">
                  <div className="AdFormSection">
                    <h4>Total Allocation</h4>
                    <div className="AdFormGroup">
                      <label>Total Fund Allocation</label>
                      <input 
                        type="number" 
                        value={updateFormData.allocation}
                        onChange={handleAllocationChange}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="AdFormSection">
                    <h4>Category Allocations</h4>
                    <p className="AdFormNote">
                      Total Category Allocation: {formatCurrency(getTotalCategoryAllocation())}
                    </p>
                    
                    {Object.entries(updateFormData.categories).map(([category, value]) => (
                      <div key={category} className="AdFormGroup">
                        <label>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                        <input 
                          type="number" 
                          value={value}
                          onChange={(e) => handleCategoryAllocationChange(category, e.target.value)}
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="AdModalFooter">
                <button className="AdBtnSecondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button className="AdBtnPrimary" onClick={handleUpdateFinancialData}>Update Financial Data</button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="AdModalOverlay">
            <div className="AdModal">
              <div className="AdModalHeader">
                <h3>Submit Feedback</h3>
                <button className="AdCloseButton" onClick={() => setShowFeedbackModal(false)}>×</button>
              </div>
              <div className="AdModalBody">
                <p>Your feedback helps us improve the admin portal. Please share your thoughts, suggestions, or report any issues.</p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback here..."
                  rows={5}
                ></textarea>
              </div>
              <div className="AdModalFooter">
                <button className="AdBtnSecondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button className="AdBtnPrimary" onClick={handleSubmitFeedback}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
