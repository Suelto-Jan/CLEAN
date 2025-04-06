import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox } from 'react-icons/fa';
import { Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  FaUserCircle,
  FaEdit,
  FaBarcode,
  FaSignOutAlt,
  FaCheckCircle,
  FaClock,
} from 'react-icons/fa';
import axios from 'axios';

function ScanPage() {
  const [user, setUser] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [paidItems, setPaidItems] = useState([]);
  const [payLaterItems, setPayLaterItems] = useState([]);
  const [selectedPayLaterItem, setSelectedPayLaterItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch user data and transactions
  const fetchUserData = async () => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      console.error('No user data found in localStorage');
      navigate('/login-selection');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch transactions from the API after user data is set
      await fetchTransactions(parsedUser._id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login-selection');
    }
  };

  const fetchTransactions = async (userId) => {
    setLoading(true); // Set loading state to true while fetching data

    try {
      const response = await fetch(`http://localhost:8000/api/${userId}/transactions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      console.log('Fetched Transactions:', data); // Debug log for transactions

      if (data?.paid && data?.payLater) {
        // Filter the products based on paymentStatus
        const paidItems = data.paid.filter(item => item.paymentStatus === 'Paid');
        const payLaterItems = data.payLater.filter(item => item.paymentStatus === 'Pay Later');

        setPaidItems(paidItems);
        setPayLaterItems(payLaterItems);
      } else {
        console.error('Invalid response structure:', data);
        setPaidItems([]);
        setPayLaterItems([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setPaidItems([]);
      setPayLaterItems([]);
    } finally {
      setLoading(false); // Set loading to false after the data fetch is done
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-selection');
      return;
    }

    if (user) {
      // Fetch transactions only if the user exists
      fetchTransactions(user._id);
      fetchAvailableProducts();
    } else {
      // Fetch user data to populate the user state
      fetchUserData();
    }
  }, [navigate, user]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchProductDetails();
    }
  };
  
  

  const handleScanClick = () => {
    setShowScanner(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setShowScanner(false);
  };

  const fetchProductDetails = async () => {
    const trimmedBarcode = barcode.trim();
  
    if (!trimmedBarcode) {
      setError('Please scan or enter a valid barcode.');
      return;
    }
  
    console.log('Attempting to fetch product with barcode:', trimmedBarcode);
  
    try {
      const response = await fetch(`http://localhost:8000/api/products/barcode/${encodeURIComponent(trimmedBarcode)}`);
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Product not found!');
      }
  
      const product = await response.json();
      console.log('Successfully fetched product:', product);
  
      navigate('/payment', { state: { product } });
      setError('');
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to fetch product details. Please try again.');
    } finally {
      setBarcode('');
      setShowScanner(false);
    }
  };
  
  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/edit-profile/${user._id}`);
    }
  };

  const handleLogout = () => {
    const purchasedData = localStorage.getItem('purchasedData');
    localStorage.clear();
    if (purchasedData) {
      localStorage.setItem('purchasedData', purchasedData);
    }
    navigate('/login-selection');
  };

  const handlePayLaterClick = (item) => {
    console.log('Selected Pay Later Item:', item);
    setSelectedPayLaterItem(item);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayLaterItem) {
      console.error('No item selected for payment.');
      return;
    }

    const payload = {
      userId: user?._id,
      itemId: selectedPayLaterItem?._id,
    };

    console.log('Payload being sent:', payload);

    try {
      const response = await fetch(`http://localhost:8000/api/transactions/pay-later/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment.');
      }

      const data = await response.json();
      console.log('Payment Confirmed:', data);

      // Update the lists
      setPayLaterItems((prev) => prev.filter((i) => i._id !== selectedPayLaterItem._id));
      setPaidItems((prev) => [...prev, selectedPayLaterItem]);

      setShowPaymentModal(false);
      setSelectedPayLaterItem(null);
      setSnackbarMessage('Payment confirmed successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error confirming payment:', error.message);
      alert(`Error: ${error.message}`);
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          maxWidth: "1400px",
          margin: "0 auto",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1,
          }}
        >
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "#f44336",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                },
              }}
            >
              <FaSignOutAlt />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            minHeight: "100vh",
          }}
        >
          {/* Left Section */}
          <motion.div
            variants={itemVariants}
            style={{
              flex: 1,
              padding: "30px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            }}
          >
            {/* User Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {user?.image ? (
                <Box
                  component="img"
                  src={`http://localhost:8000/${user.image}`}
                  alt="User"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #1a2a6c",
                    marginRight: "20px",
                  }}
                />
              ) : (
                <FaUserCircle
                  style={{
                    fontSize: "80px",
                    color: "#1a2a6c",
                    marginRight: "20px",
                  }}
                />
              )}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  {user?.firstname} {user?.lastname}
                </Typography>
                <Button
                  startIcon={<FaEdit />}
                  onClick={handleEditProfile}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    color: "#1a2a6c",
                    borderColor: "#1a2a6c",
                    "&:hover": {
                      backgroundColor: "#1a2a6c",
                      color: "white",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>

            {/* Items Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "20px",
              }}
            >
              {/* Paid Items */}
              <motion.div
                variants={itemVariants}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FaCheckCircle
                    style={{
                      fontSize: "24px",
                      color: "#4caf50",
                      marginRight: "10px",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Paid Items
                  </Typography>
                </Box>
                <Box
                  sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : paidItems.length > 0 ? (
                    paidItems.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={itemVariants}
                        style={{
                          padding: "15px",
                          marginBottom: "10px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "12px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "500",
                            color: "#333",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#4caf50",
                            fontWeight: "600",
                          }}
                        >
                          ₱{item.price.toFixed(2)}
                        </Typography>
                      </motion.div>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#888",
                        padding: "20px",
                      }}
                    >
                      No paid items
                    </Typography>
                  )}
                </Box>
              </motion.div>

              {/* Pay Later Items */}
              <motion.div
                variants={itemVariants}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FaClock
                    style={{
                      fontSize: "24px",
                      color: "#ff9800",
                      marginRight: "10px",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Pay Later Items
                  </Typography>
                </Box>
                <Box
                  sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : payLaterItems.length > 0 ? (
                    payLaterItems.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={itemVariants}
                        onClick={() => handlePayLaterClick(item)}
                        style={{
                          padding: "15px",
                          marginBottom: "10px",
                          backgroundColor: "#fff3e0",
                          borderRadius: "12px",
                          border: "1px solid #ffe0b2",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "500",
                            color: "#333",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#ff9800",
                            fontWeight: "600",
                          }}
                        >
                          ₱{item.price.toFixed(2)}
                        </Typography>
                      </motion.div>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#888",
                        padding: "20px",
                      }}
                    >
                      No pay later items
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </Box>
            {/* Available Products Section with Images */}
<motion.div
  variants={itemVariants}
  style={{
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
    <FaBox style={{ fontSize: "24px", color: "#1a2a6c", marginRight: "10px" }} />
    <Typography variant="h6" sx={{ fontWeight: "600", color: "#333" }}>
      Available Products
    </Typography>
  </Box>

  <Box
    sx={{
      maxHeight: "400px",
      overflowY: "auto",
      "&::-webkit-scrollbar": { width: "8px" },
      "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
      "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
    }}
  >
    {productsLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <CircularProgress />
      </Box>
    ) : availableProducts.length > 0 ? (
      <Grid container spacing={2}>
        {availableProducts.map((product) => (
          <Grid item xs={12} sm={6} key={product._id}>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", gap: "15px", alignItems: "center" }}>
                {product.image ? (
                  <Box
                    component="img"
                    src={`http://localhost:8000/${product.image}`}
                    alt={product.name}
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <FaBox style={{ fontSize: "40px", color: "#ccc" }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: "600", color: "#333" }}>
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: product.quantity > 0 ? "#27ae60" : "#e74c3c",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    Stock: {product.quantity}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                    Barcode: {product.barcode}
                  </Typography>
                </Box>
                <Typography
                  sx={{ color: "#1a2a6c", fontWeight: "600", fontSize: "1.1rem" }}
                >
                  ₱{product.price?.toFixed(2)}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography sx={{ textAlign: "center", color: "#888", padding: "20px" }}>
        No products available
      </Typography>
    )}
  </Box>
</motion.div>

          </motion.div>
   
          {/* Right Section */}
          <motion.div
            variants={itemVariants}
            style={{
              flex: 1,
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "white",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                width: "100%",
                maxWidth: "500px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "600",
                  marginBottom: "30px",
                  background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Scan Product
              </Typography>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  startIcon={<FaBarcode />}
                  onClick={handleScanClick}
                  sx={{
                    padding: "15px 30px",
                    fontSize: "18px",
                    borderRadius: "12px",
                    textTransform: "none",
                    background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                    },
                  }}
                >
                  Start Scanning
                </Button>
              </motion.div>

              {showScanner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: "20px" }}
                >
                  <input
  ref={inputRef}
  type="text"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)} // ONLY use this to manage input state
  onKeyDown={handleKeyDown}
  onBlur={handleBlur}
  placeholder="Scan barcode or enter manually"
  style={{
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    border: "2px solid #1a2a6c",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
  }}
/>

                </motion.div>
              )}

              {error && (
                <Typography
                  sx={{
                    color: "#f44336",
                    marginTop: "10px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Payment Confirmation Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
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
            id="payment-modal-title"
            variant="h6"
            component="h2"
            sx={{
              marginBottom: "24px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Confirm Payment
          </Typography>
          {selectedPayLaterItem && (
            <Box>
              <Typography variant="body1" sx={{ marginBottom: "16px" }}>
                Are you sure you want to pay for:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "600",
                  color: "#1a2a6c",
                  marginBottom: "8px",
                }}
              >
                {selectedPayLaterItem.name}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "600",
                  color: "#b21f1f",
                  marginBottom: "24px",
                }}
              >
                ₱{selectedPayLaterItem.price.toFixed(2)}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setShowPaymentModal(false)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmPayment}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                "&:hover": {
                  background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                },
              }}
            >
              Confirm Payment
            </Button>
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

export default ScanPage;
