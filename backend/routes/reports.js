const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    req.user = decoded;
    next();
  });
};

// Reports route
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { year, month } = req.query;

    const currentDate = new Date();
    const selectedYear = parseInt(year) || currentDate.getFullYear();
    const selectedMonth = parseInt(month) || currentDate.getMonth();

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    // Aggregation pipelines
    const incomeSources = await Income.aggregate([
      { $match: { userID: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$source", totalIncome: { $sum: "$income" } } },
    ]);

    const incomeByDate = await Income.aggregate([
      { $match: { userID: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, totalIncome: { $sum: "$income" } } },
    ]);

    const budgets = await Budget.find({ userID: userId });
    const budgetAllocated = budgets.reduce((sum, item) => sum + item.budgetAllocated, 0);

    const expenses = await Expense.aggregate([
      { $match: { userID: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$category", totalExpense: { $sum: "$expense" } } },
    ]);

    const expenseByDate = await Expense.aggregate([
      { $match: { userID: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, totalExpense: { $sum: "$expense" } } },
    ]);

    const totalIncome = incomeSources.reduce((sum, item) => sum + item.totalIncome, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.totalExpense, 0);

    // Income Graphs
    const incomeGraphs = {
      labels: incomeSources.map((source) => source._id),
      datasets: [{ label: "Income by Source", data: incomeSources.map((source) => source.totalIncome) }],
    };

    const incomeByDateGraphs = {
      labels: incomeByDate.map((item) => item._id),
      datasets: [{ label: "Income by Date", data: incomeByDate.map((item) => item.totalIncome) }],
    };

    // Budget Graphs
    const expenseMap = expenses.reduce((acc, item) => {
      acc[item._id] = item.totalExpense;
      return acc;
    }, {});

    const budgetGraphs = {
      labels: budgets.map((item) => item.category),
      datasets: [
        { label: "Allocated", data: budgets.map((item) => item.budgetAllocated) },
        {
          label: "Remaining",
          data: budgets.map((item) => item.budgetAllocated - (expenseMap[item.category] || 0)),
        },
      ],
    };

    // Expense Graphs
    const expenseGraphs = {
      labels: expenses.map((item) => item._id),
      datasets: [{ label: "Expense by Category", data: expenses.map((item) => item.totalExpense) }],
    };

    const expenseByDateGraphs = {
      labels: expenseByDate.map((item) => item._id),
      datasets: [{ label: "Expense by Date", data: expenseByDate.map((item) => item.totalExpense) }],
    };

    res.json({
      totalIncome,
      totalExpense,
      budgetAllocated,
      incomeGraphs,
      incomeByDateGraphs,
      budgetGraphs,
      expenseGraphs,
      expenseByDateGraphs,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
});

module.exports = router;