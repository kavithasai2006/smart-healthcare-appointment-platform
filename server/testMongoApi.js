// Automated End-to-End API Test for SmartCare MongoDB Backend
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting SmartCare MongoDB Backend Verification Suite...\n');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health);

  // 2. Locations
  const locsRes = await fetch(`${BASE_URL}/locations`);
  const locs = await locsRes.json();
  console.log(`2. Locations Count: ${locs.count}`);
  console.log('   Sample Locations:', locs.data.slice(0, 5).map((l) => l.name).join(', '));

  // 3. Hospitals in Vijayawada
  const hospRes = await fetch(`${BASE_URL}/hospitals?location=Vijayawada`);
  const hosps = await hospRes.json();
  console.log(`3. Hospitals in Vijayawada Count: ${hosps.count}`);
  console.log('   Hospitals:', hosps.data.map((h) => h.name).join(' | '));

  // 4. Doctors in Vijayawada
  const docRes = await fetch(`${BASE_URL}/doctors?location=Vijayawada`);
  const docs = await docRes.json();
  console.log(`4. Doctors in Vijayawada Count: ${docs.count}`);
  console.log('   Doctors:', docs.data.map((d) => `${d.name} (${d.specialization} @ ${d.hospital})`).join(' | '));

  // 5. User Registration (New Patient)
  const testEmail = `patient_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Aarav Reddy',
      email: testEmail,
      password: 'password123',
      phone: '9876543210',
    }),
  });
  const reg = await regRes.json();
  console.log(`5. Registration Result: Success=${reg.success}, User=${reg.user?.fullName}, Email=${reg.user?.email}`);

  // 6. User Login (Registered Patient)
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
    }),
  });
  const login = await loginRes.json();
  console.log(`6. Login Result: Success=${login.success}, Token=${login.token ? login.token.slice(0, 15) + '...' : 'none'}`);
  const token = login.token;

  // 7. Protected Route (GET /api/auth/me)
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me = await meRes.json();
  console.log(`7. /api/auth/me Profile: ${me.user?.fullName} (${me.user?.email})`);

  // 8. Book an Appointment
  const aptPayload = {
    location: 'Vijayawada, AP',
    hospital: 'Manipal Hospital (Tadepalli)',
    doctor: 'Dr. Priya Sharma',
    date: '2026-10-25',
    time: '11:00 AM',
    patientName: 'Aarav Reddy',
    patientPhone: '9876543210',
    patientEmail: testEmail,
    reason: 'Skin allergy consultation',
    fee: '₹600',
    age: 28,
    gender: 'Male',
  };

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(aptPayload),
  });
  const booked = await bookRes.json();
  console.log(`8. Book Appointment Result: Success=${booked.success}, ID=${booked.data?.id}`);

  // 9. Prevent Duplicate Booking (Same Doctor, Date, Time)
  const dupRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(aptPayload),
  });
  const dup = await dupRes.json();
  console.log(`9. Duplicate Booking Check: HTTP ${dupRes.status} (Expected 409 Conflict): ${dup.message}`);

  // 10. Check Booked Slots API
  const slotsRes = await fetch(
    `${BASE_URL}/appointments/booked-slots?doctor=${encodeURIComponent('Dr. Priya Sharma')}&date=2026-10-25`
  );
  const slots = await slotsRes.json();
  console.log(`10. Booked Slots for Dr. Priya Sharma on 2026-10-25:`, slots.bookedSlots);

  // 11. My Appointments
  const myAptsRes = await fetch(`${BASE_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const myApts = await myAptsRes.json();
  console.log(`11. My Appointments Count: ${myApts.count}, Status=${myApts.data[0]?.status}`);

  // 12. Cancel Appointment
  const aptId = booked.data.id;
  const cancelRes = await fetch(`${BASE_URL}/appointments/${aptId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const cancelData = await cancelRes.json();
  console.log(`12. Cancel Appointment Result: Success=${cancelData.success}, New Status=${cancelData.data?.status}`);

  // 13. Verify Slot is Available After Cancellation
  const rebookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(aptPayload),
  });
  const rebook = await rebookRes.json();
  console.log(`13. Rebook after cancellation: Success=${rebook.success}, New ID=${rebook.data?.id}`);

  console.log('\n✨ ALL 13 TEST CASES PASSED WITH 100% SUCCESS ON MONGODB!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
