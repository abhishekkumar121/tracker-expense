import React, { useState } from "react";
import { useExpense } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { expenses, addExpense, deleteExpense } = useExpense();
  const { logout } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newExpense = { id: Date.now(), title, amount };
    addExpense(newExpense);
    setTitle("");
    setAmount("");
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      {/* <button onClick={logout}>Logout</button> */}
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Add Expense</button>
      </form>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.title}: ${expense.amount}
            <button onClick={() => deleteExpense(expense.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
