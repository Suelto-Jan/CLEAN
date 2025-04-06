import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./css/HomePage.module.css";
import logo1 from "../images/BSU LOGO.png";
import logo2 from "../images/COT.png";

const HomePage = () => {
  return (
    <div className={styles.homepageContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <motion.div
          className={styles.adminIcon}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          title="Admin Login"
        >
          <Link to="/admin-login">
            <i className="fas fa-user-shield"></i> {/* Admin icon */}
          </Link>
        </motion.div>

        <div className={styles.navButtons}>
          <Link to="/login-selection">
            <motion.button
              className={styles.customButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              className={styles.customButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Register
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className={styles.mainContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <motion.div
          className={styles.logos}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img src={logo1} alt="University Logo" className={styles.logoImg} />
          <img src={logo2} alt="College Logo" className={styles.logoImg} />
        </motion.div>

        <motion.h1
          className={styles.title}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Bukidnon State University
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          College Of Technologies
        </motion.p>
      </motion.div>

      {/* Footer Section */}
      <motion.footer
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      >
        <p className={styles.footerText}>
          BUKIDNON STATE UNIVERSITY | College of Technologies
        </p>
      </motion.footer>
    </div>
  );
};

export default HomePage;
