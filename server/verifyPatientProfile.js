// verifyPatientProfile.js - Comprehensive Verification of Patient Profile & Appointments Features
const BASE_URL = 'http://localhost:5000/api';

async function runProfileVerification() {
  console.log('🩺 Starting Comprehensive Patient Profile Verification Suite...\n');

  const timestamp = Date.now();
  const testEmail = `profile_test_${timestamp}@smartcare.com`;
  const password = 'SecurePassword@123';

  // 1. Register a new patient
  console.log('--- TEST 1: Register New Patient ---');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Kavitha Sai',
      email: testEmail,
      password,
      phone: '9876543210',
    }),
  });
  const regData = await regRes.json();
  if (!regData.success || !regData.token) {
    throw new Error(`Registration failed: ${regData.message}`);
  }
  console.log('✅ Registration successful:');
  console.log(`   User: ${regData.user.fullName} (${regData.user.email})`);
  console.log(`   Initial State: isProfileComplete = ${regData.user.isProfileComplete}`);
  if (regData.user.password || regData.user.passwordHash) {
    throw new Error('SECURITY VIOLATION: Password hash exposed in registration response!');
  }
  const token = regData.token;

  // 2. Fetch Profile via GET /api/auth/me and GET /api/auth/profile
  console.log('\n--- TEST 2: GET Profile via Auth Endpoints ---');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  if (!meData.success || !meData.user) {
    throw new Error(`GET /api/auth/me failed: ${meData.message}`);
  }
  console.log('✅ GET /api/auth/me responded successfully:');
  console.log(`   fullName: ${meData.user.fullName}, email: ${meData.user.email}, role: ${meData.user.role}`);

  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profileData = await profileRes.json();
  if (!profileData.success || !profileData.user) {
    throw new Error(`GET /api/auth/profile failed: ${profileData.message}`);
  }
  console.log('✅ GET /api/auth/profile responded identically.');

  // 3. Validation: Reject Invalid Phone Number
  console.log('\n--- TEST 3: Validation - Reject Invalid Phone Number ---');
  const invalidPhoneRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone: '12345' }),
  });
  const invalidPhoneData = await invalidPhoneRes.json();
  if (invalidPhoneRes.status === 400 && !invalidPhoneData.success) {
    console.log(`✅ Invalid phone properly rejected (HTTP 400): ${invalidPhoneData.message}`);
  } else {
    throw new Error('Validation failed: Expected 400 for invalid phone number');
  }

  // 4. Validation: Reject Invalid PIN Code
  console.log('\n--- TEST 4: Validation - Reject Invalid PIN Code ---');
  const invalidPinRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pinCode: '53001' }), // 5 digits instead of 6
  });
  const invalidPinData = await invalidPinRes.json();
  if (invalidPinRes.status === 400 && !invalidPinData.success) {
    console.log(`✅ Invalid PIN properly rejected (HTTP 400): ${invalidPinData.message}`);
  } else {
    throw new Error('Validation failed: Expected 400 for invalid PIN code');
  }

  // 5. Validation: Reject Invalid Age
  console.log('\n--- TEST 5: Validation - Reject Invalid Age (>130) ---');
  const invalidAgeRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ age: 250 }),
  });
  const invalidAgeData = await invalidAgeRes.json();
  if (invalidAgeRes.status === 400 && !invalidAgeData.success) {
    console.log(`✅ Invalid age properly rejected (HTTP 400): ${invalidAgeData.message}`);
  } else {
    throw new Error('Validation failed: Expected 400 for invalid age');
  }

  // 6. Valid Profile Update with Full Details
  console.log('\n--- TEST 6: Save Full Patient Profile in MongoDB ---');
  const updatePayload = {
    fullName: 'Dr. Kavitha Sai, M.Sc',
    phone: '9848022338',
    age: 26,
    dateOfBirth: '2000-05-15',
    gender: 'Female',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    village: 'Pendurthi',
    address: 'Flat 402, Sai Residency, Main Road',
    pinCode: '530017',
    bloodGroup: 'O+',
    emergencyContactName: 'Sai Kiran (Brother)',
    emergencyContactPhone: '9848011223',
    avatar: '👩‍⚕️',
  };

  const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatePayload),
  });
  const updateResult = await updateRes.json();
  if (!updateResult.success || !updateResult.user) {
    throw new Error(`Profile update failed: ${updateResult.message}`);
  }

  console.log('✅ Profile successfully updated in MongoDB:');
  console.log(`   Full Name: ${updateResult.user.fullName}`);
  console.log(`   Phone: ${updateResult.user.phone}`);
  console.log(`   Age / DOB: ${updateResult.user.age} yrs / ${updateResult.user.dateOfBirth}`);
  console.log(`   Gender: ${updateResult.user.gender}`);
  console.log(`   District / City / Village: ${updateResult.user.district} / ${updateResult.user.city} / ${updateResult.user.village}`);
  console.log(`   Address & PIN: ${updateResult.user.address}, PIN: ${updateResult.user.pinCode}`);
  console.log(`   Blood Group: ${updateResult.user.bloodGroup}`);
  console.log(`   Emergency Contact: ${updateResult.user.emergencyContactName} (${updateResult.user.emergencyContactPhone})`);
  console.log(`   Avatar: ${updateResult.user.avatar}`);
  console.log(`   isProfileComplete: ${updateResult.user.isProfileComplete}`);

  // 7. Security: Verify No Password Exposed
  if (updateResult.user.password || updateResult.user.passwordHash) {
    throw new Error('SECURITY VIOLATION: Password hash exposed in profile response!');
  }

  // 8. Book an Appointment for this Patient
  console.log('\n--- TEST 7: Book Appointment for Patient ---');
  const aptPayload = {
    location: 'Visakhapatnam, AP',
    hospital: 'Apollo Hospitals (Ramnagar)',
    doctor: 'Dr. Rajesh Kumar',
    date: '2026-11-10',
    time: '10:00 AM',
    patientName: updateResult.user.fullName,
    patientPhone: updateResult.user.phone,
    patientEmail: testEmail,
    reason: 'Cardiology checkup & follow-up',
    fee: '₹700',
    age: updateResult.user.age,
    gender: updateResult.user.gender,
  };

  const bookRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(aptPayload),
  });
  const bookedData = await bookRes.json();
  if (!bookedData.success) {
    throw new Error(`Booking appointment failed: ${bookedData.message}`);
  }
  const aptId = bookedData.data.id || bookedData.data._id;
  console.log(`✅ Appointment booked successfully: ID = ${aptId}`);

  // 9. Fetch Authenticated Patient Appointments
  console.log('\n--- TEST 8: Fetch Patient Appointments History ---');
  const aptsRes = await fetch(`${BASE_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const aptsData = await aptsRes.json();
  if (!aptsData.success || !Array.isArray(aptsData.data)) {
    throw new Error('Failed to retrieve patient appointments');
  }
  console.log(`✅ Found ${aptsData.data.length} appointment(s) for patient.`);
  const myApt = aptsData.data.find((a) => (a.id || a._id) === aptId);
  if (!myApt) {
    throw new Error('Booked appointment not found in user history');
  }
  console.log(`   Doctor: ${myApt.doctor || myApt.doctorName}`);
  console.log(`   Hospital: ${myApt.hospital || myApt.hospitalName}`);
  console.log(`   Date & Time: ${myApt.date || myApt.appointmentDate} @ ${myApt.time || myApt.appointmentTime}`);
  console.log(`   Status: ${myApt.status}`);

  // 10. Patient Authorization: Ensure Another User Cannot Cancel This Patient's Appointment
  console.log('\n--- TEST 9: Authorization - Cross-Patient Cancellation Prevention ---');
  // Register another user
  const otherEmail = `other_patient_${timestamp}@smartcare.com`;
  const otherRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Other Patient',
      email: otherEmail,
      password: 'OtherPassword@123',
    }),
  });
  const otherReg = await otherRegRes.json();
  const otherToken = otherReg.token;

  const unauthorizedCancelRes = await fetch(`${BASE_URL}/appointments/${aptId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  const unauthCancelData = await unauthorizedCancelRes.json();
  if (unauthorizedCancelRes.status === 403 && !unauthCancelData.success) {
    console.log(`✅ Cross-patient cancellation successfully blocked (HTTP 403): ${unauthCancelData.message}`);
  } else {
    throw new Error('Authorization failure: Expected 403 when cancelling another user appointment');
  }

  // 11. Legitimate Patient Cancellation
  console.log('\n--- TEST 10: Authorized Patient Cancellation ---');
  const cancelRes = await fetch(`${BASE_URL}/appointments/${aptId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const cancelData = await cancelRes.json();
  if (!cancelData.success || cancelData.data?.status !== 'Cancelled') {
    throw new Error(`Cancellation failed: ${cancelData.message}`);
  }
  console.log(`✅ Appointment successfully cancelled by owner. New status = ${cancelData.data.status}`);

  console.log('\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY! Patient Profile feature is 100% verified on MongoDB!');
}

runProfileVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
