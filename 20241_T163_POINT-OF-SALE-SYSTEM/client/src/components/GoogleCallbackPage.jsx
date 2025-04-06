import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory
import axios from 'axios';
import styles from './css/GoogleAuth.module.css';

const GoogleLoginCallback = () => {
  const navigate = useNavigate();  // initialize useNavigate

  useEffect(() => {
    // Make a request to your backend to handle the Google login callback
    axios.get('http://localhost:8000/auth/google/callback', { withCredentials: true })
      .then(response => {
        // Check for successful response data
        if (response.status === 200 && response.data && response.data.error === false) {
          // Redirect to the login-selection page after successful login
          navigate('/login-selection');  // use navigate instead of history.push
        } else {
          console.error("Login failed:", response.data.message || "Unknown error");
        }
      })
      .catch(error => {
        console.error("Login failed", error);
      });
  }, [navigate]);  // add navigate as a dependency

  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
      <p className={styles.message}>Redirecting to your dashboard...</p>
    </div>
  );
};

export default GoogleLoginCallback;




