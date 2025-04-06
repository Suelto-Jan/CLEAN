import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import bsuLogo from "../images/BSU LOGO.png";
import cotLogo from "../images/COT.png";

// Theme setup
const theme = createTheme({
  palette: {
    primary: {
      main: "#4b6cb7",
    },
    secondary: {
      main: "#182848",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 300,
    },
  },
});

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !pin) {
      setErrorMessage("Please enter both email and PIN.");
      return;
    }
  
    if (pin.length !== 6) {
      setErrorMessage("PIN must be a 6-digit number.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:8000/api/admin/login", {
        email,
        pin,
      });
  
      console.log(response.data); // Check if the token is being returned in the response.
  
      if (response.status === 200) {
       
       console.log(localStorage.getItem("token")); // Check if token is set

        // Store the new token and admin data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
  
        // Navigate to the dashboard
        navigate("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Unauthorized access. Admin privileges required.");
        } else {
          setErrorMessage(error.response.data.message || "Invalid login credentials.");
        }
      } else if (error.request) {
        setErrorMessage("Server did not respond. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          padding: 3,
          position: "relative",
          background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
        }}
      >
        {/* Back Button */}
        <Tooltip title="Go Back" arrow>
          <IconButton
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              bgcolor: "white",
              "&:hover": { bgcolor: "grey.100" },
              boxShadow: 3,
              borderRadius: "20%",
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon fontSize="large" sx={{ color: "primary.main" }} />
          </IconButton>
        </Tooltip>

        {/* Login Box with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 500 }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 5,
              boxShadow: 6,
              p: 4,
              textAlign: "center",
              zIndex: 1,
              transition: "all 0.3s ease",
            }}
          >
            {/* Logos */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "center", gap: 2 }}>
              <motion.img
                src={bsuLogo}
                alt="BSU Logo"
                style={{ height: 60 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <motion.img
                src={cotLogo}
                alt="COT Logo"
                style={{ height: 60 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </Box>

            {/* Titles */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: "primary.main" }}>
              Bukidnon State University
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              College of Technologies
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 600 }}>
              Admin Login
            </Typography>

            {/* Error Alert */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Alert severity="error" sx={{ mb: 2, fontSize: "0.9rem", fontWeight: 500 }}>
                  {errorMessage}
                </Alert>
              </motion.div>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errorMessage}
                helperText={errorMessage && "Please enter a valid email address."}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    borderRadius: 5,
                    backgroundColor: "rgba(244, 246, 248, 1)",
                    boxShadow: 1,
                  },
                  "& .Mui-focused": {
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
              />
              <TextField
                label="PIN"
                type="password"
                variant="outlined"
                fullWidth
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                error={!!errorMessage}
                helperText={errorMessage && "PIN must be a 6-digit number."}
                sx={{
                  mb: 3,
                  "& .MuiInputBase-root": {
                    borderRadius: 5,
                    backgroundColor: "rgba(244, 246, 248, 1)",
                    boxShadow: 1,
                  },
                  "& .Mui-focused": {
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
                inputProps={{
                  maxLength: 6, // Limit input to 6 digits
                }}
                onInput={(e) => {
                  // Prevent input of non-numeric characters
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "secondary.main" },
                  transition: "all 0.3s ease",
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 5,
                  mt: 2,
                  boxShadow: 2,
                }}
              >
                Login
              </Button>
            </Box>

            {/* Registration Link */}
            <Typography variant="body2" sx={{ mt: 3, fontWeight: 400 }}>
              Not an admin?{" "}
              <Button
                onClick={() => navigate("/register")}
                sx={{ color: "primary.main", fontWeight: 600, textTransform: "none" }}
              >
                Register here
              </Button>
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLoginPage;
