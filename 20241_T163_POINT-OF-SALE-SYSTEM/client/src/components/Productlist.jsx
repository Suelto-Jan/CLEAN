import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Modal,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Snackbar,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    quantity: "",
    barcode: "",
    category: "",
    image: "",
  });
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === "all"
          ? `${API_BASE_URL}/products`
          : `${API_BASE_URL}/products?category=${selectedCategory}`;
      
      const response = await axios.get(url);

      const filteredProducts = response.data.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setSnackbarMessage("Error fetching products. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setFormValues(
      product
        ? { ...product }
        : { name: "", price: "", quantity: "", barcode: "", category: "", image: "" }
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormValues({ name: "", price: "", quantity: "", barcode: "", category: "", image: "" });
    document.querySelector('input[type="file"]').value = '';
  };

  const handleSubmit = async () => {
    if (!formValues.name || !formValues.price || !formValues.quantity || !formValues.barcode || !formValues.category) {
      setSnackbarMessage("Please fill all the required fields.");
      setSnackbarOpen(true);
      return;
    }
  
    if (!image && !selectedProduct) {
      setSnackbarMessage("Please upload an image.");
      setSnackbarOpen(true);
      return;
    }
  
    const formData = new FormData();
  
    Object.keys(formValues).forEach((key) => {
      formData.append(key, formValues[key]);
    });
  
    if (image && image instanceof File) {
      formData.append("image", image);
    }
  
    try {
      let productResponse;
  
      if (selectedProduct) {
        productResponse = await axios.put(
          `${API_BASE_URL}/products/${selectedProduct._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        productResponse = await axios.post(
          `${API_BASE_URL}/registerProduct`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
  
      setSnackbarMessage("Product saved successfully.");
      setSnackbarOpen(true);
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error.response?.data || error.message);
      setSnackbarMessage(`Error: ${error.response?.data?.message || error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ padding: "30px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "600",
          color: "#333",
          marginBottom: "24px",
          background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Product Management
      </Typography>

      {/* Search and Filter Section */}
      <motion.div variants={itemVariants}>
        <Box
          sx={{
            marginBottom: "20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "16px",
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          <TextField
            label="Search Products"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            sx={{
              maxWidth: isMobile ? "100%" : "400px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant={selectedCategory === "all" ? "contained" : "outlined"}
              onClick={() => handleCategoryChange({ target: { value: "all" } })}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              View All Products
            </Button>
            <Button
              variant={selectedCategory === "drinks" ? "contained" : "outlined"}
              onClick={() => handleCategoryChange({ target: { value: "drinks" } })}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              View Drinks
            </Button>
            <Button
              variant={selectedCategory === "junkfood" ? "contained" : "outlined"}
              onClick={() => handleCategoryChange({ target: { value: "junkfood" } })}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              View Junk Foods
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Add New Product Button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            marginBottom: "24px",
            borderRadius: "12px",
            background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
            textTransform: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Add New Product
        </Button>
      </motion.div>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12} sx={{ textAlign: "center", padding: "40px" }}>
            <CircularProgress />
          </Grid>
        ) : (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: "100%",
                        height: "180px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        borderRadius: "12px",
                        mb: 2,
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <img
                        src={product.image ? `http://localhost:8000/${product.image}` : '/default-avatar.png'}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleOpenModal(product)}
                            sx={{
                              color: "#1a2a6c",
                              "&:hover": {
                                backgroundColor: "rgba(26, 42, 108, 0.1)",
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginBottom: "8px" }}
                    >
                      Category: {product.category}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginBottom: "8px" }}
                    >
                      Price: ₱{product.price}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginBottom: "8px" }}
                    >
                      Quantity: {product.quantity}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginBottom: "8px" }}
                    >
                      Barcode: {product.barcode}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Product Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="product-modal-title"
        aria-describedby="product-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "90%" : 400,
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            p: 4,
          }}
        >
          <Typography
            id="product-modal-title"
            variant="h6"
            component="h2"
            sx={{
              marginBottom: "24px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </Typography>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={formValues.price}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Barcode"
                  name="barcode"
                  value={formValues.barcode}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formValues.category}
                    onChange={handleInputChange}
                    label="Category"
                    sx={{
                      borderRadius: "12px",
                    }}
                  >
                    <MenuItem value="drinks">Drinks</MenuItem>
                    <MenuItem value="junkfood">Junk Food</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    borderColor: "#1a2a6c",
                    color: "#1a2a6c",
                    "&:hover": {
                      backgroundColor: "#1a2a6c",
                      color: "white",
                    },
                  }}
                >
                  Upload Product Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    onClick={handleCloseModal}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                      },
                    }}
                  >
                    {selectedProduct ? "Update" : "Add"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
}

export default ProductList;
