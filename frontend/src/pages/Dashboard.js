import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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
  InputLabel,
  FormControl,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
  });
  const [editId, setEditId] = useState(null);

  const { description, amount, category } = formData;

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    try {
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: {
          Authorization: token,
        },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

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
          "http://localhost:5000/api/expenses",
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
      </motion.div>
    </Container>
  );
};

export default Dashboard;
