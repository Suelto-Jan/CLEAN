import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BSULOGO from '../images/BSU LOGO.png';
import COTLOGO from '../images/COT.png';
import styles from './css/LoginSelection.module.css';
import { formatDistanceToNow } from 'date-fns';
import { Modal, Typography } from '@mui/material';

function LoginSelectionPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [email, setEmail] = useState('');
  const [resetError, setResetError] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('pinReset') === 'true') {
      setSnackbarMessage('PIN reset successful!');
    }
    fetchUsers();
  }, [location]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/users');
      if (!res.ok) throw new Error('Failed to fetch users.');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    if (user.isVerified) {
      setSelectedUser(user);
      setPin('');
      setError(null);
      setIsForgotPin(false);
      setEmail('');
    } else {
      setError('This user is not verified. Please verify your account first.');
    }
  };

  const handlePinSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, pin }),
      });

      if (!res.ok) throw new Error('Invalid PIN or login failed.');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/scan', {
        state: { userId: data.user._id, firstname: data.user.firstname },
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!email) {
      setResetError('Please enter a valid email address.');
      return;
    }

    if (email !== selectedUser.email) {
      setResetError('Email does not match the selected user.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/forgot-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: selectedUser.email }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      setSnackbarMessage('Reset link sent to your email!');
    } catch (error) {
      setResetError('There was an issue resetting the PIN.');
      setSnackbarMessage('Error resetting PIN.');
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
    setIsForgotPin(false);
    setEmail('');
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
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "20px",
      }}
    >
      <motion.header
        className={styles.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          marginBottom: "30px",
        }}
      >
        <motion.div className={styles.logoContainer} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/" className={styles.backIcon}>
            <motion.i
              className="fas fa-arrow-left"
              whileHover={{ scale: 1.2, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              style={{ color: "white", fontSize: "24px" }}
            ></motion.i>
          </Link>
          <motion.img
            src={BSULOGO}
            alt="Bukidnon State University"
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ height: "60px", objectFit: "contain" }}
          />
          <motion.img
            src={COTLOGO}
            alt="College of Technologies"
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ height: "60px", objectFit: "contain" }}
          />
        </motion.div>
        <Link to="/register">
          <motion.button
            className={styles.registerButton}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "12px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "2px solid white",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Register
          </motion.button>
        </Link>
      </motion.header>

      {loading && (
        <motion.p
          className={styles.loadingMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading users...
        </motion.p>
      )}

      {!loading && !error && (
        <motion.div
          variants={containerVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            padding: "20px",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          {users.map((user) => (
            <motion.div
              key={user._id}
              variants={itemVariants}
              whileHover={{ scale: 1.04 }}
              onClick={() => handleUserClick(user)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "20px",
                cursor: "pointer",
                border: "2px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                marginBottom: "16px",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              <motion.img
                src={user.image ? (user.image.startsWith('http') ? user.image : `http://localhost:8000/${user.image}`) : ''}
                alt={`${user.firstname}'s avatar`}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  marginBottom: "16px",
                }}
              />
              <div style={{ width: "100%" }}>
                <Typography
                  style={{
                    color: "white",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    marginBottom: "8px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.firstname} {user.lastname}
                </Typography>
                <Typography
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "0.9rem",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "100%"
                  }}
                >
                  {user.email}
                </Typography>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        open={!!selectedUser}
        onClose={closeModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" style={{ marginBottom: "20px", fontWeight: "600" }}>
            Enter PIN for {selectedUser?.firstname}
          </Typography>
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              // Only allow numeric input
              const numericValue = e.target.value.replace(/\D/g, '');
              // Limit to 6 digits
              if (numericValue.length <= 6) {
                setPin(numericValue);
              }
            }}
            placeholder="Enter your 6-digit PIN"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #e0e0e0",
              marginBottom: "15px",
              fontSize: "16px",
              textAlign: "center",
              letterSpacing: "4px",
            }}
          />
          {error && (
            <Typography color="error" style={{ marginBottom: "15px" }}>
              {error}
            </Typography>
          )}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePinSubmit}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#1a2a6c",
                color: "white",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>
        </motion.div>
      </Modal>

      <AnimatePresence>
        {snackbarMessage && (
          <motion.div
            className={`${styles.snackbar} ${snackbarMessage.includes('success') ? styles.success : styles.error}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <span>{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LoginSelectionPage;
