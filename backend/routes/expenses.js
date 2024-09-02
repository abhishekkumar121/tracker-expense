const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// @route   GET /api/expenses
// @desc    Get all expenses for a user
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { description, amount, category } = req.body;

  try {
    const newExpense = new Expense({
      user: req.user.id,
      description,
      amount,
      category,
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put("/:id", authMiddleware, async (req, res) => {
  const { description, amount, category } = req.body;

  // Build expense object
  const expenseFields = {};
  if (description) expenseFields.description = description;
  if (amount) expenseFields.amount = amount;
  if (category) expenseFields.category = category;

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    // Ensure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: expenseFields },
      { new: true }
    );

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Expense not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    // Ensure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // await expense.remove();
    await Expense.findByIdAndDelete(req.params.id);

    res.json({ msg: "Expense removed" });

    // res.json({ msg: "Expense removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Expense not found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
