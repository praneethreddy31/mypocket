const express = require("express");
const Income = require("../models/Income");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to extract user from token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; 
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded; // Attach decoded user data to the request object
    next();
  });
};

// Fetch all income entries and calculate the total income for the logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    // Get year and month from query parameters, default to current year and month if not provided
    const { year, month } = req.query;
    const currentDate = new Date();

    // Default to current year and month if not provided
    const selectedYear = year ? parseInt(year) : currentDate.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // months are 0-indexed

    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    // Find income entries within the specified month and year
    const incomeList = await Income.find({
      userID: req.user.id,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const totalIncome = incomeList.reduce((total, income) => total + income.income, 0);

    res.json({ income: incomeList, totalIncome });
  } catch (err) {
    res.status(500).json({ message: "Error fetching income data" });
  }
});

// Add a new income entry
router.post("/", authenticate, async (req, res) => {
  const { source, income } = req.body;
  const userId = req.user.id;

  if (!source || !income) {
    return res.status(400).json({ message: "Source and Income are required" });
  }

  try {
    // Check if the income source already exists for the current month
    const existingIncome = await Income.findOne({
      userID: userId,
      source: source,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    });

    if (existingIncome) {
      // If income source exists, update it
      existingIncome.income = Number(existingIncome.income) + Number(income); // Ensure both values are numbers
      await existingIncome.save();
      return res.status(200).json({ income: existingIncome });
    } else {
      // If income source doesn't exist, create new
      const newIncome = new Income({
        source,
        income,
        userID: userId,
        date: new Date(),
      });
      await newIncome.save();
      return res.status(201).json({ income: newIncome });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error adding income" });
  }
});

// Update an existing income entry
router.put("/:id", authenticate, async (req, res) => {
  const { income } = req.body;
  const { id } = req.params;

  if (!income || typeof income !== "number" || income <= 0) {
    return res.status(400).json({ message: "A valid income amount is required" });
  }

  try {
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, userID: req.user.id },
      { income },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    
    res.json({ income: updatedIncome.income });
  } catch (err) {
    res.status(500).json({ message: "Error updating income" });
  }
});

// Remove an income entry
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const income = await Income.findOneAndDelete({ _id: id, userID: req.user.id });
    
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    
    res.json({ message: "Income removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error removing income" });
  }
});

module.exports = router;