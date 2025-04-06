import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/ScanPage.module.css';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { Modal, Box, Button, Typography } from '@mui/material';

function ScanPage() {
  const [user, setUser] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [paidItems, setPaidItems] = useState([]);
  const [payLaterItems, setPayLaterItems] = useState([]);
  const [selectedPayLaterItem, setSelectedPayLaterItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const [loading, setLoading] = useState(true);

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
     else if (/^[0-9]$/.test(event.key)) {
    setBarcode((prevBarcode) => prevBarcode + event.key);
  }  else if (!['Shift', 'Control', 'Alt', 'CapsLock'].includes(event.key)) {
      setBarcode((prevBarcode) => prevBarcode + event.key);
    }
  };

  const handleScanClick = () => {
    setShowScanner(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setShowScanner(false);
  };

  const fetchProductDetails = () => {
    if (barcode.trim()) {
      fetch(`http://localhost:8000/api/products/barcode/${barcode.trim()}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Product not found!');
          }
          return response.json();
        })
        .then((product) => {
          navigate('/payment', { state: { product } });
          setBarcode('');
          setShowScanner(false);
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
          setError('Failed to fetch product details. Please try again.');
          setBarcode('');
          setShowScanner(false);
        });
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
    } catch (error) {
      console.error('Error confirming payment:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.scanPage}>
      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>

      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.userSection}>
            {user?.image ? (
              <img
                src={`http://localhost:8000/${user.image}`}
                alt="User"
                className={styles.userImage}
              />
            ) : (
              <FaUserCircle className={styles.userIcon} />
            )}
            <div className={styles.userInfo}>
              <h2>
                {user?.firstname} {user?.lastname}
              </h2>
              <button className={styles.editButton} onClick={handleEditProfile}>
                <FaEdit className={styles.editIcon} /> Edit Profile
              </button>
            </div>
          </div>

          <div className={styles.itemsSection}>
            {/* Paid Section */}
            <div className={styles.paidSection}>
              <h4>Paid Items</h4>
              <div className={styles.itemsList}>
                {paidItems.length > 0 ? (
                  paidItems.map((item) => (
                    <div key={item._id} className={styles.item}>
                      <span>{item.name}</span>
                      <span>₱{item.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p>No paid items</p>
                )}
              </div>
            </div>

            {/* Pay Later Section */}
            <div className={styles.payLaterSection}>
              <h4>Pay Later Items</h4>
              <div className={styles.itemsList}>
                {payLaterItems.length > 0 ? (
                  payLaterItems.map((item) => (
                    <div key={item._id} className={styles.item} onClick={() => handlePayLaterClick(item)}>
                      <span>{item.name}</span>
                      <span>₱{item.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p>No pay later items</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.scannerSection}>
            <h3>Scan Item</h3>
            <div className={styles.scanner}>
              <div className={styles.scanBox}>
                {showScanner && (
                  <input
                    ref={inputRef}
                    className={styles.scanArea}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder="Scanning... Please scan your barcode"
                  />
                )}
              </div>
              <button className={styles.scanButton} onClick={handleScanClick}>
                Scan
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>

      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        aria-labelledby="confirm-payment-title"
        aria-describedby="confirm-payment-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '12px',
            p: 4,
          }}
        >
          <Typography
            id="confirm-payment-title"
            variant="h6"
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            Confirm Payment
          </Typography>
          <Typography
            id="confirm-payment-description"
            variant="body1"
            sx={{
              textAlign: 'center',
              mb: 4,
            }}
          >
            Are you sure you want to confirm payment for{' '}
            <strong>{selectedPayLaterItem?.name}</strong> worth{' '}
            <strong>₱{selectedPayLaterItem?.price?.toFixed(2)}</strong>?
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmPayment}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => setShowPaymentModal(false)}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default ScanPage;
