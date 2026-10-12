import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Your Health, <span>Our Priority</span>
          </h1>
          <p>
            Find leading doctors across top hospitals in Andhra Pradesh and book your
            healthcare appointment quickly and easily.
          </p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/doctors')}
          >
            Find Doctors & Hospitals (AP)
          </button>
        </div>
        <div className="hero-image" role="img" aria-label="Healthcare illustration">
          👨‍⚕️
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="features">
        <h2>Why Choose SmartCare?</h2>
        <div className="feature-container">
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h3>Top AP Hospitals</h3>
            <p>Apollo, Manipal, KIMS, Ramesh & Care Hospitals across Andhra Pradesh.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location & Hospital Search</h3>
            <p>Effortlessly filter by AP city, hospital, specialization, and doctor.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Instant Booking</h3>
            <p>Select your date and time slot with instant confirmed scheduling.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
