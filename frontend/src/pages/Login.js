import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err.response.data);
      alert(err.response.data.msg);
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
            Login
          </Typography>
          <form onSubmit={onSubmit}>
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
          <Button
            onClick={() => navigate("/register")}
            color="secondary"
            sx={{ mt: 2 }}
          >
            Don't have an account? Register
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;
