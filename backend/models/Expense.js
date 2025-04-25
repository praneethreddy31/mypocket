// models/Expense.js
const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: String,
  expense: Number,
  date: Date,
});

module.exports = mongoose.model("Expense", ExpenseSchema);