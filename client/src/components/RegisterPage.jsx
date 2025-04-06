import React, { useState, useRef } from "react";
import axios from "axios";
import styles from './css/RegisterPage.module.css';
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

    if (pin !== confirmPin) {
      setError("Pins do not match. Please try again.");
      return;
    }

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

      setLoading(false);
      setMessage(response.data.message);
      setRecaptchaToken(null);

      setTimeout(() => navigate("/login-selection"), 10000);
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
      className={styles.pageWrapper}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.button 
        className={styles.backBtn}
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fas fa-arrow-left"></i>
        Back
      </motion.button>

      <motion.div 
        className={styles.formWrapper}
        variants={itemVariants}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <motion.h2 
            className={styles.heading}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Register
          </motion.h2>

          <motion.div 
            className={styles.inputGroup}
            variants={containerVariants}
          >
            <motion.div 
              className={styles.inputWrapper}
              variants={itemVariants}
            >
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
            </motion.div>
            <motion.div 
              className={styles.inputWrapper}
              variants={itemVariants}
            >
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
            </motion.div>
            <motion.div 
              className={styles.inputWrapper}
              variants={itemVariants}
            >
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
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={styles.pinLabel}>Pin</label>
            <div className={styles.pinGroup}>
              {formData.pin.map((digit, index) => (
                <motion.input
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
                  whileFocus={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={styles.pinLabel}>Confirm Pin</label>
            <div className={styles.pinGroup}>
              {formData.confirmPin.map((digit, index) => (
                <motion.input
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
                  whileFocus={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div 
            className={styles.recaptchaWrapper}
            variants={itemVariants}
          >
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div
                className={styles.successMessage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            type="submit" 
            className={styles.btn} 
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>

          <motion.div 
            className={styles.googleAuth}
            variants={itemVariants}
          >
            <motion.button
              type="button"
              className={styles.googleBtn}
              onClick={googleAuth}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.img 
                src={Google} 
                alt="Google" 
                className={styles.googleIcon}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              Continue with Google
            </motion.button>
          </motion.div>

          <motion.div 
            className={styles.loginPrompt}
            variants={itemVariants}
          >
            Already have an account?{" "}
            <Link to="/login-selection">Login here</Link>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default RegisterPage;
