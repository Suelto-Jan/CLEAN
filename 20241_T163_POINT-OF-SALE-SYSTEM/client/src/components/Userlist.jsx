import React, { useEffect, useState } from "react";
import {Box,Button,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,CircularProgress,Typography,Avatar,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Tooltip,IconButton,List,ListItem,ListItemText,Snackbar,TextField,InputAdornment} from "@mui/material";
import { useTheme } from "@mui/system";
import { Person as PersonIcon, Search as SearchIcon } from "@mui/icons-material";

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        const filteredUsers = data.filter((user) => !user.isAdmin);
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
      const response = await fetch(
        `http://localhost:8000/api/${userId}/transactions`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }
      const data = await response.json();
      setTransactions({ paid: data.paid, payLater: data.payLater });
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box color="red" textAlign="center" mt={5}>
        Error: {error}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>
        User List
      </Typography>

      {/* Search Bar */}
      <TextField
  label="Search Users"
  variant="outlined"
  value={searchTerm}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }}
  sx={{
    mb: 3,
    maxWidth: 400,  // Adjust the maxWidth to make it smaller
    width: '100%',  // Ensures it takes up full width up to the maxWidth
  }}
/>


      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={user._id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenUserDetails(user)}
                    sx={{
                      textTransform: "none",
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
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
                      color="primary"
                      onClick={() => handleOpenUserDetails(user)}
                      startIcon={<PersonIcon />}
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

      {/* User Details Dialog */}
      <Dialog open={openUserDetails} onClose={handleCloseUserDetails} maxWidth="sm" fullWidth>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ padding: 2 }}>
              <Avatar
                alt="User Profile"
                src={selectedUser.image ? `http://localhost:8000/${selectedUser.image}` : "/default-avatar.png"}
                sx={{
                  width: 100,
                  height: 100,
                  margin: "auto",
                  mb: 2,
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                }}
              />
              <Typography variant="h6" align="center" fontWeight="bold">
                {selectedUser.firstname} {selectedUser.lastname}
              </Typography>
              <Typography variant="body1" align="center" color="textSecondary">
                {selectedUser.email}
              </Typography>
              <Divider sx={{ margin: "20px 0" }} />
              <Typography variant="h6">Paid Transactions</Typography>
              <List>
                {transactions.paid.length > 0 ? (
                  transactions.paid.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item.name} secondary={`₱${item.price}`} />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No Paid Transactions</Typography>
                )}
              </List>
              <Typography variant="h6" sx={{ marginTop: 2 }}>
                Pay Later Transactions
              </Typography>
              <List>
                {transactions.payLater.length > 0 ? (
                  transactions.payLater.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item.name} secondary={`₱${item.price}`} />
                    </ListItem>
                  ))
                ) : (
                  <Typography>No Pay Later Transactions</Typography>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Error Handling */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
}

export default UserList;
