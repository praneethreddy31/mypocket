const express = require("express");
const Budget = require("../models/Budget");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decoded; // Attach user data to the request object
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication error", error });
  }
};

// Fetch all budgets for the logged-in user
router.get("/", authenticate, async (req, res) => {
  try {
    const budgets = await Budget.find({ userID: req.user.id });
    res.status(200).json({ budgets });
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget data", error });
  }
});

// Add a new budget entry
router.post("/", authenticate, async (req, res) => {
  const { category, budgetAllocated } = req.body;

  if (!category || !budgetAllocated) {
    return res.status(400).json({ message: "Category and Budget Allocated are required" });
  }

  try {
    const newBudget = await Budget.create({
      userID: req.user.id,
      category,
      budgetAllocated
    });

    res.status(201).json({ budget: newBudget });
  } catch (error) {
    res.status(500).json({ message: "Error adding budget", error });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { budgetAllocated } = req.body;
  const { id } = req.params;

  // Validate input
  if (!budgetAllocated || typeof budgetAllocated !== "number" || budgetAllocated <= 0) {
    return res.status(400).json({ message: "A valid budget amount is required" });
  }

  try {
    // Find and update the budget entry
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, userID: req.user.id },
      { budgetAllocated },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget entry not found" });
    }

    res.json({ message: "Budget updated successfully", budget: updatedBudget });
  } catch (err) {
    res.status(500).json({ message: "Error updating budget" });
  }
});


// Remove a budget entry
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userID: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing budget", error });
  }
});

module.exports = router;