import React from 'react';
import '../assets/css/HomePage.css';
import logo from '../assets/images/wo_ring.png';
import ring from '../assets/images/ring.png';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="App">
      <div className="App-Container">
        <img src={logo} className="image App-logo" alt="App Logo" />
        <img src={ring} className="image App-logo-ring" alt="App Ring" />
        <h1 className="App-Title">MY POCKET <span>AI</span></h1>
      </div>
      <Link to="/login" className="button">
      <p>&#8594; Get Started &#8592;</p>
      </Link>
    </div>
  );
}

export default HomePage;