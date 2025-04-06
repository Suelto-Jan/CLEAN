import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message state

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
  
    // Check if the entered email matches the selected user's email
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
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.backIcon}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <img src={BSULOGO} alt="Bukidnon State University" className={styles.logo} />
          <img src={COTLOGO} alt="College of Technologies" className={styles.logo} />
        </div>
        <Link to="/register">
          <button className={styles.registerButton}>Register</button>
        </Link>
      </div>

      {loading && <p className={styles.loadingMessage}>Loading users...</p>}
      


      {!loading && !error && (
        <>
          {users.length > 0 ? (
            <div className={styles.userList}>
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`${styles.userCard} ${!user.isVerified ? styles.unverified : ''}`}
                  onClick={() => handleUserClick(user)}
                >
                  <img
                    src={user.image ? `http://localhost:8000/${user.image}` : ''}
                    alt={`${user.firstname}'s avatar`}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{user.firstname}</p>
                    <p className={styles.userDetail}>Last Name: {user.lastname || 'Not specified'}</p>
                    <p className={styles.userDetail}>
                      Last Login: {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'No record'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noUsersMessage}>No verified users available</p>
          )}
        </>
      )}

      {selectedUser && !isForgotPin && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Enter PIN for {selectedUser.firstname}</h3>
            <p className={styles.modalSubtitle}>Please enter your PIN to proceed with your login.</p>
            <input
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
            />
            {error && <p className={styles.modalError}>{error}</p>}
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handlePinSubmit}>
                Submit
              </button>
              <button className={styles.modalButtonCancel} onClick={closeModal}>
                Cancel
              </button>
            </div>

            <button
              className={styles.forgotPinButton}
              onClick={() => setIsForgotPin(true)}
            >
              Forgot PIN?
            </button>
          </div>
        </div>
      )}

      {isForgotPin && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Reset Your PIN</h3>
            <p className={styles.modalSubtitle}>Please enter your email address to reset your PIN.</p>
            <input
              type="email"
              className={styles.modalInput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {resetError && <p className={styles.modalError}>{resetError}</p>}
            <div className={styles.modalButtons}>
              <button className={styles.modalButton} onClick={handleForgotPin}>
                Reset PIN
              </button>
              <button className={styles.modalButtonCancel} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbarMessage && (
        <div className={styles.snackbar}>
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

export default LoginSelectionPage;
