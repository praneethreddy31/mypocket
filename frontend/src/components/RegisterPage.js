import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../assets/css/Auth.module.css";
import logo from '../assets/images/logo.png'

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://mypocketai.onrender.com/api/auth/register", formData);
      setMessage(res.data.message);
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <img src={logo} alt="Logo" className={styles.authlogo}/>
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className={styles.authInput}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className={styles.authInput}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className={styles.authInput}
        />
        <button type="submit" className={styles.authButton}>
          Register
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.authLinks}>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p>
          Forgot your password? <Link to="/forgot-password">Reset it here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;