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
            Find the right doctor and book your healthcare appointment quickly and
            easily.
          </p>
          <button 
            className="primary-btn" 
            onClick={() => navigate('/doctors')}
          >
            Book an Appointment
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
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Expert Doctors</h3>
            <p>Connect with experienced healthcare professionals.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>Book appointments quickly from your device.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Your appointment information is stored securely.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
