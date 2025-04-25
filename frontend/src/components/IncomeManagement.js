import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/IncomeManagement.css";

const IncomeManagement = () => {
  const [incomeList, setIncomeList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [newAmount, setNewAmount] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  // Static list of income sources
  const incomeSources = ["Pocket Money", "Freelancing", "Investments", "Stipends", 'Part-time Job', 'Others'];

  // Fetch the current month and format it
  useEffect(() => {
    const month = new Date().toLocaleString("default", { month: "long" });
    const year = new Date().getFullYear(); // Get the current year
    setCurrentMonth(`${month} ${year}`); // Set both month and year
  }, []);

  // Fetch income data when the component loads
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Please log in to see your income data.");
          return;
        }

        const response = await axios.get("https://mypocketai.onrender.com/api/income", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIncomeList(response.data.income);
        setTotalIncome(response.data.totalIncome);
      } catch (err) {
        setMessage("Error fetching income data");
      }
    };

    fetchIncomeData();
  }, []);

  // Add a new income entry
  const handleAddIncome = async () => {
    if (!selectedSource || !newAmount) {
      setMessage("Please fill out both fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to add income.");
        return;
      }

      await axios.post(
        "https://mypocketai.onrender.com/api/income",
        { source: selectedSource, income: newAmount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Income added successfully!");
      setNewAmount("");
      setSelectedSource("");
      const response = await axios.get("https://mypocketai.onrender.com/api/income", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncomeList(response.data.income);
      setTotalIncome(response.data.totalIncome);
    } catch (err) {
      setMessage("Error adding income");
    }
  };

  // Handle real-time income update
  const handleIncomeChange = async (id, newIncome) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to update income.");
        return;
      }

      if (isNaN(newIncome) || newIncome <= 0) {
        setMessage("Please provide a valid Income allocation.");
        return;
      }

      // Optimistically update UI
      const updatedIncomeList = incomeList.map((item) =>
        item._id === id ? { ...item, income: newIncome } : item
      );
      setIncomeList(updatedIncomeList);
      setTotalIncome(updatedIncomeList.reduce((total, income) => total + income.income, 0));

      // Send the update request to the backend
      await axios.put(
        `https://mypocketai.onrender.com/api/income/${id}`,
        { income: newIncome },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      setMessage("Error updating income");
    }
  };

  // Remove an income entry
  const handleRemoveIncome = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to remove income.");
        return;
      }

      await axios.delete(`https://mypocketai.onrender.com/api/income/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedIncomeList = incomeList.filter((item) => item._id !== id);
      setIncomeList(updatedIncomeList);
      setTotalIncome(updatedIncomeList.reduce((total, income) => total + income.income, 0));

      setMessage("Income removed successfully!");
    } catch (err) {
      setMessage("Error removing income");
    }
  };

  return (
    <div className="income-container">
      <h2>Income Management</h2>
      <p className="date-display">Month: {currentMonth}</p>

      <div className="income-summary">
        <h3>Total Income: ₹{totalIncome}</h3>
      </div>

      {message && <p className="message">{message}</p>}

      <p>Add Income</p>
      <div className="add-income">
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
        >
          <option value="">Select Income Source</option>
          {incomeSources.map((source, index) => (
            <option key={index} value={source}>
              {source}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleAddIncome}>Add Income</button>
      </div>

      <p>Income List</p>
      <ul className="income-list">
        {incomeList.map((item) => (
          <li key={item._id} className="income-item">
            <span>{item.source}: ₹{item.income} </span>&nbsp;
            <span>Date: {new Date(item.date).toLocaleDateString()}</span>
            <p>Update Value:</p>&nbsp;
            <input
              type="number"
              value={item.income}
              min={1}
              onChange={(e) => handleIncomeChange(item._id, parseFloat(e.target.value))}
            />
            <button onClick={() => handleRemoveIncome(item._id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncomeManagement;