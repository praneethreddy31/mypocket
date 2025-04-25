import React from 'react';
import '../assets/css/About.css';
import Navbar from './Navbar';
import logo from '../assets/images/wo_ring.png';
import ring from '../assets/images/ring.png';

function About() {
  return (
    <div>
      <Navbar />
      <div className="App-about">
        <div className="App-about-container">
          <div className="App-about-left">
            <h2>Our Story</h2>
            <p>
              We are a passionate team focused on building innovative solutions that
              improve people's lives. Our journey began with a vision to simplify
              everyday tasks using AI technology. Together, we aim to make
              life more efficient and enjoyable.
            </p>
            <p>
              Our product is built on the foundation of user-centric design, seamless
              functionality, and an unwavering commitment to quality.
            </p>
          </div>
          <div className="App-about-right">
            <img src={logo} className="image About-App-logo" alt="App Logo" />
            <img src={ring} className="image About-App-logo-ring" alt="App Ring" />
          </div>
        </div>
        <p>Developed By <br />AR</p>
      </div>
    </div>
  );
}

export default About;