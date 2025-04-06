import React, { useState, useEffect } from "react";
import {Box,Button,Card,CardContent,Grid,TextField,Typography,Modal,Select,MenuItem,InputLabel,FormControl,InputAdornment,Snackbar,} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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

  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
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
      console.log("Selected file:", file);  // This should print the file object
    } else {
    }
  };
  

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setFormValues(
      product
        ? { ...product }
        : { name: "", price: "", quantity: "", barcode: "", category: "" , image: ""}
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
    // Validate required fields
    if (!formValues.name || !formValues.price || !formValues.quantity || !formValues.barcode || !formValues.category) {
      setSnackbarMessage("Please fill all the required fields.");
      setSnackbarOpen(true);
      return;
    }
  
    // Check if an image is required (only for new products or if the image is updated)
    if (!image && !selectedProduct) {
      setSnackbarMessage("Please upload an image.");
      setSnackbarOpen(true);
      return;
    }
  
    const formData = new FormData();
  
    // Append form values (product details)
    Object.keys(formValues).forEach((key) => {
      formData.append(key, formValues[key]);
    });
  
    // Ensure image is appended only if it is updated
    if (image && image instanceof File) {
      formData.append("image", image);
    }
  
    // Make the POST request
    try {
      let productResponse;
  
      // Check if the form is editing an existing product
      if (selectedProduct) {
        // When editing, you can avoid checking the image unless it was updated
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
  
      // Successfully added or updated the product
      setSnackbarMessage("Product saved successfully.");
      setSnackbarOpen(true);
      handleCloseModal(); // Close the modal after successful submission
      fetchProducts(); // Refresh the product list
    } catch (error) {
      console.error("Error saving product or creating ad:", error.response?.data || error.message);
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

  return (
    <Box sx={{ padding: "30px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "600", color: "#333" }}>
        Product Management
      </Typography>

      {/* Search Bar */}
      <Box sx={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TextField
          label="Search Products"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          size="small"
          sx={{ maxWidth: "400px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Category Buttons */}
        <Box sx={{ marginLeft: "20px" }}>
          <Button
            variant={selectedCategory === "all" ? "contained" : "outlined"}
            onClick={() => handleCategoryChange({ target: { value: "all" } })}
            sx={{ marginRight: "10px" }}
          >
            View All Products
          </Button>
          <Button
            variant={selectedCategory === "drinks" ? "contained" : "outlined"}
            onClick={() => handleCategoryChange({ target: { value: "drinks" } })}
            sx={{ marginRight: "10px" }}
          >
            View Drinks
          </Button>
          <Button
            variant={selectedCategory === "junkfood" ? "contained" : "outlined"}
            onClick={() => handleCategoryChange({ target: { value: "junkfood" } })}
          >
            View Junk Foods
          </Button>
        </Box>
      </Box>

      {/* Add New Product Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        sx={{ fontSize: "14px", padding: "8px 16px", backgroundColor: "#007bff" }}
      >
        Add New Product
      </Button>

      {/* Product List */}
      <Grid container spacing={2} sx={{ marginTop: "20px" }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
           <Card elevation={0}>
  <CardContent sx={{ padding: "20px" }}>
    <Box
      sx={{
        width: "100%",
        height: "180px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "8px",
      }}
    >
      <img
        src={product.image ? `http://localhost:8000/${product.image}` : '/path/to/default-image.jpg'}
        alt={product.name}
        style={{
          width: "100%",
          height: "100%",  // Make sure the image fills the container fully without cut-off
          objectFit: "contain",  // This ensures the image will scale to fit without being cropped
        }}
      />
    </Box>
    <Typography variant="h6" sx={{ marginTop: "10px", fontWeight: "bold", fontSize: "16px" }}>
      {product.name}
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ fontSize: "14px" }}>
      Price: ₱{product.price}
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ fontSize: "14px" }}>
      Available Quantity: {product.quantity}
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      sx={{ marginTop: "15px" }}
      onClick={() => handleOpenModal(product)}
    >
      Edit
    </Button>
  </CardContent>
</Card>

          </Grid>
        ))}
      </Grid>

      {/* Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            width: "400px",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "8px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "600" }}>
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </Typography>

          <TextField
            label="Product Name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formValues.price}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formValues.quantity}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Barcode"
            name="barcode"
            value={formValues.barcode}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />

          {/* Category Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formValues.category}
              onChange={handleInputChange}
              name="category"
              label="Category"
            >
              <MenuItem value="drinks">Drinks</MenuItem>
              <MenuItem value="junkfood">Junk Food</MenuItem>
              <MenuItem value="others">Others</MenuItem>
            </Select>
          </FormControl>

          {/* Image Upload */}
          <input
  type="file"
  onChange={handleImageChange}
  accept="image/*"
  style={{ marginBottom: "10px" }}
/>

          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <Button variant="outlined" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Save Product
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default ProductList;
