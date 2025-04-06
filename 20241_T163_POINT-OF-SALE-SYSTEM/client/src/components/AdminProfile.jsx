import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Avatar,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCamera, Save, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
  
        if (!token) {
          setErrorMessage("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }
  
        const response = await axios.get("http://localhost:8000/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
  
        if (response && response.data) {
          setAdmin(response.data);
          setFormData({
            firstname: response.data.firstname || "",
            lastname: response.data.lastname || "",
            email: response.data.email || "",
            pin: "",
            image: null,
          });
          setImagePreview(response.data.image ? `http://localhost:8000/${response.data.image}` : null);
        } else {
          setErrorMessage("Failed to fetch admin data.");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setErrorMessage("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAdminData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const form = new FormData();
    form.append("firstname", formData.firstname);
    form.append("lastname", formData.lastname);
    form.append("email", formData.email);
    if (formData.pin) form.append("pin", formData.pin);
    if (formData.image) form.append("image", formData.image);

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:8000/api/admin", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setErrorMessage("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!admin) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography color="error">Admin data not available</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ minHeight: "100vh", padding: "24px" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f4f5f7",
          padding: 3,
          position: "relative",
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", top: 20, left: 20 }}
        >
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => navigate("/dashboard")}
              sx={{
                bgcolor: "white",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
        </motion.div>

        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{
            maxWidth: 480,
            width: "100%",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
            borderRadius: "16px",
            backgroundColor: "#fff",
            padding: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              marginBottom={3}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ position: "relative" }}
              >
                <Avatar
                  src={imagePreview}
                  alt="Admin Profile"
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid #1a2a6c",
                    boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="icon-button-file">
                  <Tooltip title="Change Photo">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "white",
                        boxShadow: 2,
                        "&:hover": {
                          backgroundColor: "grey.100",
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                </label>
              </motion.div>
              <Typography
                variant="h5"
                align="center"
                fontWeight="bold"
                gutterBottom
                sx={{
                  color: "#333",
                  marginTop: 2,
                  background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {admin.firstname} {admin.lastname}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="textSecondary"
                gutterBottom
              >
                {admin.email}
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="First Name"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: "#fff",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="Last Name"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: "#fff",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: "#f4f5f7",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                      InputProps={{ readOnly: true }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      label="New PIN (optional)"
                      name="pin"
                      type="password"
                      value={formData.pin}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      sx={{
                        backgroundColor: "#fff",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        },
                      }}
                      inputProps={{
                        maxLength: 6,
                        pattern: "[0-9]*",
                        inputMode: "numeric",
                      }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                        color: "white",
                        padding: "12px",
                        borderRadius: "12px",
                        "&:hover": {
                          background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                        },
                      }}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Alert
                severity="success"
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {successMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {errorMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

export default AdminProfile;
