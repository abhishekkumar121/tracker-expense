const Expense = require("../models/expenseModel");

// Add Expense
exports.addExpense = async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  // Create a new expense object
  const expense = new Expense({
    title,
    amount,
    category,
    description,
    date,
  });

  try {
    // Validations
    if (!title || !amount || !category || !description || !date) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    if (amount <= 0 || typeof amount !== "number") {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number!" });
    }

    // Save the expense to the database
    await expense.save();
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
  try {
    // Fetch all expenses, sorted by the creation date in descending order
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
