import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from './Navbar';
import '../assets/css/Dashboard.css';
import styles from '../assets/css/Auth.module.css';
import ExpenseManagement from './ExpenseManagement';
import IncomeManagement from './IncomeManagement';
import BudgetAllocation from './BudgetAllocation';
import Reports from './Reports';
import Settings from './Settings';
import MyPocketAI from './MyPocketAI';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
  
        const res = await axios.get("https://mypocketai.onrender.com/api/auth/user-details", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setUserData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  return (
    <div className="App-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          {error && <p className={styles.error}>{error}</p>}
          {loading ? (
            <p>Loading user data...</p> // Show loading text while fetching data
          ) : userData ? (
            <div className="userdata">
              <p>Username: <span>{userData.username}</span></p>
              <p>Email: <span>{userData.email}</span></p>
            </div>
          ) : (
            <p>No user data available</p>
          )}

          <ul className="dashboard-menu">
            <li><Link to="/dashboard/ai-assistance">🤖 My Pocket AI</Link></li>
            <li><Link to="/dashboard/budget-allocation">📊 Budget Allocation</Link></li>
            <li><Link to="/dashboard/expense-management">💰 Expense Management</Link></li>
            <li><Link to="/dashboard/income-management">📈 Income Management</Link></li>
            <li><Link to="/dashboard/reports">📜 Reports & Insights</Link></li>
            <li><Link to="/logout">Logout</Link></li>
          </ul>
        </div>

        <div className="dashboard-main">
          <Routes>
            <Route path="/" element={<Reports />} />
            <Route path="/expense-management" element={<ExpenseManagement />} />
            <Route path="/income-management" element={<IncomeManagement />} />
            <Route path="/budget-allocation" element={<BudgetAllocation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai-assistance" element={<MyPocketAI />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;