import React, { createContext, useState, useContext } from "react";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);

  const addExpense = (expense) => {
    setExpenses([...expenses, expense]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);
