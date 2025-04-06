import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BSULOGO from '../images/BSU LOGO.png';
import COTLOGO from '../images/COT.png';
import styles from './css/LoginSelection.module.css';
import { formatDistanceToNow } from 'date-fns';

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
    >
      <motion.header 
        className={styles.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div className={styles.logoContainer}>
          <Link to="/" className={styles.backIcon}>
            <motion.i 
              className="fas fa-arrow-left"
              whileHover={{ scale: 1.2, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
            ></motion.i>
          </Link>
          <motion.img 
            src={BSULOGO} 
            alt="Bukidnon State University" 
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img 
            src={COTLOGO} 
            alt="College of Technologies" 
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <Link to="/register">
          <motion.button 
            className={styles.registerButton}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
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
          className={styles.userList}
          variants={containerVariants}
        >
          {users.length > 0 ? (
            users.map((user, index) => (
              <motion.div
                key={user._id}
                className={`${styles.userCard} ${!user.isVerified ? styles.unverified : ''}`}
                onClick={() => handleUserClick(user)}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.img
                  src={user.image ? `http://localhost:8000/${user.image}` : ''}
                  alt={`${user.firstname}'s avatar`}
                  className={styles.avatar}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className={styles.userInfo}>
                  <motion.p 
                    className={styles.userName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {user.firstname}
                  </motion.p>
                  <motion.p 
                    className={styles.userDetail}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    Last Name: {user.lastname || 'Not specified'}
                  </motion.p>
                  <motion.p 
                    className={styles.userDetail}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    Last Login: {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'No record'}
                  </motion.p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p 
              className={styles.noUsersMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No verified users available
            </motion.p>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedUser && !isForgotPin && (
          <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={styles.modalBox}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.h3 
                className={styles.modalTitle}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Enter PIN for {selectedUser.firstname}
              </motion.h3>
              <motion.p 
                className={styles.modalSubtitle}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Please enter your PIN to proceed with your login.
              </motion.p>
              <motion.input
                type="password"
                className={styles.modalInput}
                placeholder="Enter PIN"
                value={pin}
                inputMode="numeric"
                onChange={(e) => {
                  let newPin = e.target.value.replace(/\D/g, '');
                  if (newPin.length <= 6) {
                    setPin(newPin);
                  }
                }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              />
              {error && (
                <motion.p 
                  className={styles.modalError}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.p>
              )}
              <motion.div 
                className={styles.modalButtons}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button 
                  className={styles.modalButton}
                  onClick={handlePinSubmit}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit
                </motion.button>
                <motion.button 
                  className={styles.modalButtonCancel}
                  onClick={closeModal}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
              <motion.button
                className={styles.forgotPinButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsForgotPin(true);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot PIN?
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUser && isForgotPin && (
          <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={styles.modalBox}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.h3 
                className={styles.modalTitle}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Reset PIN for {selectedUser.firstname}
              </motion.h3>
              <motion.p 
                className={styles.modalSubtitle}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Please enter your email address to receive a PIN reset link.
              </motion.p>
              <motion.input
                type="email"
                className={styles.modalInput}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              />
              {resetError && (
                <motion.p 
                  className={styles.modalError}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {resetError}
                </motion.p>
              )}
              <motion.div 
                className={styles.modalButtons}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button 
                  className={styles.modalButton}
                  onClick={handleForgotPin}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Reset Link
                </motion.button>
                <motion.button 
                  className={styles.modalButtonCancel}
                  onClick={() => setIsForgotPin(false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
