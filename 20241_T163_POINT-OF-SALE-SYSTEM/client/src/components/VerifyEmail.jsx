import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import styles from './css/VerifyEmail.module.css';

const VerifyEmailPage = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  console.log("Verification token from URL:", token);

  useEffect(() => {
    if (token) {
      axios.get(`http://localhost:8000/api/verify-email?token=${token}`)
        .then(response => {
          console.log("Verification response:", response.data);
          setMessage(response.data.message);  // Set success message
        })
        .catch(error => {
          console.error("Error verifying email:", error);
          const errorMessage = error.response?.data?.message || 'Unknown error';
          if (errorMessage.includes('expired')) {
            setMessage('The verification link has expired. Please request a new one.');
          } else {
            setMessage('Error verifying email: ' + errorMessage);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage('Invalid verification token.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Email Verification</h1>
        {loading ? (
          <div className={styles.spinner}></div>
        ) : (
          <p className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;








