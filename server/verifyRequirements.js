import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';
const MONGO_URI = 'mongodb://127.0.0.1:27017/smart_healthcare';

async function testAllRequirements() {
  console.log('====================================================');
  console.log('SMART HEALTHCARE: MONGODB & FRONTEND API VERIFICATION');
  console.log('====================================================\n');

  // Connect directly to MongoDB to cross-verify database documents
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const results = {};

  // FEATURE 1: Fetch Andhra Pradesh locations from MongoDB
  try {
    const res = await fetch(`${BASE_URL}/locations`);
    const data = await res.json();
    const mongoCount = await db.collection('locations').countDocuments();
    const isAP = data.data.every(l => l.state === 'Andhra Pradesh');
    if (res.ok && data.success && data.count === mongoCount && isAP && data.count >= 13) {
      results['Feature 1: Fetch Andhra Pradesh locations from MongoDB'] = {
        status: 'PASS',
        details: `Fetched ${data.count} AP locations from MongoDB (matching locations collection count: ${mongoCount}).`,
      };
    } else {
      results['Feature 1: Fetch Andhra Pradesh locations from MongoDB'] = {
        status: 'FAIL',
        details: `Mismatch: API count ${data.count}, MongoDB count ${mongoCount}.`,
      };
    }
  } catch (err) {
    results['Feature 1: Fetch Andhra Pradesh locations from MongoDB'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 2: Filter hospitals by selected location
  try {
    const targetLoc = 'Guntur';
    const res = await fetch(`${BASE_URL}/hospitals?location=${encodeURIComponent(targetLoc)}`);
    const data = await res.json();
    const mongoHospitals = await db.collection('hospitals').find({ locationName: targetLoc }).toArray();
    const matchesAll = data.data.length === mongoHospitals.length && data.data.length > 0;
    if (res.ok && data.success && matchesAll) {
      results['Feature 2: Filter hospitals by selected location'] = {
        status: 'PASS',
        details: `Filtered hospitals for location '${targetLoc}': Found ${data.count} hospitals in MongoDB: [${data.data.map(h => h.name).join(', ')}].`,
      };
    } else {
      results['Feature 2: Filter hospitals by selected location'] = {
        status: 'FAIL',
        details: `Expected ${mongoHospitals.length} hospitals for ${targetLoc}, got ${data.data?.length}.`,
      };
    }
  } catch (err) {
    results['Feature 2: Filter hospitals by selected location'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 3: Filter doctors by selected hospital
  try {
    const targetHosp = 'KIMS Hospitals (Nallapadu Road)';
    const res = await fetch(`${BASE_URL}/doctors?hospital=${encodeURIComponent(targetHosp)}`);
    const data = await res.json();
    const mongoDocs = await db.collection('doctors').find({ hospitalName: targetHosp }).toArray();
    if (res.ok && data.success && data.count === mongoDocs.length && data.count > 0) {
      results['Feature 3: Filter doctors by selected hospital'] = {
        status: 'PASS',
        details: `Filtered doctors for '${targetHosp}': Found ${data.count} doctor(s): [${data.data.map(d => `${d.name} (${d.specialization})`).join(', ')}].`,
      };
    } else {
      results['Feature 3: Filter doctors by selected hospital'] = {
        status: 'FAIL',
        details: `Expected ${mongoDocs.length} doctors, got ${data.data?.length}.`,
      };
    }
  } catch (err) {
    results['Feature 3: Filter doctors by selected hospital'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 4: Register and log in using the backend
  let token = null;
  let testUser = null;
  try {
    const uniqueEmail = `test_verification_${Date.now()}@example.com`;
    // Register
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Verification User',
        email: uniqueEmail,
        password: 'password123',
        phone: '9876543210',
      }),
    });
    const regData = await regRes.json();

    // Verify stored in MongoDB users collection
    const userInDb = await db.collection('users').findOne({ email: uniqueEmail });

    // Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    testUser = loginData.user;

    if (regRes.ok && userInDb && loginRes.ok && token) {
      results['Feature 4: Register and log in using the backend'] = {
        status: 'PASS',
        details: `Registered '${uniqueEmail}', confirmed document in 'users' collection (ID: ${userInDb._id}), and logged in receiving valid JWT token.`,
      };
    } else {
      results['Feature 4: Register and log in using the backend'] = {
        status: 'FAIL',
        details: `Registration or Login failed: ${regData.message || loginData.message}`,
      };
    }
  } catch (err) {
    results['Feature 4: Register and log in using the backend'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 5: Book an appointment and verify that it is saved in MongoDB
  let bookedAptId = null;
  const randDay5 = 10 + Math.floor(Math.random() * 18);
  const randHour5 = 1 + Math.floor(Math.random() * 8);
  const testAptDate = `2027-02-${String(randDay5).padStart(2, '0')}`;
  const testAptTime = `0${randHour5}:30 PM`;
  const testDoctor = 'Dr. Rajesh Kumar';
  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: 'Visakhapatnam, AP',
        hospital: 'Apollo Hospitals (Ramnagar)',
        doctor: testDoctor,
        date: testAptDate,
        time: testAptTime,
        patientName: 'Test Patient',
        patientPhone: '9876543210',
        patientEmail: testUser?.email,
        reason: 'Verification Consultation',
        fee: '₹700',
        age: 35,
        gender: 'Male',
      }),
    });
    const data = await res.json();
    bookedAptId = data.data?._id || data.data?.id;

    // Check directly in MongoDB appointments collection
    const aptInDb = await db.collection('appointments').findOne({ _id: new mongoose.Types.ObjectId(bookedAptId) });

    if (res.ok && data.success && aptInDb && aptInDb.status === 'Confirmed') {
      results['Feature 5: Book an appointment and verify that it is saved in MongoDB'] = {
        status: 'PASS',
        details: `Appointment booked via API and verified in MongoDB 'appointments' collection (ID: ${aptInDb._id}, Doctor: ${aptInDb.doctorName}, Date: ${aptInDb.appointmentDate}, Time: ${aptInDb.appointmentTime}, Status: ${aptInDb.status}).`,
      };
    } else {
      results['Feature 5: Book an appointment and verify that it is saved in MongoDB'] = {
        status: 'FAIL',
        details: `Failed to book or find appointment in MongoDB: ${data.message}`,
      };
    }
  } catch (err) {
    results['Feature 5: Book an appointment and verify that it is saved in MongoDB'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 6: Fetch the user's appointments
  try {
    const res = await fetch(`${BASE_URL}/appointments?email=${encodeURIComponent(testUser?.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const hasApt = data.data?.some(a => (a._id || a.id).toString() === bookedAptId.toString());

    if (res.ok && data.success && hasApt) {
      results['Feature 6: Fetch the user\'s appointments'] = {
        status: 'PASS',
        details: `Fetched user appointments via GET /api/appointments; successfully returned booked appointment ID ${bookedAptId}.`,
      };
    } else {
      results['Feature 6: Fetch the user\'s appointments'] = {
        status: 'FAIL',
        details: `Failed to fetch appointments: ${data.message || 'Booked appointment missing from list'}`,
      };
    }
  } catch (err) {
    results['Feature 6: Fetch the user\'s appointments'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 7: Cancel an appointment and verify the updated status
  try {
    const res = await fetch(`${BASE_URL}/appointments/${bookedAptId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    // Verify updated status in MongoDB
    const updatedInDb = await db.collection('appointments').findOne({ _id: new mongoose.Types.ObjectId(bookedAptId) });

    if (res.ok && data.success && updatedInDb && updatedInDb.status === 'Cancelled') {
      results['Feature 7: Cancel an appointment and verify the updated status'] = {
        status: 'PASS',
        details: `Cancelled appointment ID ${bookedAptId}; verified in MongoDB that status is now '${updatedInDb.status}'.`,
      };
    } else {
      results['Feature 7: Cancel an appointment and verify the updated status'] = {
        status: 'FAIL',
        details: `Cancellation failed or MongoDB status not updated: ${data.message}`,
      };
    }
  } catch (err) {
    results['Feature 7: Cancel an appointment and verify the updated status'] = { status: 'FAIL', details: err.message };
  }

  // FEATURE 8: Prevent duplicate bookings for the same doctor, date and time
  try {
    // 1. Create a confirmed booking with a fresh date/time slot
    const randomDay = 10 + Math.floor(Math.random() * 18);
    const randomHour = 1 + Math.floor(Math.random() * 8);
    const dupDate = `2027-01-${String(randomDay).padStart(2, '0')}`;
    const dupTime = `0${randomHour}:00 AM`;
    const dupDoc = 'Dr. Rajesh Kumar';

    const book1 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: 'Visakhapatnam, AP',
        hospital: 'Apollo Hospitals (Ramnagar)',
        doctor: dupDoc,
        date: dupDate,
        time: dupTime,
        patientName: 'Patient One',
        patientPhone: '9876543210',
        patientEmail: testUser?.email,
      }),
    });
    const book1Data = await book1.json();

    // 2. Attempt duplicate booking for the SAME doctor, date, and time
    const book2 = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: 'Visakhapatnam, AP',
        hospital: 'Apollo Hospitals (Ramnagar)',
        doctor: dupDoc,
        date: dupDate,
        time: dupTime,
        patientName: 'Patient Two (Duplicate Attempt)',
        patientPhone: '9876543211',
        patientEmail: 'patient2@example.com',
      }),
    });
    const book2Data = await book2.json();

    if (book1.ok && book2.status === 409 && book2Data.success === false) {
      results['Feature 8: Prevent duplicate bookings for the same doctor, date and time'] = {
        status: 'PASS',
        details: `Initial booking succeeded (ID: ${book1Data.data?.id}); duplicate attempt was strictly blocked with HTTP 409 Conflict: "${book2Data.message}".`,
      };
    } else {
      results['Feature 8: Prevent duplicate bookings for the same doctor, date and time'] = {
        status: 'FAIL',
        details: `Duplicate booking was not blocked as expected: HTTP ${book2.status}, ${book2Data.message}`,
      };
    }
  } catch (err) {
    results['Feature 8: Prevent duplicate bookings for the same doctor, date and time'] = { status: 'FAIL', details: err.message };
  }

  await mongoose.disconnect();

  console.log('\n--- VERIFICATION REPORT SUMMARY ---');
  for (const [feat, res] of Object.entries(results)) {
    console.log(`\n[${res.status}] ${feat}`);
    console.log(`  > ${res.details}`);
  }
}

testAllRequirements().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
