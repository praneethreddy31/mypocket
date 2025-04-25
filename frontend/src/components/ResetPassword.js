import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../assets/css/Auth.module.css";
import logo from "../assets/images/logo.png";

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setSuccess(false);
      return;
    }

    try {
      const response = await axios.post(`https://mypocketai.onrender.com/api/auth/reset-password/${token}`, {
        password,
      });
      setMessage(response.data.message || "Password reset successfully!");
      setSuccess(true);

      // Redirect to login page after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password.");
      setSuccess(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <img src={logo} alt="Logo" className={styles.authlogo} />
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          className={styles.authInput}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className={styles.authInput}
        />
        <button type="submit" className={styles.authButton}>
          Reset Password
        </button>
      </form>
      {message && (
        <p className={success ? styles.successMessage : styles.errorMessage}>{message}</p>
      )}
    </div>
  );
};

export default ResetPassword;