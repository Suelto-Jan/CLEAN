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
} from "@mui/material";

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

  // Fetch admin data when component mounts
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");  // Use "token" instead of "authToken"
        console.log("Token from localStorage:", token);  // Log token
  
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
  
        console.log("API Response:", response);  // Log the whole response
  
        if (response && response.data) {
          setAdmin(response.data);  // Set the admin data if available
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
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("firstname", formData.firstname);
    form.append("lastname", formData.lastname);
    form.append("email", formData.email);
    form.append("pin", formData.pin);
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
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (!admin) {
    return <Typography>Admin data not available</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
          borderRadius: "16px",
          backgroundColor: "#fff",
          padding: 3,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="center" marginBottom={3}>
            <Avatar
              src={imagePreview}
              alt="Admin Profile"
              sx={{
                width: 120,
                height: 120,
                border: "4px solid #4b6cb7",
                boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
          <Typography
            variant="h5"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#333", marginBottom: 2 }}
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

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  fullWidth
                  size="small"
                  sx={{ backgroundColor: "#f4f5f7" }}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
  <TextField
    label="PIN"
    name="pin"
    type="password"
    value={formData.pin}
    onChange={(e) => {
      if (e.target.value.length <= 6) {
        setFormData((prev) => ({ ...prev, pin: e.target.value }));
      }
    }}
    onKeyPress={(e) => {
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault(); // Prevent non-numeric keys
      }
    }}
    fullWidth
    size="small"
    inputProps={{
      maxLength: 6, // Sets the maximum input length
      inputMode: "numeric", // Ensures the numeric keyboard appears on mobile devices
      pattern: "[0-9]*", // Regex pattern to enforce numeric input in certain browsers
    }}
    sx={{ backgroundColor: "#fff" }}
  />
</Grid>


            </Grid>

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                marginTop: 2,
                marginBottom: 2,
                textTransform: "none",
                borderColor: "#4b6cb7",
                color: "#4b6cb7",
                "&:hover": { backgroundColor: "#4b6cb7", color: "white" },
              }}
            >
              Upload New Profile Picture
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            {imagePreview && (
              <Box textAlign="center" marginBottom={2}>
                <Avatar
                  alt="Image Preview"
                  src={imagePreview}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    margin: "auto",
                  }}
                />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#4b6cb7",
                color: "#fff",
                textTransform: "none",
                "&:hover": { backgroundColor: "#355b87" },
              }}
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {successMessage && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSuccessMessage("")}>
          <Alert severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      {errorMessage && (
        <Snackbar open autoHideDuration={3000} onClose={() => setErrorMessage("")}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default AdminProfile;
