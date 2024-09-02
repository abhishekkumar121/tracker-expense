import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match");
    } else {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name,
            email,
            password,
          }
        );
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } catch (err) {
        console.error(err.response.data);
        alert(err.response.data.msg);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Register
          </Typography>
          <form onSubmit={onSubmit}>
            <TextField
              label="Name"
              name="name"
              value={name}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Confirm Password"
              name="password2"
              type="password"
              value={password2}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Register
            </Button>
          </form>
          <Button
            onClick={() => navigate("/login")}
            color="secondary"
            sx={{ mt: 2 }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Register;
