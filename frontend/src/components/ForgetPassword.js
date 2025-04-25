import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../assets/css/Auth.module.css";
import logo from "../assets/images/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false); // Added to differentiate success and error messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email address.");
      setSuccess(false);
      return;
    }

    try {
      await axios.post("https://mypocketai.onrender.com/api/auth/forgot-password", { email });
      setMessage("Please check your mail to reset password.");
      setSuccess(true);

      // Optionally, redirect after a delay
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reset instructions.");
      setSuccess(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <img src={logo} alt="Logo" className={styles.authlogo} />
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={styles.authInput}
        />
        <button type="submit" className={styles.authButton}>
          Submit
        </button>
      </form>
      {message && (
        <p className={success ? styles.successMessage : styles.errorMessage}>{message}</p>
      )}

      <div className={styles.authLinks}>
        <p>
          Remembered your password? <Link to="/login">Login</Link>
        </p>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;