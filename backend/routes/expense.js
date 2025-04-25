const express = require("express");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget"); // Assuming a Budget model exists
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to extract user from token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // Attach decoded user data to the request object
    next();
  });
};

// Fetch all expense entries and calculate the total expense for the logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();
    const selectedYear = year ? parseInt(year) : currentDate.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // months are 0-indexed

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    const expenseList = await Expense.find({
      userID: req.user.id,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalExpense = expenseList.reduce((total, expense) => total + expense.expense, 0);
    res.json({ expenses: expenseList, totalExpense });
  } catch (err) {
    res.status(500).json({ message: "Error fetching expense data" });
  }
});

// Add a new expense entry
// Add a new expense entry
router.post("/", authenticate, async (req, res) => {
  const { category, expense, date } = req.body;
  const userId = req.user.id;

  if (!category || !expense) return res.status(400).json({ message: "Category and expense are required" });

  try {
    const expenseAmount = parseFloat(expense);
    const expenseDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(expenseDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(expenseDate.setHours(23, 59, 59, 999));

    let existingExpense = await Expense.findOne({
      userID: userId,
      category,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingExpense) {
      // If expense exists, update the expense by adding the new value
      existingExpense.expense += expenseAmount;
      await existingExpense.save();
      return res.status(200).json({ expense: existingExpense });
    } else {
      // If no existing expense, create a new one
      const newExpense = new Expense({
        category,
        expense: expenseAmount,
        userID: userId,
        date: startOfDay,
      });
      await newExpense.save();
      return res.status(201).json({ expense: newExpense });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error adding expense" });
  }
});

// Update an existing expense entry
router.put("/:id", authenticate, async (req, res) => {
  const { expense } = req.body;
  const { id } = req.params;

  if (!expense || typeof expense !== "number" || expense <= 0) {
    return res.status(400).json({ message: "A valid expense amount is required" });
  }

  try {
    const expenseToUpdate = await Expense.findById(id);
    if (!expenseToUpdate || expenseToUpdate.userID.toString() !== req.user.id) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expenseToUpdate.expense = expense;
    await expenseToUpdate.save();

    res.json({ expense: expenseToUpdate });
  } catch (err) {
    res.status(500).json({ message: "Error updating expense" });
  }
});


// Remove an expense entry
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findOneAndDelete({ _id: id, userID: req.user.id });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing expense" });
  }
});

module.exports = router;