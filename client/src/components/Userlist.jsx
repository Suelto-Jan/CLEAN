import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Person as PersonIcon, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({ paid: [], payLater: [] });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users");
        const filteredUsers = response.data.filter((user) => !user.isAdmin);
        setUsers(filteredUsers);
      } catch (error) {
        setError(error.message);
        setSnackbarMessage("Error fetching users.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchTransactionHistory = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/${userId}/transactions`);
      setTransactions({ paid: response.data.paid, payLater: response.data.payLater });
    } catch (error) {
      console.error("Error fetching transaction history:", error.message);
      setTransactions({ paid: [], payLater: [] });
    }
  };

  const handleOpenUserDetails = async (user) => {
    setSelectedUser(user);
    setOpenUserDetails(true);
    await fetchTransactionHistory(user._id);
  };

  const handleCloseUserDetails = () => {
    setOpenUserDetails(false);
    setTransactions({ paid: [], payLater: [] });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

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
        User Management
      </Typography>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          size="small"
          sx={{
            maxWidth: isMobile ? "100%" : "400px",
            marginBottom: "24px",
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
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "white",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: "600" }}>#</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Email</TableCell>
                <TableCell align="center" sx={{ fontWeight: "600" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow
                  key={user._id}
                  hover
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f8f9fa",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleOpenUserDetails(user)}
                      sx={{
                        textTransform: "none",
                        color: "#1a2a6c",
                        fontWeight: "600",
                        "&:hover": {
                          color: "#b21f1f",
                        },
                      }}
                    >
                      {user.firstname} {user.lastname}
                    </Button>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Profile">
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenUserDetails(user)}
                        startIcon={<PersonIcon />}
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
                        Profile
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* User Details Dialog */}
      <Dialog
        open={openUserDetails}
        onClose={handleCloseUserDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          pb: 2,
          borderBottom: "1px solid #eee"
        }}>
          <Typography variant="h6" sx={{ fontWeight: "600" }}>
            User Profile
          </Typography>
          <IconButton
            onClick={handleCloseUserDetails}
            sx={{
              color: "grey.500",
              "&:hover": {
                color: "error.main",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  alt="User Profile"
                  src={selectedUser.image ? `http://localhost:8000/${selectedUser.image}` : "/default-avatar.png"}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: "auto",
                    mb: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    border: "4px solid #1a2a6c",
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>
                  {selectedUser.firstname} {selectedUser.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: "600", mb: 2, color: "#1a2a6c" }}>
                Paid Transactions
              </Typography>
              <List>
                {transactions.paid.length > 0 ? (
                  transactions.paid.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f8f9fa",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.name}
                        secondary={`₱${item.price}`}
                        primaryTypographyProps={{ fontWeight: "500" }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">No Paid Transactions</Typography>
                )}
              </List>

              <Typography variant="h6" sx={{ fontWeight: "600", mb: 2, mt: 3, color: "#1a2a6c" }}>
                Pay Later Transactions
              </Typography>
              <List>
                {transactions.payLater.length > 0 ? (
                  transactions.payLater.map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "#f8f9fa",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.name}
                        secondary={`₱${item.price}`}
                        primaryTypographyProps={{ fontWeight: "500" }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary">No Pay Later Transactions</Typography>
                )}
              </List>
            </motion.div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseUserDetails}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
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

export default UserList;
