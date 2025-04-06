import React, { useState, useRef } from "react";
import axios from "axios";
import styles from './css/RegisterPage.module.css';
import { Link, useNavigate } from "react-router-dom";
import Google from "../images/google.png"; 
import ReCAPTCHA from "react-google-recaptcha";

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: ["", "", "", "", "", ""],
    confirmPin: ["", "", "", "", "", ""],
    image: null,
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const pinRefs = useRef([]);
  pinRefs.current = Array(6).fill().map((_, i) => pinRefs.current[i] || React.createRef());
  const confirmPinRefs = useRef([]);
  confirmPinRefs.current = Array(6).fill().map((_, i) => confirmPinRefs.current[i] || React.createRef());

  const handleChange = (e, field) => {
    const { value, name } = e.target;
    const newPin = [...formData[field]];
    const digit = value.replace(/\D/g, ''); 
    newPin[name] = digit;
    setFormData({ ...formData, [field]: newPin });

    if (digit.length === 1 && name < 5) {
      if (field === "pin") {
        pinRefs.current[parseInt(name) + 1].current.focus();
      } else {
        confirmPinRefs.current[parseInt(name) + 1].current.focus();
      }
    }
  };

  const handleRecaptchaChange = (token) => setRecaptchaToken(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pin = formData.pin.join("");
    const confirmPin = formData.confirmPin.join("");

    // Validate pin and confirm pin match
    if (pin !== confirmPin) {
      setError("Pins do not match. Please try again.");
      return;
    }

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('firstname', formData.firstname);
    formDataToSend.append('lastname', formData.lastname);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('pin', pin);
    formDataToSend.append('recaptchaToken', recaptchaToken);

    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:8000/api/register`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("reCAPTCHA token (client):", recaptchaToken);

      setLoading(false);
      setMessage(response.data.message);
      setRecaptchaToken(null);

      // Redirect after successful registration
      setTimeout(() => navigate("/login-selection"), 10000); // 15 seconds delay

    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || "Error during registration. Please try again.");
      setRecaptchaToken(null);
    }
  };

  const googleAuth = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      window.open(`${apiUrl}/auth/google`, "_self");
    } catch (error) {
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button className={styles.backBtn} onClick={() => navigate("/")}>
        &larr; Back
      </button>

      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.heading}>Register</h2>

          {/* Input Fields with Icons */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                className={styles.input}
                placeholder="Firstname"
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                className={styles.input}
                placeholder="Lastname"
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
                placeholder="Email"
                required
              />
            </div>
          </div>

          {/* Pin Inputs */}
          <label className={styles.pinLabel}>Pin</label>
          <div className={styles.pinGroup}>
            {formData.pin.map((digit, index) => (
              <input
                key={index}
                type="password"
                name={index.toString()}
                value={digit}
                onChange={(e) => handleChange(e, "pin")}
                className={styles.pinInput}
                maxLength="1"
                inputMode="numeric"
                ref={pinRefs.current[index]}
                required
              />
            ))}
          </div>

          {/* Confirm Pin Inputs */}
          <label className={styles.pinLabel}>Confirm Pin</label>
          <div className={styles.pinGroup}>
            {formData.confirmPin.map((digit, index) => (
              <input
                key={index}
                type="password"
                name={index.toString()}
                value={digit}
                onChange={(e) => handleChange(e, "confirmPin")}
                className={styles.pinInput}
                maxLength="1"
                inputMode="numeric"
                ref={confirmPinRefs.current[index]}
                required
              />
            ))}
          </div>

          {/* reCAPTCHA */}
          <div className={styles.recaptchaWrapper}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {message && <p className={styles.successMessage}>{message}</p>}

          {/* Google Auth */}
          <div className={styles.googleAuth}>
            <button className={styles.googleBtn} onClick={googleAuth}>
              <img src={Google} alt="Google Icon" className={styles.googleIcon} />
              <span>Sign in with Google</span>
            </button>
          </div>

          <p className={styles.loginPrompt}>
            Already have an account? <Link to="/login-selection">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
