import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/BudgetAllocation.css";

const BudgetAllocation = () => {
  const [budgetList, setBudgetList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalBudgetAllocated, setTotalBudgetAllocated] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newBudgetAllocated, setNewBudgetAllocated] = useState("");
  const [message, setMessage] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  const categories = [
    "Groceries",
    "Rent",
    "Utilities",
    "Entertainment",
    "Savings",
    "Miscellaneous",
  ];

  // Fetch the current month and format it
  useEffect(() => {
    const month = new Date().toLocaleString("default", { month: "long" });
    const year = new Date().getFullYear();
    setCurrentMonth(`${month} ${year}`);
  }, []);

  // Fetch income and budget data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Please log in to access budget data.");
          return;
        }
  
        const [incomeResponse, budgetResponse] = await Promise.all([
          axios.get("https://mypocketai.onrender.com/api/income", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://mypocketai.onrender.com/api/budget", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        setTotalIncome(incomeResponse.data.totalIncome);
        const budgets = budgetResponse.data.budgets;
        setBudgetList(budgets);
        setTotalBudgetAllocated(
          budgets.reduce((total, budget) => total + budget.budgetAllocated, 0)
        );

        if ( totalIncome < totalBudgetAllocated) {
        setMessage("Please update Income to allocate more budget.");
        return;
      }
      } catch (err) {
        setMessage("Error fetching data. Please try again.");
      }
    };
  
    fetchData();
  }, [totalBudgetAllocated, totalIncome]);
  
  const handleAddBudget = async () => {
    if (!selectedCategory || !newBudgetAllocated) {
      setMessage("Please fill out both fields.");
      return;
    }
  
    const newAllocation = parseFloat(newBudgetAllocated);
    if (newAllocation <= 0) {
      setMessage("Please provide a valid budget amount.");
      return;
    }
  
    if (totalBudgetAllocated + newAllocation > totalIncome) {
      setMessage("Budget allocation cannot exceed total income.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to access budget data.");
        return;
      }
  
      // Check if the category already exists for the current month
      const existingBudget = budgetList.find(
        (budget) => budget.category === selectedCategory && new Date(budget.date).getMonth() === new Date().getMonth()
      );
  
      if (existingBudget) {
        // If the category already exists, update the existing budget by adding the new allocation
        await axios.put(
          `https://mypocketai.onrender.com/api/budget/${existingBudget._id}`,
          { budgetAllocated: existingBudget.budgetAllocated + newAllocation },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        setMessage("Budget updated successfully!");
      } else {
        // If the category doesn't exist, create a new budget entry
        await axios.post(
          "https://mypocketai.onrender.com/api/budget",
          { category: selectedCategory, budgetAllocated: newAllocation },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setMessage("Budget added successfully!");
      }
  
      // Fetch updated data after adding/updating the budget
      await fetchUpdatedData();
      setSelectedCategory("");
      setNewBudgetAllocated("");
  
    } catch (err) {
      setMessage("Error adding or updating budget. Please try again.");
    }
  };
  
  
  // Reusable function to fetch and update income and budget data
  const fetchUpdatedData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to access budget data.");
      return;
    }
  
    try {
      const [incomeResponse, budgetResponse] = await Promise.all([
        axios.get("https://mypocketai.onrender.com/api/income", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://mypocketai.onrender.com/api/budget", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      setTotalIncome(incomeResponse.data.totalIncome);
      const budgets = budgetResponse.data.budgets;
      setBudgetList(budgets);
      setTotalBudgetAllocated(
        budgets.reduce((total, budget) => total + budget.budgetAllocated, 0)
      );
    } catch (err) {
      setMessage("Error fetching budget data. Please try again.");
    }
  };
  

  const handleUpdateBudget = async (id, newAllocation) => {
    try {
      const updatedAllocation = parseFloat(newAllocation);
      if (isNaN(updatedAllocation) || updatedAllocation <= 0) {
        setMessage("Please provide a valid budget allocation.");
        return;
      }
  
      const currentBudget = budgetList.find((b) => b._id === id)?.budgetAllocated || 0;
      if (updatedAllocation + totalBudgetAllocated - currentBudget > totalIncome) {
        setMessage("Updated budget exceeds total income.");
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to update a budget.");
        return;
      }
  
      await axios.put(
        `https://mypocketai.onrender.com/api/budget/${id}`,
        { budgetAllocated: updatedAllocation },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setMessage("Budget updated successfully!");
  
      // Inline the refresh data logic
      const [incomeResponse, budgetResponse] = await Promise.all([
        axios.get("https://mypocketai.onrender.com/api/income", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://mypocketai.onrender.com/api/budget", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      setTotalIncome(incomeResponse.data.totalIncome);
      const budgets = budgetResponse.data.budgets;
      setBudgetList(budgets);
      setTotalBudgetAllocated(
        budgets.reduce((total, budget) => total + budget.budgetAllocated, 0)
      );
    } catch (err) {
      setMessage("Error updating budget. Please try again.");
    }
  };
  
  const handleRemoveBudget = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to remove a budget.");
        return;
      }
  
      await axios.delete(`https://mypocketai.onrender.com/api/budget/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setMessage("Budget removed successfully!");
  
      // Inline the refresh data logic
      const [incomeResponse, budgetResponse] = await Promise.all([
        axios.get("https://mypocketai.onrender.com/api/income", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://mypocketai.onrender.com/api/budget", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      setTotalIncome(incomeResponse.data.totalIncome);
      const budgets = budgetResponse.data.budgets;
      setBudgetList(budgets);
      setTotalBudgetAllocated(
        budgets.reduce((total, budget) => total + budget.budgetAllocated, 0)
      );
    } catch (err) {
      setMessage("Error removing budget. Please try again.");
    }
  };
  

  return (
    <div className="budget-container">
      <h2>Budget Allocation</h2>
      <p className="date-display">Month: {currentMonth}</p>
      <div className="budget-summary">
        <h3>Total Income: ₹{totalIncome}</h3>
        <h4>Total Budget Allocated: ₹{totalBudgetAllocated}</h4>
        <h4>Budget Remaining: ₹{totalIncome - totalBudgetAllocated}</h4>
      </div>
      {message && <p className="message">{message}</p>}

      <h4>Add Budget</h4>
      <div className="add-budget">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={newBudgetAllocated}
          onChange={(e) => setNewBudgetAllocated(e.target.value)}
          placeholder="Budget Amount"
        />
        <button onClick={handleAddBudget}>Add Budget</button>
      </div>

      <div>
        <h4>Budget List</h4>
        <ul className="budget-list">
          {budgetList.map((item) => (
            <li key={item._id} className="budget-item">
              <span>
                {item.category}: ₹{item.budgetAllocated}
              </span>
              <span>Date: {new Date(item.date).toLocaleDateString()}</span>
              <p>Update Value:</p>
              <input
                type="number"
                value={item.budgetAllocated}
                onChange={(e) => handleUpdateBudget(item._id, parseFloat(e.target.value))}
              />
              <button onClick={() => handleRemoveBudget(item._id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BudgetAllocation;