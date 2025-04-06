import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import AdminLoginPage from './components/AdminLoginPage';
import LoginSelectionPage from './components/LoginSelection';
import VerifyPage from './components/VerifyEmail';
import GoogleCallbackPage from './components/GoogleCallbackPage';
import Dashboard from './components/Dashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ScanPage from './components/ScanPage';
import PaymentPage from './components/PaymentPage'
import ThankYou from './components/Thankyou.jsx';
import EditProfile from './components/EditProfile.jsx';
import './App.css';
import ResetPinPage from './components/ResetPinPage.jsx';

function App() {


  // Show loading message until the user data is fetched

  // Theme configuration for Material-UI
  const theme = createTheme({
    palette: {
      success: {
        main: '#4caf50',
      },
      error: {
        main: '#f44336',
      },
    },
  });

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <ConditionalDashboard />
      </ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element=  { <RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/login-selection" element= { <LoginSelectionPage />} />
        <Route path="/verify-email" element={<VerifyPage />} />
        <Route path="/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/scan" element={ <ScanPage />} />
        <Route path="/payment" element= { <PaymentPage />} />
        <Route path="/thank-you" element= { <ThankYou />} />
        <Route path='/edit-profile/:id' element={<EditProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-pin/:token" element={<ResetPinPage />} />
      </Routes>
    </Router>
  );
}

// Conditional rendering of Dashboard based on current path
function ConditionalDashboard() {
  const location = useLocation();
  const dashboardPaths = [
    "/dashboard",
    "/user-list",
    "/product-list",
    "/total-sales",
    "/admin-profile",
  ];

  return dashboardPaths.includes(location.pathname) ? <Dashboard /> : null;
}

export default App;




