import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Location from '../models/Location.js';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// 1. All 13 Andhra Pradesh Locations requested
export const apLocationsData = [
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', description: 'Major port city and healthcare hub in coastal Andhra', isActive: true },
  { name: 'Vijayawada', state: 'Andhra Pradesh', description: 'Commercial center with premier multi-speciality healthcare facilities', isActive: true },
  { name: 'Guntur', state: 'Andhra Pradesh', description: 'Prominent educational and medical center in coastal Andhra Pradesh', isActive: true },
  { name: 'Tenali', state: 'Andhra Pradesh', description: 'Healthcare and regional clinic center in Guntur district', isActive: true },
  { name: 'Tirupati', state: 'Andhra Pradesh', description: 'Pilgrimage and top medical institute hub with SVIMS', isActive: true },
  { name: 'Nellore', state: 'Andhra Pradesh', description: 'Key southern coastal healthcare network hub', isActive: true },
  { name: 'Kakinada', state: 'Andhra Pradesh', description: 'East Godavari district healthcare center', isActive: true },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', description: 'Cultural and medical hub on the banks of Godavari', isActive: true },
  { name: 'Ongole', state: 'Andhra Pradesh', description: 'Prakasam district medical and hospital center', isActive: true },
  { name: 'Kurnool', state: 'Andhra Pradesh', description: 'Rayalaseema region premier healthcare center', isActive: true },
  { name: 'Kadapa', state: 'Andhra Pradesh', description: 'Central Rayalaseema healthcare and diagnostic center', isActive: true },
  { name: 'Anantapur', state: 'Andhra Pradesh', description: 'Western Rayalaseema healthcare and multispeciality center', isActive: true },
  { name: 'Eluru', state: 'Andhra Pradesh', description: 'West Godavari district healthcare and hospital center', isActive: true },
];

// 2. Verified & Sample Hospitals across Andhra Pradesh (Clearly designated sample/development data)
export const hospitalsData = [
  // Visakhapatnam
  { name: 'Apollo Hospitals (Ramnagar)', location_name: 'Visakhapatnam', city: 'Visakhapatnam', address: 'Waltair Main Road, Ramnagar', phone: '0891-2727272', rating: 4.9, specialties: ['Cardiology', 'Neurology', 'Oncology'] },
  { name: 'Care Hospitals (Maharanipeta)', location_name: 'Visakhapatnam', city: 'Visakhapatnam', address: 'AS Raja Complex, Maharanipeta', phone: '0891-3041444', rating: 4.8, specialties: ['Orthopedics', 'Cardiology', 'Emergency'] },
  { name: 'KIMS ICON Hospital (Sheela Nagar)', location_name: 'Visakhapatnam', city: 'Visakhapatnam', address: 'NH16, Sheela Nagar', phone: '0891-3500500', rating: 4.8, specialties: ['General Medicine', 'Surgery', 'Pediatrics'] },
  { name: 'SevenHills Hospital (Rockdale Layout)', location_name: 'Visakhapatnam', city: 'Visakhapatnam', address: 'Rockdale Layout, Waltair Uplands', phone: '0891-6677777', rating: 4.7, specialties: ['Pulmonology', 'Cardiology'] },

  // Vijayawada
  { name: 'Manipal Hospital (Tadepalli)', location_name: 'Vijayawada', city: 'Vijayawada', address: 'Near Kanakadurga Varadhi, Tadepalli', phone: '0866-2494949', rating: 4.9, specialties: ['Dermatology', 'Cardiology', 'Neurology'] },
  { name: 'Ramesh Hospitals (Ring Road)', location_name: 'Vijayawada', city: 'Vijayawada', address: 'Near ITI Road, Ring Road', phone: '0866-2488888', rating: 4.9, specialties: ['Cardiology', 'Cardiac Surgery'] },
  { name: 'Ayush Hospitals (Collector Office Road)', location_name: 'Vijayawada', city: 'Vijayawada', address: 'Old Bus Stand Road', phone: '0866-6666999', rating: 4.8, specialties: ['Gynecology', 'Pediatrics'] },
  { name: 'Aayush NRI Healthcare', location_name: 'Vijayawada', city: 'Vijayawada', address: 'Benz Circle', phone: '0866-2555555', rating: 4.7, specialties: ['Orthopedics', 'General Surgery'] },

  // Guntur
  { name: 'Ramesh Hospitals (Collector Office Road)', location_name: 'Guntur', city: 'Guntur', address: 'Collector Office Road, Guntur', phone: '0863-2222222', rating: 4.9, specialties: ['Cardiology', 'Vascular'] },
  { name: 'KIMS Hospitals (Nallapadu Road)', location_name: 'Guntur', city: 'Guntur', address: 'Nallapadu Road, Guntur', phone: '0863-2444444', rating: 4.8, specialties: ['Pediatrics', 'Neonatology'] },
  { name: 'Lalitha Super Specialities Hospital', location_name: 'Guntur', city: 'Guntur', address: 'Kothapet, Guntur', phone: '0863-2333333', rating: 4.7, specialties: ['General Medicine', 'Neurology'] },

  // Tenali
  { name: 'Government General Hospital (Tenali)', location_name: 'Tenali', city: 'Tenali', address: 'Hospital Road, Tenali', phone: '08644-223456', rating: 4.6, specialties: ['General Medicine', 'Pediatrics', 'Orthopedics'] },
  { name: 'Subham Multi-Speciality Clinic (Tenali)', location_name: 'Tenali', city: 'Tenali', address: 'Main Road, Tenali', phone: '08644-227890', rating: 4.7, specialties: ['Cardiology', 'Dermatology'] },

  // Tirupati
  { name: 'SVIMS Super Speciality Hospital', location_name: 'Tirupati', city: 'Tirupati', address: 'Alipiri Road, Tirupati', phone: '0877-2287777', rating: 4.9, specialties: ['Cardiology', 'Neurology', 'Nephrology'] },
  { name: 'Amara Hospital (Karakambadi Road)', location_name: 'Tirupati', city: 'Tirupati', address: 'Karakambadi Road, Tirupati', phone: '0877-6699999', rating: 4.8, specialties: ['Neurology', 'Orthopedics'] },
  { name: 'Apollo Speciality Clinic (Bhavani Nagar)', location_name: 'Tirupati', city: 'Tirupati', address: 'Bhavani Nagar, Tirupati', phone: '0877-2234567', rating: 4.7, specialties: ['Dermatology', 'General Health'] },

  // Nellore
  { name: 'Medicover Hospitals (Nellore)', location_name: 'Nellore', city: 'Nellore', address: 'Pogathota, Nellore', phone: '0861-2334455', rating: 4.8, specialties: ['Cardiology', 'Orthopedics', 'General Medicine'] },
  { name: 'Simhapuri Hospitals (Nellore)', location_name: 'Nellore', city: 'Nellore', address: 'Near Childrens Park, Nellore', phone: '0861-2345678', rating: 4.7, specialties: ['Neurology', 'Pediatrics'] },

  // Kakinada
  { name: 'Medicover Hospitals (Bhanugudi)', location_name: 'Kakinada', city: 'Kakinada', address: 'Bhanugudi Junction, Kakinada', phone: '0884-2334455', rating: 4.8, specialties: ['General Physician', 'Critical Care'] },
  { name: 'Apollo Speciality Clinic (Main Road)', location_name: 'Kakinada', city: 'Kakinada', address: 'Main Road, Kakinada', phone: '0884-2345678', rating: 4.7, specialties: ['Dermatology', 'Cardiology'] },

  // Rajahmundry
  { name: 'GSL General Hospital (NH-16)', location_name: 'Rajahmundry', city: 'Rajahmundry', address: 'NH-16, Rajahmundry', phone: '0883-2484999', rating: 4.8, specialties: ['Neurology', 'Multi-Speciality'] },
  { name: 'Sai Multi-Speciality Hospital', location_name: 'Rajahmundry', city: 'Rajahmundry', address: 'Danavaipeta, Rajahmundry', phone: '0883-2456789', rating: 4.7, specialties: ['Orthopedics', 'Trauma'] },

  // Ongole
  { name: 'RIMS General Hospital (Ongole)', location_name: 'Ongole', city: 'Ongole', address: 'South Bypass Road, Ongole', phone: '08592-234567', rating: 4.7, specialties: ['General Medicine', 'Pediatrics'] },
  { name: 'Sanghamitra Hospital (Ongole)', location_name: 'Ongole', city: 'Ongole', address: 'Kurnool Road, Ongole', phone: '08592-237890', rating: 4.8, specialties: ['Cardiology', 'Orthopedics'] },

  // Kurnool
  { name: 'KIMS Hospitals (Joharapuram Road)', location_name: 'Kurnool', city: 'Kurnool', address: 'Joharapuram Road, Kurnool', phone: '08518-223344', rating: 4.8, specialties: ['Orthopedics', 'Cardiology'] },
  { name: 'Medicover Hospitals (Sampath Nagar)', location_name: 'Kurnool', city: 'Kurnool', address: 'Sampath Nagar, Kurnool', phone: '08518-245566', rating: 4.7, specialties: ['Pediatrics', 'General Medicine'] },

  // Kadapa
  { name: 'RIMS General Hospital (Kadapa)', location_name: 'Kadapa', city: 'Kadapa', address: 'RIMS Road, Putlampalli, Kadapa', phone: '08562-223344', rating: 4.7, specialties: ['General Medicine', 'Surgery', 'Pediatrics'] },
  { name: 'Tirumala Multi-Speciality Hospital (Kadapa)', location_name: 'Kadapa', city: 'Kadapa', address: 'Seven Roads Junction, Kadapa', phone: '08562-234567', rating: 4.8, specialties: ['Cardiology', 'Orthopedics'] },

  // Anantapur
  { name: 'Saveera Hospital (Anantapur)', location_name: 'Anantapur', city: 'Anantapur', address: 'Near Clock Tower, Anantapur', phone: '08554-223456', rating: 4.8, specialties: ['Cardiology', 'Neurology', 'Orthopedics'] },
  { name: 'Government General Hospital (Anantapur)', location_name: 'Anantapur', city: 'Anantapur', address: 'Court Road, Anantapur', phone: '08554-227890', rating: 4.6, specialties: ['General Medicine', 'Pediatrics'] },

  // Eluru
  { name: 'District Headquarters General Hospital (Eluru)', location_name: 'Eluru', city: 'Eluru', address: 'Sanivarapupeta, Eluru', phone: '08812-223456', rating: 4.7, specialties: ['General Medicine', 'Pediatrics'] },
  { name: 'ASRAM Hospital (Eluru)', location_name: 'Eluru', city: 'Eluru', address: 'Malkapuram, NH-16, Eluru', phone: '08812-288288', rating: 4.8, specialties: ['Cardiology', 'Neurology', 'Orthopedics'] },
];

// 3. Representative Doctor data across Andhra Pradesh
export const doctorsData = [
  // Visakhapatnam
  { name: 'Dr. Rajesh Kumar', specialization: 'Cardiologist', location: 'Visakhapatnam', hospital: 'Apollo Hospitals (Ramnagar)', rating: 4.8, experience: '12 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Suresh Varma', specialization: 'Orthopedic', location: 'Visakhapatnam', hospital: 'Care Hospitals (Maharanipeta)', rating: 4.7, experience: '14 years', fee: '₹650', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Swathi Naidu', specialization: 'General Physician', location: 'Visakhapatnam', hospital: 'KIMS ICON Hospital (Sheela Nagar)', rating: 4.9, experience: '10 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM', '05:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. Venkat Raman', specialization: 'Pulmonologist', location: 'Visakhapatnam', hospital: 'SevenHills Hospital (Rockdale Layout)', rating: 4.6, experience: '11 years', fee: '₹600', availableDays: 'Tue - Sat', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },

  // Vijayawada
  { name: 'Dr. Priya Sharma', specialization: 'Dermatologist', location: 'Vijayawada', hospital: 'Manipal Hospital (Tadepalli)', rating: 4.7, experience: '9 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. P. Venkateswara Rao', specialization: 'Cardiologist', location: 'Vijayawada', hospital: 'Ramesh Hospitals (Ring Road)', rating: 4.9, experience: '16 years', fee: '₹800', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:30 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Haritha Chowdary', specialization: 'Gynecologist', location: 'Vijayawada', hospital: 'Ayush Hospitals (Collector Office Road)', rating: 4.8, experience: '13 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. Kiran Kumar', specialization: 'Orthopedic', location: 'Vijayawada', hospital: 'Aayush NRI Healthcare', rating: 4.7, experience: '11 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },

  // Guntur
  { name: 'Dr. Anjali Rao', specialization: 'Pediatrician', location: 'Guntur', hospital: 'KIMS Hospitals (Nallapadu Road)', rating: 4.6, experience: '8 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. B. Prasad', specialization: 'Cardiologist', location: 'Guntur', hospital: 'Ramesh Hospitals (Collector Office Road)', rating: 4.9, experience: '18 years', fee: '₹750', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Madhavi Latha', specialization: 'General Physician', location: 'Guntur', hospital: 'Lalitha Super Specialities Hospital', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '10:30 AM', '02:30 PM', '03:30 PM', '04:30 PM'], image: '👩‍⚕️' },

  // Tenali
  { name: 'Dr. N. Ravi Teja', specialization: 'General Physician', location: 'Tenali', hospital: 'Government General Hospital (Tenali)', rating: 4.7, experience: '11 years', fee: '₹450', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Sneha', specialization: 'Dermatologist', location: 'Tenali', hospital: 'Subham Multi-Speciality Clinic (Tenali)', rating: 4.8, experience: '8 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Tirupati
  { name: 'Dr. Arjun Reddy', specialization: 'Neurologist', location: 'Tirupati', hospital: 'Amara Hospital (Karakambadi Road)', rating: 4.9, experience: '15 years', fee: '₹750', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Srinivasulu', specialization: 'Cardiologist', location: 'Tirupati', hospital: 'SVIMS Super Speciality Hospital', rating: 4.8, experience: '17 years', fee: '₹600', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Sandhya Rani', specialization: 'Dermatologist', location: 'Tirupati', hospital: 'Apollo Speciality Clinic (Bhavani Nagar)', rating: 4.7, experience: '10 years', fee: '₹550', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM', '05:00 PM'], image: '👩‍⚕️' },

  // Nellore
  { name: 'Dr. V. Mohan Reddy', specialization: 'Cardiologist', location: 'Nellore', hospital: 'Medicover Hospitals (Nellore)', rating: 4.8, experience: '14 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. S. Bhavani', specialization: 'Pediatrician', location: 'Nellore', hospital: 'Simhapuri Hospitals (Nellore)', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Kakinada
  { name: 'Dr. M. Sitaramaraju', specialization: 'General Physician', location: 'Kakinada', hospital: 'Medicover Hospitals (Bhanugudi)', rating: 4.8, experience: '12 years', fee: '₹550', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Deepthi V', specialization: 'Dermatologist', location: 'Kakinada', hospital: 'Apollo Speciality Clinic (Main Road)', rating: 4.6, experience: '7 years', fee: '₹550', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Rajahmundry
  { name: 'Dr. V. Satyanarayana', specialization: 'Neurologist', location: 'Rajahmundry', hospital: 'GSL General Hospital (NH-16)', rating: 4.9, experience: '16 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Ramalingeswara Rao', specialization: 'Orthopedic', location: 'Rajahmundry', hospital: 'Sai Multi-Speciality Hospital', rating: 4.7, experience: '14 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },

  // Ongole
  { name: 'Dr. T. Ramanjaneyulu', specialization: 'Cardiologist', location: 'Ongole', hospital: 'Sanghamitra Hospital (Ongole)', rating: 4.8, experience: '13 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Ch. Sirisha', specialization: 'General Physician', location: 'Ongole', hospital: 'RIMS General Hospital (Ongole)', rating: 4.7, experience: '9 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '10:30 AM', '02:30 PM', '03:30 PM'], image: '👩‍⚕️' },

  // Kurnool
  { name: 'Dr. G. Chandra Sekhar', specialization: 'Orthopedic', location: 'Kurnool', hospital: 'KIMS Hospitals (Joharapuram Road)', rating: 4.8, experience: '13 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Rohini Devi', specialization: 'Pediatrician', location: 'Kurnool', hospital: 'Medicover Hospitals (Sampath Nagar)', rating: 4.7, experience: '8 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Kadapa
  { name: 'Dr. Y. Sudhakar Reddy', specialization: 'Cardiologist', location: 'Kadapa', hospital: 'Tirumala Multi-Speciality Hospital (Kadapa)', rating: 4.8, experience: '15 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. M. Prameela', specialization: 'General Physician', location: 'Kadapa', hospital: 'RIMS General Hospital (Kadapa)', rating: 4.7, experience: '10 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '10:30 AM', '02:30 PM', '03:30 PM'], image: '👩‍⚕️' },

  // Anantapur
  { name: 'Dr. B. Ramanath', specialization: 'Orthopedic', location: 'Anantapur', hospital: 'Saveera Hospital (Anantapur)', rating: 4.8, experience: '12 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Sailaja', specialization: 'Pediatrician', location: 'Anantapur', hospital: 'Government General Hospital (Anantapur)', rating: 4.6, experience: '9 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👩‍⚕️' },

  // Eluru
  { name: 'Dr. D. Vijaya Bhaskar', specialization: 'Cardiologist', location: 'Eluru', hospital: 'ASRAM Hospital (Eluru)', rating: 4.8, experience: '16 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. P. Leela Rani', specialization: 'General Physician', location: 'Eluru', hospital: 'District Headquarters General Hospital (Eluru)', rating: 4.7, experience: '8 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '10:30 AM', '02:30 PM', '03:30 PM'], image: '👩‍⚕️' },

  // --- ADDITIONAL SAMPLE DOCTORS COVERING ALL SPECIALIZATIONS (SAMPLE DEVELOPMENT DATA) ---
  // Visakhapatnam
  { name: 'Dr. A. Srinivas Rao', specialization: 'Oncologist', location: 'Visakhapatnam', hospital: 'Apollo Hospitals (Ramnagar)', rating: 4.9, experience: '15 years', fee: '₹900', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Snehalatha', specialization: 'Dentist', location: 'Visakhapatnam', hospital: 'Apollo Hospitals (Ramnagar)', rating: 4.8, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. Ramesh Babu', specialization: 'ENT Specialist', location: 'Visakhapatnam', hospital: 'Care Hospitals (Maharanipeta)', rating: 4.8, experience: '12 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. B. Sudha Rani', specialization: 'Nephrologist', location: 'Visakhapatnam', hospital: 'Care Hospitals (Maharanipeta)', rating: 4.9, experience: '14 years', fee: '₹750', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. P. Murali Krishna', specialization: 'General Surgeon', location: 'Visakhapatnam', hospital: 'KIMS ICON Hospital (Sheela Nagar)', rating: 4.8, experience: '16 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. V. Lavanya', specialization: 'Pediatrician', location: 'Visakhapatnam', hospital: 'KIMS ICON Hospital (Sheela Nagar)', rating: 4.7, experience: '10 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:30 AM', '03:00 PM', '05:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. K. Ravindra', specialization: 'Ophthalmologist', location: 'Visakhapatnam', hospital: 'SevenHills Hospital (Rockdale Layout)', rating: 4.8, experience: '13 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },

  // Vijayawada
  { name: 'Dr. C. H. Kiran', specialization: 'Neurologist', location: 'Vijayawada', hospital: 'Manipal Hospital (Tadepalli)', rating: 4.9, experience: '15 years', fee: '₹800', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. G. Sunitha', specialization: 'ENT Specialist', location: 'Vijayawada', hospital: 'Manipal Hospital (Tadepalli)', rating: 4.8, experience: '11 years', fee: '₹600', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. T. Venugopal', specialization: 'Oncologist', location: 'Vijayawada', hospital: 'Manipal Hospital (Tadepalli)', rating: 4.9, experience: '17 years', fee: '₹850', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. J. Ramana Murthy', specialization: 'Cardiac Surgeon', location: 'Vijayawada', hospital: 'Ramesh Hospitals (Ring Road)', rating: 4.9, experience: '18 years', fee: '₹950', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. N. Gayathri', specialization: 'Pediatrician', location: 'Vijayawada', hospital: 'Ayush Hospitals (Collector Office Road)', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '05:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. Y. Madhusudhan', specialization: 'Ophthalmologist', location: 'Vijayawada', hospital: 'Ayush Hospitals (Collector Office Road)', rating: 4.8, experience: '12 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. S. V. Krishna Reddy', specialization: 'General Surgeon', location: 'Vijayawada', hospital: 'Aayush NRI Healthcare', rating: 4.8, experience: '14 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. M. Aparna', specialization: 'Dentist', location: 'Vijayawada', hospital: 'Aayush NRI Healthcare', rating: 4.7, experience: '8 years', fee: '₹450', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },

  // Guntur
  { name: 'Dr. E. Sambasiva Rao', specialization: 'Cardiac Surgeon', location: 'Guntur', hospital: 'Ramesh Hospitals (Collector Office Road)', rating: 4.9, experience: '16 years', fee: '₹900', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. D. Vijaya Lakshmi', specialization: 'Ophthalmologist', location: 'Guntur', hospital: 'KIMS Hospitals (Nallapadu Road)', rating: 4.8, experience: '13 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. P. Sandhya', specialization: 'Gynecologist', location: 'Guntur', hospital: 'KIMS Hospitals (Nallapadu Road)', rating: 4.8, experience: '11 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. K. V. Subba Rao', specialization: 'Neurologist', location: 'Guntur', hospital: 'Lalitha Super Specialities Hospital', rating: 4.8, experience: '15 years', fee: '₹750', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. B. Harikrishna', specialization: 'Dentist', location: 'Guntur', hospital: 'Lalitha Super Specialities Hospital', rating: 4.7, experience: '9 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },

  // Tenali
  { name: 'Dr. Ch. Venkata Ramana', specialization: 'ENT Specialist', location: 'Tenali', hospital: 'Government General Hospital (Tenali)', rating: 4.7, experience: '12 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. M. Swarna Latha', specialization: 'Pediatrician', location: 'Tenali', hospital: 'Government General Hospital (Tenali)', rating: 4.6, experience: '8 years', fee: '₹400', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. P. Rajesh Varma', specialization: 'Dentist', location: 'Tenali', hospital: 'Subham Multi-Speciality Clinic (Tenali)', rating: 4.8, experience: '10 years', fee: '₹450', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. T. Geetha', specialization: 'Ophthalmologist', location: 'Tenali', hospital: 'Subham Multi-Speciality Clinic (Tenali)', rating: 4.7, experience: '9 years', fee: '₹450', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },

  // Tirupati
  { name: 'Dr. K. S. Somasekhar', specialization: 'Nephrologist', location: 'Tirupati', hospital: 'SVIMS Super Speciality Hospital', rating: 4.9, experience: '18 years', fee: '₹750', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. G. V. Subrahmanyam', specialization: 'Neurologist', location: 'Tirupati', hospital: 'SVIMS Super Speciality Hospital', rating: 4.9, experience: '17 years', fee: '₹750', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. B. Madhusudhan Rao', specialization: 'Pulmonologist', location: 'Tirupati', hospital: 'Amara Hospital (Karakambadi Road)', rating: 4.8, experience: '13 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. N. Sireesha', specialization: 'ENT Specialist', location: 'Tirupati', hospital: 'Amara Hospital (Karakambadi Road)', rating: 4.8, experience: '11 years', fee: '₹600', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. S. Tejaswi', specialization: 'Dentist', location: 'Tirupati', hospital: 'Apollo Speciality Clinic (Bhavani Nagar)', rating: 4.8, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. R. Praveen Kumar', specialization: 'Ophthalmologist', location: 'Tirupati', hospital: 'Apollo Speciality Clinic (Bhavani Nagar)', rating: 4.7, experience: '10 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },

  // Nellore
  { name: 'Dr. K. Padmavathi', specialization: 'Gynecologist', location: 'Nellore', hospital: 'Medicover Hospitals (Nellore)', rating: 4.8, experience: '14 years', fee: '₹650', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. V. Prabhakar', specialization: 'ENT Specialist', location: 'Nellore', hospital: 'Medicover Hospitals (Nellore)', rating: 4.7, experience: '12 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. M. Deepa', specialization: 'Dentist', location: 'Nellore', hospital: 'Simhapuri Hospitals (Nellore)', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. A. Srinivasulu', specialization: 'Ophthalmologist', location: 'Nellore', hospital: 'Simhapuri Hospitals (Nellore)', rating: 4.8, experience: '11 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },

  // Kakinada
  { name: 'Dr. P. Surya Prakasa Rao', specialization: 'ENT Specialist', location: 'Kakinada', hospital: 'Medicover Hospitals (Bhanugudi)', rating: 4.8, experience: '13 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. G. Radha Krishna', specialization: 'Pulmonologist', location: 'Kakinada', hospital: 'Medicover Hospitals (Bhanugudi)', rating: 4.8, experience: '14 years', fee: '₹650', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. Ch. Anusha', specialization: 'Dentist', location: 'Kakinada', hospital: 'Apollo Speciality Clinic (Main Road)', rating: 4.7, experience: '8 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. K. Phanindra', specialization: 'Ophthalmologist', location: 'Kakinada', hospital: 'Apollo Speciality Clinic (Main Road)', rating: 4.7, experience: '10 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },

  // Rajahmundry
  { name: 'Dr. S. Satya Murthy', specialization: 'Oncologist', location: 'Rajahmundry', hospital: 'GSL General Hospital (NH-16)', rating: 4.9, experience: '16 years', fee: '₹800', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. N. V. Ramanjaneyulu', specialization: 'ENT Specialist', location: 'Rajahmundry', hospital: 'GSL General Hospital (NH-16)', rating: 4.8, experience: '12 years', fee: '₹600', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. B. Sireesha', specialization: 'Dentist', location: 'Rajahmundry', hospital: 'GSL General Hospital (NH-16)', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. T. Uma Devi', specialization: 'Gynecologist', location: 'Rajahmundry', hospital: 'Sai Multi-Speciality Hospital', rating: 4.8, experience: '13 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. K. Srimannarayana', specialization: 'Ophthalmologist', location: 'Rajahmundry', hospital: 'Sai Multi-Speciality Hospital', rating: 4.7, experience: '11 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },

  // Ongole
  { name: 'Dr. Ch. Narayana Swamy', specialization: 'ENT Specialist', location: 'Ongole', hospital: 'RIMS General Hospital (Ongole)', rating: 4.7, experience: '11 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. P. Sujatha', specialization: 'Ophthalmologist', location: 'Ongole', hospital: 'RIMS General Hospital (Ongole)', rating: 4.7, experience: '10 years', fee: '₹400', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. G. Ravi Chandra', specialization: 'Dentist', location: 'Ongole', hospital: 'Sanghamitra Hospital (Ongole)', rating: 4.8, experience: '10 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. M. Lakshmi Prasanna', specialization: 'Gynecologist', location: 'Ongole', hospital: 'Sanghamitra Hospital (Ongole)', rating: 4.8, experience: '12 years', fee: '₹550', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },

  // Kurnool
  { name: 'Dr. T. Madhava Rao', specialization: 'Nephrologist', location: 'Kurnool', hospital: 'KIMS Hospitals (Joharapuram Road)', rating: 4.8, experience: '15 years', fee: '₹700', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. P. Seshadri', specialization: 'ENT Specialist', location: 'Kurnool', hospital: 'KIMS Hospitals (Joharapuram Road)', rating: 4.8, experience: '12 years', fee: '₹600', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. C. Bharathi', specialization: 'Dentist', location: 'Kurnool', hospital: 'Medicover Hospitals (Sampath Nagar)', rating: 4.7, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. K. Jagadeesh', specialization: 'Ophthalmologist', location: 'Kurnool', hospital: 'Medicover Hospitals (Sampath Nagar)', rating: 4.7, experience: '10 years', fee: '₹500', availableDays: 'Mon - Fri', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. R. Sumathi', specialization: 'Gynecologist', location: 'Kurnool', hospital: 'Medicover Hospitals (Sampath Nagar)', rating: 4.8, experience: '13 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Kadapa
  { name: 'Dr. Y. Obul Reddy', specialization: 'General Surgeon', location: 'Kadapa', hospital: 'RIMS General Hospital (Kadapa)', rating: 4.8, experience: '16 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. B. Nagendra', specialization: 'ENT Specialist', location: 'Kadapa', hospital: 'RIMS General Hospital (Kadapa)', rating: 4.7, experience: '11 years', fee: '₹400', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Pushpavathi', specialization: 'Ophthalmologist', location: 'Kadapa', hospital: 'RIMS General Hospital (Kadapa)', rating: 4.7, experience: '10 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. S. Harish', specialization: 'Dentist', location: 'Kadapa', hospital: 'Tirumala Multi-Speciality Hospital (Kadapa)', rating: 4.8, experience: '9 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. N. Sarada', specialization: 'Gynecologist', location: 'Kadapa', hospital: 'Tirumala Multi-Speciality Hospital (Kadapa)', rating: 4.8, experience: '12 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Anantapur
  { name: 'Dr. M. V. Ramana', specialization: 'Pulmonologist', location: 'Anantapur', hospital: 'Saveera Hospital (Anantapur)', rating: 4.8, experience: '13 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. G. Vijaya Bhaskar', specialization: 'ENT Specialist', location: 'Anantapur', hospital: 'Saveera Hospital (Anantapur)', rating: 4.7, experience: '11 years', fee: '₹550', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Hima Bindu', specialization: 'Dentist', location: 'Anantapur', hospital: 'Saveera Hospital (Anantapur)', rating: 4.8, experience: '10 years', fee: '₹500', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. T. Sreeramulu', specialization: 'Ophthalmologist', location: 'Anantapur', hospital: 'Government General Hospital (Anantapur)', rating: 4.6, experience: '10 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. V. Kalyani', specialization: 'Gynecologist', location: 'Anantapur', hospital: 'Government General Hospital (Anantapur)', rating: 4.7, experience: '11 years', fee: '₹400', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },

  // Eluru
  { name: 'Dr. D. Venkatarathnam', specialization: 'ENT Specialist', location: 'Eluru', hospital: 'District Headquarters General Hospital (Eluru)', rating: 4.7, experience: '12 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. S. Nirmala', specialization: 'Ophthalmologist', location: 'Eluru', hospital: 'District Headquarters General Hospital (Eluru)', rating: 4.7, experience: '9 years', fee: '₹400', availableDays: 'Mon - Fri', timeSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM'], image: '👩‍⚕️' },
  { name: 'Dr. P. Srinivas', specialization: 'Dentist', location: 'Eluru', hospital: 'District Headquarters General Hospital (Eluru)', rating: 4.6, experience: '8 years', fee: '₹400', availableDays: 'Mon - Sat', timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
  { name: 'Dr. K. Sobha Rani', specialization: 'Gynecologist', location: 'Eluru', hospital: 'ASRAM Hospital (Eluru)', rating: 4.8, experience: '14 years', fee: '₹600', availableDays: 'Mon - Sat', timeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'], image: '👩‍⚕️' },
  { name: 'Dr. M. Suresh Babu', specialization: 'Pulmonologist', location: 'Eluru', hospital: 'ASRAM Hospital (Eluru)', rating: 4.8, experience: '13 years', fee: '₹650', availableDays: 'Mon - Fri', timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'], image: '👨‍⚕️' },
  { name: 'Dr. G. Venkateswara Rao', specialization: 'Nephrologist', location: 'Eluru', hospital: 'ASRAM Hospital (Eluru)', rating: 4.9, experience: '16 years', fee: '₹750', availableDays: 'Mon - Sat', timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '04:30 PM'], image: '👨‍⚕️' },
];

import { additionalHospitalsData, additionalDoctorsData } from './expandedHospitalsAndDoctors.js';

export const allHospitalsData = [...hospitalsData, ...additionalHospitalsData];
export const allDoctorsData = [...doctorsData, ...additionalDoctorsData];

/**
 * Main seeding function for MongoDB
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting MongoDB database seeding (database: smart_healthcare)...');

    // 1. Seed Locations
    const locMap = {};
    for (const loc of apLocationsData) {
      let existing = await Location.findOne({ name: loc.name });
      if (!existing) {
        existing = await Location.create(loc);
      }
      locMap[loc.name] = existing;
    }
    console.log(`✅ Seeded/Verified ${apLocationsData.length} Andhra Pradesh locations in MongoDB`);

    // 2. Seed Hospitals with Location references (aiming for 10-15 hospitals per location)
    const hospMap = {};
    let newHospCount = 0;
    for (const hosp of allHospitalsData) {
      const locDoc = locMap[hosp.location_name];
      let existing = await Hospital.findOne({ name: hosp.name });
      if (!existing && /chinaka[kl]ani/i.test(hosp.name)) {
        existing = await Hospital.findOne({ name: /NRI General Hospital.*chinaka[kl]ani/i });
        if (existing) {
          existing.name = hosp.name;
          existing.specialties = hosp.specialties;
          await existing.save();
          await Doctor.updateMany({ hospital: existing._id }, { hospitalName: hosp.name });
        }
      }
      if (!existing) {
        existing = await Hospital.create({
          name: hosp.name,
          location: locDoc?._id,
          locationName: hosp.location_name,
          city: hosp.city,
          address: hosp.address,
          phone: hosp.phone,
          rating: hosp.rating,
          specialties: hosp.specialties,
          isSample: hosp.isSample || hosp.name.startsWith('[Sample]') || false,
        });
        newHospCount++;
      } else if (existing.isSample === undefined && (hosp.isSample || hosp.name.startsWith('[Sample]'))) {
        existing.isSample = true;
        await existing.save();
      }
      hospMap[hosp.name] = existing;
    }
    console.log(`✅ Seeded/Verified ${allHospitalsData.length} Andhra Pradesh hospitals in MongoDB (New hospitals added: ${newHospCount})`);

    // 3. Seed Doctors with Location & Hospital references (idempotent, never duplicates or deletes)
    let addedCount = 0;
    for (const doc of allDoctorsData) {
      const locDoc = locMap[doc.location];
      const hospDoc = hospMap[doc.hospital];
      const existing = await Doctor.findOne({ name: doc.name, hospitalName: doc.hospital });
      if (!existing && hospDoc && locDoc) {
        await Doctor.create({
          name: doc.name,
          specialization: doc.specialization,
          location: locDoc._id,
          locationName: doc.location,
          hospital: hospDoc._id,
          hospitalName: doc.hospital,
          rating: doc.rating,
          experience: doc.experience,
          fee: doc.fee,
          availableDays: doc.availableDays,
          timeSlots: doc.timeSlots,
          image: doc.image,
          isSample: doc.isSample || doc.name.includes('[Sample]') || false,
        });
        addedCount++;
      }
    }
    console.log(`✅ Seeded/Verified base doctors across AP in MongoDB (New doctors added: ${addedCount})`);

    // 4. Ensure EVERY hospital has at least 5 matching doctors per specialization offered
    const doctorPoolNames = [
      'V. Ananda Rao', 'Rajesh Kumar', 'K. Radhakrishna', 'T. Muralidhar', 'S. Bhaskar Rao',
      'P. V. Ramana', 'M. Sudhakar', 'N. Srinivas', 'G. Venkat Reddy', 'Ch. Subba Rao',
      'B. Satyanarayana', 'A. Suresh', 'K. Madhav', 'D. Prasad Varma', 'R. Sitaram',
      'Sunitha Reddy', 'Padmavathi', 'Kavitha Devi', 'Anuradha Rao', 'Sujatha Kumari',
      'Swathi Naidu', 'Lakshmi Prasanna', 'Sandhya Rani', 'Aparna Devi', 'Geetha Varma'
    ];
    const poolInitials = ['A.', 'B.', 'C.', 'D.', 'E.', 'G.', 'K.', 'M.', 'N.', 'P.', 'R.', 'S.', 'T.', 'V.', 'Y.'];

    const specNormalize = {
      'Cardiology': 'Cardiologist',
      'Cardiologist': 'Cardiologist',
      'Neurology': 'Neurologist',
      'Neurologist': 'Neurologist',
      'Oncology': 'Oncologist',
      'Oncologist': 'Oncologist',
      'Nephrology': 'Nephrologist',
      'Nephrologist': 'Nephrologist',
      'General Medicine': 'General Physician',
      'General Physician': 'General Physician',
      'Orthopedics': 'Orthopedic',
      'Orthopedic': 'Orthopedic',
      'Pediatrics': 'Pediatrician',
      'Pediatrician': 'Pediatrician',
      'Dermatology': 'Dermatologist',
      'Dermatologist': 'Dermatologist',
      'ENT': 'ENT Specialist',
      'ENT Specialist': 'ENT Specialist',
      'Ophthalmology': 'Ophthalmologist',
      'Ophthalmologist': 'Ophthalmologist',
      'Dentistry': 'Dentist',
      'Dentist': 'Dentist',
      'Gynecology': 'Gynecologist',
      'Gynecologist': 'Gynecologist',
      'Pulmonology': 'Pulmonologist',
      'Pulmonologist': 'Pulmonologist',
      'General Surgery': 'General Surgeon',
      'Cardiac Surgery': 'Cardiac Surgeon',
    };

    let sampleDocsAdded = 0;
    let hospIdx = 0;
    for (const [hospName, hospDoc] of Object.entries(hospMap)) {
      hospIdx++;
      const locDoc = await Location.findById(hospDoc.location);
      if (!locDoc) continue;

      // Extract specialties and convert to standard practitioner titles
      let rawSpecs = (hospDoc.specialties || []).map(s => specNormalize[s] || s).filter(Boolean);
      if (rawSpecs.length < 2) {
        rawSpecs = Array.from(new Set([...rawSpecs, 'General Physician', 'Pediatrician', 'Cardiologist']));
      }
      const uniqueSpecs = Array.from(new Set(rawSpecs));

      let specIdx = 0;
      for (const spec of uniqueSpecs) {
        specIdx++;
        const currentCount = await Doctor.countDocuments({
          hospital: hospDoc._id,
          specialization: spec,
        });

        // Ensure at least 5 matching doctors for this specialization at this hospital
        if (currentCount < 5) {
          const needed = 5 - currentCount;
          for (let i = 0; i < needed; i++) {
            const seedNum = currentCount + i + 1;
            const initChar = poolInitials[(hospIdx * 3 + specIdx * 5 + seedNum) % poolInitials.length];
            const nameBase = doctorPoolNames[(hospIdx * 7 + specIdx * 3 + seedNum) % doctorPoolNames.length];
            const docName = `Dr. [Sample] ${initChar} ${nameBase}`;

            // Check if exact doctor name already exists at this hospital
            const docExists = await Doctor.findOne({ hospital: hospDoc._id, name: docName });
            if (!docExists) {
              await Doctor.create({
                name: docName,
                specialization: spec,
                location: locDoc._id,
                locationName: locDoc.name,
                hospital: hospDoc._id,
                hospitalName: hospDoc.name,
                rating: Number((4.6 + ((hospIdx + seedNum) % 4) * 0.1).toFixed(1)),
                experience: `${8 + ((hospIdx + seedNum * 2) % 15)} years`,
                fee: `₹${450 + ((hospIdx + seedNum) % 5) * 50}`,
                availableDays: seedNum % 2 === 0 ? 'Mon - Sat' : 'Mon - Fri',
                timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
                image: seedNum % 2 === 0 ? '👨‍⚕️' : '👩‍⚕️',
                isSample: true,
              });
              sampleDocsAdded++;
            }
          }
        }
      }

      // Synchronize hospital specialties with all distinct doctor specializations
      const distinctSpecs = await Doctor.distinct('specialization', { hospital: hospDoc._id });
      if (distinctSpecs && distinctSpecs.length > 0) {
        await Hospital.findByIdAndUpdate(hospDoc._id, { specialties: distinctSpecs });
      }
    }
    console.log(`✅ Guaranteed 5+ doctors per specialization across all 156 hospitals (Sample doctors added: ${sampleDocsAdded})`);

    // 4. Seed Default Demo User
    let demoUser = await User.findOne({ email: 'patient@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        fullName: 'Ravi Kumar',
        email: 'patient@example.com',
        password: 'password123',
        phone: '9876543210',
        role: 'patient',
      });
      console.log('✅ Seeded demo user: patient@example.com / password123 in MongoDB');
    } else {
      console.log('ℹ️ Demo user patient@example.com already exists.');
    }

    // 5. Seed Sample Appointment with full relationships
    const sampleDoc = await Doctor.findOne({ name: 'Dr. Rajesh Kumar' });
    const sampleLoc = locMap['Visakhapatnam'];
    const sampleHosp = hospMap['Apollo Hospitals (Ramnagar)'];

    const existingAppointment = await Appointment.findOne({
      patientEmail: 'patient@example.com',
      doctorName: 'Dr. Rajesh Kumar',
    });

    if (!existingAppointment && sampleDoc && demoUser) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await Appointment.create({
        user: demoUser._id,
        location: sampleLoc?._id,
        locationName: 'Visakhapatnam, AP',
        hospital: sampleHosp?._id,
        hospitalName: 'Apollo Hospitals (Ramnagar)',
        doctor: sampleDoc._id,
        doctorName: sampleDoc.name,
        appointmentDate: tomorrowStr,
        appointmentTime: '10:00 AM',
        patientName: demoUser.fullName,
        patientPhone: demoUser.phone || '9876543210',
        patientEmail: demoUser.email,
        specialization: sampleDoc.specialization,
        fee: sampleDoc.fee,
        age: 32,
        gender: 'Male',
        height: 175,
        weight: 70,
        bloodPressure: '120/80',
        reason: 'Regular Health Checkup & Consultation',
        status: 'Confirmed',
      });
      console.log('✅ Seeded sample appointment with full relational model in MongoDB');
    }

    console.log('✨ MongoDB database seeding completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB Seeding error:', error);
  }
};

// If run directly via node seed/seedData.js or npm run seed
if (process.argv[1] && process.argv[1].includes('seedData.js')) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('🎉 Seeding finished. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to run seed script:', err);
      process.exit(1);
    });
}

export default seedDatabase;
