import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/ExpenseManagement.css";

const ExpenseManagement = () => {
  const [expenseList, setExpenseList] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newExpense, setNewExpense] = useState("");
  const [message, setMessage] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  // Fetch the current month and format it
  useEffect(() => {
    const month = new Date().toLocaleString("default", { month: "long" });
    const year = new Date().getFullYear();
    setCurrentMonth(`${month} ${year}`);
  }, []);

  // Fetch expense and budget categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Please log in to access expense data.");
          return;
        }
  
        const [expenseResponse, budgetResponse] = await Promise.all([
          axios.get("https://mypocketai.onrender.com/api/expense", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://mypocketai.onrender.com/api/budget", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        setExpenseList(expenseResponse.data.expenses);
        setTotalExpense(
          expenseResponse.data.expenses.reduce((total, expense) => total + expense.expense, 0)
        );
        
        // Assuming budgetResponse.data.budgets contains the categories and their allocated budgets
        setBudgetCategories(budgetResponse.data.budgets);
      } catch (err) {
        setMessage("Error fetching data. Please try again.");
      }
    };
  
    fetchData();
  }, []);
  

  // Add a new expense
  // Add a new expense
const handleAddExpense = async () => {
  if (!selectedCategory || !newExpense) {
    setMessage("Please fill out both fields.");
    return;
  }

  const expenseAmount = parseFloat(newExpense);
  if (expenseAmount <= 0) {
    setMessage("Please provide a valid expense.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to add an expense.");
      return;
    }

    // Fetch the budget for the selected category
    const category = budgetCategories.find((c) => c.category === selectedCategory);
    const categoryBudget = category ? category.budgetAllocated : 0;

    // Calculate the total expense for the category (existing expenses + new expense)
    const totalCategoryExpense = expenseList
      .filter((expense) => expense.category === selectedCategory)
      .reduce((total, expense) => total + expense.expense, 0) + expenseAmount;

    // Check if the expense exceeds the allocated budget
    if (totalCategoryExpense > categoryBudget) {
      setMessage(`Total expense exceeds the allocated budget for ${selectedCategory}, Allocated: ₹${categoryBudget} only.`);
      return;
    }

    await axios.post(
      "https://mypocketai.onrender.com/api/expense",
      { category: selectedCategory, expense: expenseAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("Expense added successfully!");
    setSelectedCategory("");
    setNewExpense("");
    fetchUpdatedData(); // Re-fetch the updated data after adding the expense
  } catch (err) {
    setMessage("Error adding expense. Please try again.");
  }
};

// Update an expense
const handleUpdateExpense = async (id, updatedExpense) => {
  try {
    const expenseAmount = parseFloat(updatedExpense);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setMessage("Please provide a valid expense.");
      return;
    }

    // Fetch the original category of the expense
    const expenseCategory = expenseList.find((expense) => expense._id === id)?.category;
    const categoryBudget = budgetCategories.find(
      (category) => category.category === expenseCategory
    )?.budgetAllocated || 0;

    // Calculate the total expense for the category (existing expenses excluding the current one + updated expense)
    const totalCategoryExpense = expenseList
      .filter((expense) => expense.category === expenseCategory && expense._id !== id)
      .reduce((total, expense) => total + expense.expense, 0) + expenseAmount;

    // Check if the updated expense exceeds the allocated budget
    if (totalCategoryExpense > categoryBudget) {
      setMessage(`Updated total expense exceeds the allocated budget for ${expenseCategory}, Allocated: ₹${categoryBudget} only.`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to update an expense.");
      return;
    }

    await axios.put(
      `https://mypocketai.onrender.com/api/expense/${id}`,
      { expense: expenseAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("Expense updated successfully!");
    fetchUpdatedData(); // Re-fetch the updated data after updating the expense
  } catch (err) {
    setMessage("Error updating expense. Please try again.");
  }
};

  

  // Remove an expense
  const handleRemoveExpense = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to remove an expense.");
        return;
      }

      await axios.delete(`https://mypocketai.onrender.com/api/expense/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Expense removed successfully!");
      fetchUpdatedData();
    } catch (err) {
      setMessage("Error removing expense. Please try again.");
    }
  };

  // Re-fetch data
  const fetchUpdatedData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to access data.");
        return;
      }

      const response = await axios.get("https://mypocketai.onrender.com/api/expense", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExpenseList(response.data.expenses);
      setTotalExpense(
        response.data.expenses.reduce((total, expense) => total + expense.expense, 0)
      );
    } catch (err) {
      setMessage("Error fetching data. Please try again.");
    }
  };

  return (
    <div className="expense-container">
      <h2>Expense Management</h2>
      <p className="date-display">Month: {currentMonth}</p>
      <div className="expense-summary">
        <h3>Total Expense: ₹{totalExpense}</h3>
      </div>
      {message && <p className="message">{message}</p>}

      <h4>Add Expense</h4>
      <div className="add-expense">
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Select Category</option>
        {budgetCategories.map((category, index) => (
          <option key={category._id} value={category.category}>
            {category.category}
          </option>
        ))}
      </select>
        <input
          type="number"
          value={newExpense}
          onChange={(e) => setNewExpense(e.target.value)}
          placeholder="Expense"
        />
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>

      <h4>Expense List</h4>
      <ul className="expense-list">
        {expenseList.map((item) => (
          <li key={item._id} className="expense-item">
            <span>
              {item.category}: ₹{item.expense}
            </span>
            <span>Date: {new Date(item.date).toLocaleDateString()}</span>
            <p>Update Value:</p>
            <input
              type="number"
              value={item.expense}
              onChange={(e) => handleUpdateExpense(item._id, parseFloat(e.target.value))}
            />
            <button onClick={() => handleRemoveExpense(item._id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseManagement;