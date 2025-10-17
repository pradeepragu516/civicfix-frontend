import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landscape from "./components/authentication/Landscape";
import Register from "./components/authentication/Register";
import Login from "./components/authentication/Login";
import AdminLogin from "./components/authentication/AdminLogin";
import UserDashboard from "./components/userpanel/UserDashboard";
import UserDashboardHome from "./components/userpanel/UserDashboardHome";
import Report from "./components/userpanel/Report";
import MyReports from "./components/userpanel/MyReports";
import Financial from "./components/userpanel/Financial";
import Profiles from "./components/userpanel/Profiles";
import CommunityDiscussion from "./components/userpanel/CommunityDiscussion";
import Settings from "./components/userpanel/Settings";
import AdminDashboard from "./components/adminpanel/AdminDashboard";
import AdminDashboardHome from "./components/adminpanel/AdminDashboardHome";
import ManageIssues from "./components/adminpanel/ManageIssues";
import VolunteerManagement from "./components/adminpanel/VolunteerManagement";
import FinancialManagement from "./components/adminpanel/FinancialManagement";
import Profile from "./components/adminpanel/Profile";
import Notification from "./components/adminpanel/Notification";
import Setting from "./components/adminpanel/Setting";
import VolunteerCreation from "./components/adminpanel/VolunteerCreation";
// import statement removed or completed

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landscape />} />
        <Route path="/user-signup" element={<Register />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Nested Routes for User Dashboard */}
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route index element={<UserDashboardHome />} />
          <Route path="profile" element={<Profiles />} />
          <Route path="report" element={<Report />} />
          <Route path="myreports" element={<MyReports />} />
          <Route path="Finance" element={<Financial />} />
          <Route path="community" element={<CommunityDiscussion />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="issues" element={<ManageIssues />} />
          <Route path="volunteer" element={<VolunteerCreation />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
          <Route path="finance" element={<FinancialManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notification" element={<Notification />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
