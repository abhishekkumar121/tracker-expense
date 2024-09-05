import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState({ isPremium: false }); // Mock user, change as needed

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
  });
  const [editId, setEditId] = useState(null);

  const { description, amount, category } = formData;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load itemsPerPage from local storage or default to 10
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return localStorage.getItem("itemsPerPage")
      ? parseInt(localStorage.getItem("itemsPerPage"))
      : 10;
  });

  // Pagination: Calculate paginated expenses
  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = expenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to the first page
    localStorage.setItem("itemsPerPage", value); // Save to local storage
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchExpenses = async (page = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/expenses?page=${page}&limit=${itemsPerPage}`, // Use both page and limit
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setExpenses(res.data.expenses);
      setCurrentPage(res.data.currentPage); // Update the current page
      setTotalPages(res.data.totalPages); // Update total pages
    } catch (err) {
      console.error(err);
      alert("Error fetching expenses");
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage); // Fetch for the current page
  }, [itemsPerPage, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchExpenses(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchExpenses(currentPage + 1);
    }
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    try {
      if (editId) {
        // Update expense
        const res = await axios.put(
          `http://localhost:5000/api/expenses/${editId}`,
          { description, amount, category },
          { headers: { Authorization: token } }
        );
        setExpenses(
          expenses.map((exp) => (exp._id === editId ? res.data : exp))
        );
        setEditId(null);
      } else {
        // Add new expense
        const res = await axios.post(
          "http://localhost:5000/api/expenses/",
          { description, amount, category },
          { headers: { Authorization: token } }
        );
        setExpenses([res.data, ...expenses]);
      }
      setFormData({ description: "", amount: "", category: "" });
    } catch (err) {
      console.error(err);
      alert("Error submitting expense");
    }
  };

  const onDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: token },
      });
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    }
  };

  const onEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
    });
    setEditId(expense._id);
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Calculate total expense
  const totalExpense = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  //handle payments
  const handlePayment = async () => {
    try {
      const orderResponse = await axios.post(
        "http://localhost:5000/api/payment/create-order"
      );
      console.log("Order created:", orderResponse.data);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use environment variable
        amount: orderResponse.data.amount,
        currency: "INR",
        name: "Expense Tracker Premium",
        description: "Upgrade to Premium Features",
        order_id: orderResponse.data.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              "http://localhost:5000/api/payment/verify",
              response
            );
            if (verifyResponse.data.status === "ok") {
              alert("Payment successful");
              setUser({ ...user, isPremium: true }); // Update the user state to premium
            } else {
              alert(
                "Payment verification failed: " + verifyResponse.data.message
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed: " + error.message);
          }
        },
        prefill: {
          name: "Your Name",
          email: "youremail@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiation failed: " + error.message);
    }
  };

  //download expenses
  const handleDownload = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
    try {
      const res = await axios.get(
        "http://localhost:5000/api/expenses/download",
        {
          headers: { Authorization: token },
          responseType: "blob", // Important for downloading files
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading expenses");
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mt: 4,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h4">Expense Tracker</Typography>
          <Button variant="outlined" color="secondary" onClick={onLogout}>
            Logout
          </Button>
        </Box>
        {/* Display total expense */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5">
            Total Expense: Rs.{totalExpense.toFixed(2)}
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Description"
                name="description"
                value={description}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={amount}
                onChange={onChange}
                fullWidth
                required
                inputProps={{ min: "0", step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={category}
                  onChange={onChange}
                  label="Category"
                >
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Transport">Transport</MenuItem>
                  <MenuItem value="Entertainment">Entertainment</MenuItem>
                  <MenuItem value="Utilities">Utilities</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sm={2}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {editId ? "Update" : "Add"}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handlePayment}>
            Get Premium Features
          </Button>
          <Button variant="contained" color="primary" onClick={handleDownload}>
            Download Expenses
          </Button>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            displayEmpty
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={40}>40</MenuItem>
          </Select>
          {expenses.length === 0 ? (
            <Typography>No expenses found.</Typography>
          ) : (
            expenses.map((expense) => (
              <Card key={expense._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="h6">
                        {expense.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>Rs.{expense.amount.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>{expense.category}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>
                        {new Date(expense.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton onClick={() => onEdit(expense)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => onDelete(expense._id)}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Typography variant="h6" sx={{ mx: 2 }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
