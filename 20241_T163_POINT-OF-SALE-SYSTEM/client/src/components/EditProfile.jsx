import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './css/EditProfile.module.css';

function EditProfile() {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    image: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = response.data;
        setUser(fetchedUser);
        setPreviewImage(fetchedUser.image ? `http://localhost:8000/${fetchedUser.image}` : '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please log in again.');
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setUser((prevUser) => ({ ...prevUser, image: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in and try again.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (user.firstname.trim()) formData.append('firstname', user.firstname);
    if (user.lastname.trim()) formData.append('lastname', user.lastname);
    if (pin.trim()) formData.append('pin', pin);
    if (user.image instanceof File) formData.append('image', user.image);

    try {
      const response = await axios.put('http://localhost:8000/api/user/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      setPreviewImage(updatedUser.image ? `http://localhost:8000/${updatedUser.image}` : '');
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => navigate('/scan'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.editProfile}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            &larr; Back
          </button>
          <h2>Edit Profile</h2>
        </div>

        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!loading && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.profileImageSection}>
              <label htmlFor="profileImage" className={styles.label}>
                Profile Image
              </label>
              <div className={styles.imagePreview}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile" />
                ) : (
                  <div className={styles.placeholder}>No Image</div>
                )}
              </div>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="firstname" className={styles.label}>
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={user.firstname}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastname" className={styles.label}>
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={user.lastname}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                readOnly
              />
            </div>

            <div className={styles.inputGroup}>
  <label htmlFor="pin" className={styles.label}>
    New PIN
  </label>
  <input
    type="password"
    id="pin"
    name="pin"
    value={pin}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value) && value.length <= 6) { 
        // Allow only numbers and limit to 6 digits
        setPin(value);
      }
    }}
    onBlur={(e) => {
      if (e.target.value.length < 6) {
        alert("PIN must be at least 6 digits long."); // Validation for minimum length
      }
    }}
    maxLength={6} // Ensures maximum length is 6
    inputMode="numeric" // Displays numeric keyboard on mobile devices
  />
</div>

            <button type="submit" className={styles.submitButton}>
              Save Changes
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditProfile;

