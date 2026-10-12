// Andhra Pradesh Healthcare Data: Locations, Hospitals, and Doctors
// Supports 13 key Andhra Pradesh locations with verified sample data

export const apLocations = [
  "Visakhapatnam",
  "Vijayawada",
  "Guntur",
  "Tenali",
  "Tirupati",
  "Nellore",
  "Kakinada",
  "Rajahmundry",
  "Ongole",
  "Kurnool",
  "Kadapa",
  "Anantapur",
  "Eluru"
];

export const hospitalsByLocation = {
  "Visakhapatnam": [
    "Apollo Hospitals (Ramnagar)",
    "Care Hospitals (Maharanipeta)",
    "KIMS ICON Hospital (Sheela Nagar)",
    "SevenHills Hospital (Rockdale Layout)"
  ],
  "Vijayawada": [
    "Manipal Hospital (Tadepalli)",
    "Ramesh Hospitals (Ring Road)",
    "Ayush Hospitals (Collector Office Road)",
    "Aayush NRI Healthcare"
  ],
  "Guntur": [
    "Ramesh Hospitals (Collector Office Road)",
    "KIMS Hospitals (Nallapadu Road)",
    "Lalitha Super Specialities Hospital"
  ],
  "Tenali": [
    "Government General Hospital (Tenali)",
    "Subham Multi-Speciality Clinic (Tenali)"
  ],
  "Tirupati": [
    "SVIMS Super Speciality Hospital",
    "Amara Hospital (Karakambadi Road)",
    "Apollo Speciality Clinic (Bhavani Nagar)"
  ],
  "Nellore": [
    "Medicover Hospitals (Nellore)",
    "Simhapuri Hospitals (Nellore)"
  ],
  "Kakinada": [
    "Medicover Hospitals (Bhanugudi)",
    "Apollo Speciality Clinic (Main Road)"
  ],
  "Rajahmundry": [
    "GSL General Hospital (NH-16)",
    "Sai Multi-Speciality Hospital"
  ],
  "Ongole": [
    "RIMS General Hospital (Ongole)",
    "Sanghamitra Hospital (Ongole)"
  ],
  "Kurnool": [
    "KIMS Hospitals (Joharapuram Road)",
    "Medicover Hospitals (Sampath Nagar)"
  ],
  "Kadapa": [
    "RIMS General Hospital (Kadapa)",
    "Tirumala Multi-Speciality Hospital (Kadapa)"
  ],
  "Anantapur": [
    "Saveera Hospital (Anantapur)",
    "Government General Hospital (Anantapur)"
  ],
  "Eluru": [
    "District Headquarters General Hospital (Eluru)",
    "ASRAM Hospital (Eluru)"
  ]
};

export const specializations = [
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
  "General Physician",
  "Pulmonologist",
  "Oncologist",
  "Nephrologist",
  "Cardiac Surgeon",
  "General Surgeon"
];

// Doctor catalog across Andhra Pradesh hospitals
export const doctors = [
  // Visakhapatnam Doctors
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "12 years",
    image: "👨‍⚕️",
    location: "Visakhapatnam",
    hospital: "Apollo Hospitals (Ramnagar)",
    fee: "₹700",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 5,
    name: "Dr. Suresh Varma",
    specialization: "Orthopedic",
    rating: 4.7,
    experience: "14 years",
    image: "👨‍⚕️",
    location: "Visakhapatnam",
    hospital: "Care Hospitals (Maharanipeta)",
    fee: "₹650",
    availableDays: "Mon - Fri",
    timeSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"]
  },
  {
    id: 6,
    name: "Dr. Swathi Naidu",
    specialization: "General Physician",
    rating: 4.9,
    experience: "10 years",
    image: "👩‍⚕️",
    location: "Visakhapatnam",
    hospital: "KIMS ICON Hospital (Sheela Nagar)",
    fee: "₹500",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"]
  },
  {
    id: 7,
    name: "Dr. Venkat Raman",
    specialization: "Pulmonologist",
    rating: 4.6,
    experience: "11 years",
    image: "👨‍⚕️",
    location: "Visakhapatnam",
    hospital: "SevenHills Hospital (Rockdale Layout)",
    fee: "₹600",
    availableDays: "Tue - Sat",
    timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },

  // Vijayawada Doctors
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    rating: 4.7,
    experience: "9 years",
    image: "👩‍⚕️",
    location: "Vijayawada",
    hospital: "Manipal Hospital (Tadepalli)",
    fee: "₹600",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 8,
    name: "Dr. P. Venkateswara Rao",
    specialization: "Cardiologist",
    rating: 4.9,
    experience: "16 years",
    image: "👨‍⚕️",
    location: "Vijayawada",
    hospital: "Ramesh Hospitals (Ring Road)",
    fee: "₹800",
    availableDays: "Mon - Fri",
    timeSlots: ["09:00 AM", "10:30 AM", "11:30 AM", "03:00 PM", "04:30 PM"]
  },
  {
    id: 9,
    name: "Dr. Haritha Chowdary",
    specialization: "Gynecologist",
    rating: 4.8,
    experience: "13 years",
    image: "👩‍⚕️",
    location: "Vijayawada",
    hospital: "Ayush Hospitals (Collector Office Road)",
    fee: "₹650",
    availableDays: "Mon - Sat",
    timeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 10,
    name: "Dr. Kiran Kumar",
    specialization: "Orthopedic",
    rating: 4.7,
    experience: "11 years",
    image: "👨‍⚕️",
    location: "Vijayawada",
    hospital: "Aayush NRI Healthcare",
    fee: "₹600",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },

  // Guntur Doctors
  {
    id: 4,
    name: "Dr. Anjali Rao",
    specialization: "Pediatrician",
    rating: 4.6,
    experience: "8 years",
    image: "👩‍⚕️",
    location: "Guntur",
    hospital: "KIMS Hospitals (Nallapadu Road)",
    fee: "₹500",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 11,
    name: "Dr. B. Prasad",
    specialization: "Cardiologist",
    rating: 4.9,
    experience: "18 years",
    image: "👨‍⚕️",
    location: "Guntur",
    hospital: "Ramesh Hospitals (Collector Office Road)",
    fee: "₹750",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 12,
    name: "Dr. Madhavi Latha",
    specialization: "General Physician",
    rating: 4.7,
    experience: "9 years",
    image: "👩‍⚕️",
    location: "Guntur",
    hospital: "Lalitha Super Specialities Hospital",
    fee: "₹500",
    availableDays: "Mon - Fri",
    timeSlots: ["09:30 AM", "10:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"]
  },

  // Tenali Doctors
  {
    id: 21,
    name: "Dr. N. Ravi Teja",
    specialization: "General Physician",
    rating: 4.7,
    experience: "11 years",
    image: "👨‍⚕️",
    location: "Tenali",
    hospital: "Government General Hospital (Tenali)",
    fee: "₹450",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },
  {
    id: 22,
    name: "Dr. K. Sneha",
    specialization: "Dermatologist",
    rating: 4.8,
    experience: "8 years",
    image: "👩‍⚕️",
    location: "Tenali",
    hospital: "Subham Multi-Speciality Clinic (Tenali)",
    fee: "₹500",
    availableDays: "Mon - Fri",
    timeSlots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },

  // Tirupati Doctors
  {
    id: 3,
    name: "Dr. Arjun Reddy",
    specialization: "Neurologist",
    rating: 4.9,
    experience: "15 years",
    image: "👨‍⚕️",
    location: "Tirupati",
    hospital: "Amara Hospital (Karakambadi Road)",
    fee: "₹750",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 13,
    name: "Dr. K. Srinivasulu",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "17 years",
    image: "👨‍⚕️",
    location: "Tirupati",
    hospital: "SVIMS Super Speciality Hospital",
    fee: "₹600",
    availableDays: "Mon - Fri",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },
  {
    id: 14,
    name: "Dr. Sandhya Rani",
    specialization: "Dermatologist",
    rating: 4.7,
    experience: "10 years",
    image: "👩‍⚕️",
    location: "Tirupati",
    hospital: "Apollo Speciality Clinic (Bhavani Nagar)",
    fee: "₹550",
    availableDays: "Mon - Sat",
    timeSlots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"]
  },

  // Nellore Doctors
  {
    id: 23,
    name: "Dr. V. Mohan Reddy",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "14 years",
    image: "👨‍⚕️",
    location: "Nellore",
    hospital: "Medicover Hospitals (Nellore)",
    fee: "₹650",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 24,
    name: "Dr. S. Bhavani",
    specialization: "Pediatrician",
    rating: 4.7,
    experience: "9 years",
    image: "👩‍⚕️",
    location: "Nellore",
    hospital: "Simhapuri Hospitals (Nellore)",
    fee: "₹500",
    availableDays: "Mon - Fri",
    timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },

  // Kakinada Doctors
  {
    id: 17,
    name: "Dr. M. Sitaramaraju",
    specialization: "General Physician",
    rating: 4.8,
    experience: "12 years",
    image: "👨‍⚕️",
    location: "Kakinada",
    hospital: "Medicover Hospitals (Bhanugudi)",
    fee: "₹550",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 18,
    name: "Dr. Deepthi V",
    specialization: "Dermatologist",
    rating: 4.6,
    experience: "7 years",
    image: "👩‍⚕️",
    location: "Kakinada",
    hospital: "Apollo Speciality Clinic (Main Road)",
    fee: "₹550",
    availableDays: "Mon - Sat",
    timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },

  // Rajahmundry Doctors
  {
    id: 19,
    name: "Dr. V. Satyanarayana",
    specialization: "Neurologist",
    rating: 4.9,
    experience: "16 years",
    image: "👨‍⚕️",
    location: "Rajahmundry",
    hospital: "GSL General Hospital (NH-16)",
    fee: "₹700",
    availableDays: "Mon - Sat",
    timeSlots: ["09:30 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"]
  },
  {
    id: 20,
    name: "Dr. K. Ramalingeswara Rao",
    specialization: "Orthopedic",
    rating: 4.7,
    experience: "14 years",
    image: "👨‍⚕️",
    location: "Rajahmundry",
    hospital: "Sai Multi-Speciality Hospital",
    fee: "₹600",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },

  // Ongole Doctors
  {
    id: 25,
    name: "Dr. T. Ramanjaneyulu",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "13 years",
    image: "👨‍⚕️",
    location: "Ongole",
    hospital: "Sanghamitra Hospital (Ongole)",
    fee: "₹650",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },
  {
    id: 26,
    name: "Dr. Ch. Sirisha",
    specialization: "General Physician",
    rating: 4.7,
    experience: "9 years",
    image: "👩‍⚕️",
    location: "Ongole",
    hospital: "RIMS General Hospital (Ongole)",
    fee: "₹450",
    availableDays: "Mon - Fri",
    timeSlots: ["09:30 AM", "10:30 AM", "02:30 PM", "03:30 PM"]
  },

  // Kurnool Doctors
  {
    id: 15,
    name: "Dr. G. Chandra Sekhar",
    specialization: "Orthopedic",
    rating: 4.8,
    experience: "13 years",
    image: "👨‍⚕️",
    location: "Kurnool",
    hospital: "KIMS Hospitals (Joharapuram Road)",
    fee: "₹600",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 16,
    name: "Dr. Rohini Devi",
    specialization: "Pediatrician",
    rating: 4.7,
    experience: "8 years",
    image: "👩‍⚕️",
    location: "Kurnool",
    hospital: "Medicover Hospitals (Sampath Nagar)",
    fee: "₹500",
    availableDays: "Mon - Fri",
    timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },

  // Kadapa Doctors
  {
    id: 27,
    name: "Dr. Y. Sudhakar Reddy",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "15 years",
    image: "👨‍⚕️",
    location: "Kadapa",
    hospital: "Tirumala Multi-Speciality Hospital (Kadapa)",
    fee: "₹650",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },
  {
    id: 28,
    name: "Dr. M. Prameela",
    specialization: "General Physician",
    rating: 4.7,
    experience: "10 years",
    image: "👩‍⚕️",
    location: "Kadapa",
    hospital: "RIMS General Hospital (Kadapa)",
    fee: "₹450",
    availableDays: "Mon - Fri",
    timeSlots: ["09:30 AM", "10:30 AM", "02:30 PM", "03:30 PM"]
  },

  // Anantapur Doctors
  {
    id: 29,
    name: "Dr. B. Ramanath",
    specialization: "Orthopedic",
    rating: 4.8,
    experience: "12 years",
    image: "👨‍⚕️",
    location: "Anantapur",
    hospital: "Saveera Hospital (Anantapur)",
    fee: "₹600",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"]
  },
  {
    id: 30,
    name: "Dr. K. Sailaja",
    specialization: "Pediatrician",
    rating: 4.6,
    experience: "9 years",
    image: "👩‍⚕️",
    location: "Anantapur",
    hospital: "Government General Hospital (Anantapur)",
    fee: "₹450",
    availableDays: "Mon - Fri",
    timeSlots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },

  // Eluru Doctors
  {
    id: 31,
    name: "Dr. D. Vijaya Bhaskar",
    specialization: "Cardiologist",
    rating: 4.8,
    experience: "16 years",
    image: "👨‍⚕️",
    location: "Eluru",
    hospital: "ASRAM Hospital (Eluru)",
    fee: "₹700",
    availableDays: "Mon - Sat",
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  },
  {
    id: 32,
    name: "Dr. P. Leela Rani",
    specialization: "General Physician",
    rating: 4.7,
    experience: "8 years",
    image: "👩‍⚕️",
    location: "Eluru",
    hospital: "District Headquarters General Hospital (Eluru)",
    fee: "₹450",
    availableDays: "Mon - Fri",
    timeSlots: ["09:30 AM", "10:30 AM", "02:30 PM", "03:30 PM"]
  }
];

export default doctors;
