import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Expense Tracker</h1>
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
    </div>
  );
}

export default Home;
