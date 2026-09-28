import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctors } from '../data/doctors';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter doctors dynamically by name or specialization
  const filteredDoctors = doctors.filter((doc) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query)
    );
  });

  // Handle appointment booking button click
  const handleBookClick = (doctor) => {
    if (!user) {
      alert('Please login before booking an appointment.');
      navigate('/login');
      return;
    }

    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="doctors-page">
      <section className="doctors-section">
        <h2>Find a Doctor</h2>
        <p className="section-description">
          Search for a doctor based on name or specialization.
        </p>

        {/* Dynamic Search Box */}
        <div className="search-container">
          <input
            type="text"
            id="doctorSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or specialization..."
          />
        </div>

        {/* Doctor Grid or No Results */}
        {filteredDoctors.length > 0 ? (
          <div className="doctor-container">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBook={handleBookClick}
              />
            ))}
          </div>
        ) : (
          <p className="no-appointments">No doctors found.</p>
        )}
      </section>

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Doctors;
