const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    income: { type: Number, required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Income || mongoose.model("Income", incomeSchema);