/**
 * verify_all_features.cjs
 * Comprehensive Automated Verification Suite for Smart Healthcare Appointment Platform
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('   SMART HEALTHCARE APPOINTMENT PLATFORM - TEST VERIFICATION    ');
  console.log('================================================================\n');

  const results = [];
  function record(suite, testName, passed, details = '') {
    results.push({ suite, testName, passed, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} [${suite}] ${testName} ${details ? `(${details})` : ''}`);
  }

  try {
    // -------------------------------------------------------------
    // SUITE 1: HEALTH & SYSTEM INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- 1. Health & Database Connectivity ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    record('System', 'Backend Health & MongoDB Connection', 
      healthRes.ok && healthData.databaseName === 'smart_healthcare', 
      `Database: ${healthData.databaseName}, State: ${healthData.connectionState}`);

    // -------------------------------------------------------------
    // SUITE 2: FEATURE A - SMART HOSPITAL FINDER
    // -------------------------------------------------------------
    console.log('\n--- 2. Feature A: Smart Hospital Finder ---');
    const locsRes = await fetch(`${BASE_URL}/locations`);
    const locsJson = await locsRes.json();
    const locations = Array.isArray(locsJson) ? locsJson : (locsJson.data || []);
    const apLocations = ['Guntur', 'Vijayawada', 'Tenali', 'Visakhapatnam', 'Tirupati', 'Nellore', 'Kakinada', 'Rajahmundry', 'Ongole', 'Kurnool', 'Kadapa', 'Anantapur', 'Eluru'];
    const locationNames = locations.map(l => (typeof l === 'string' ? l : l.name));
    const allValidAP = locationNames.every(l => apLocations.includes(l));
    record('Feature A', 'All Locations are Valid Andhra Pradesh Cities', 
      allValidAP && locationNames.length >= 13, 
      `Found ${locationNames.length} AP locations: ${locationNames.slice(0, 5).join(', ')}...`);

    // Fetch hospitals for Visakhapatnam
    const hospRes = await fetch(`${BASE_URL}/hospitals?location=Visakhapatnam`);
    const hospJson = await hospRes.json();
    const hospitals = Array.isArray(hospJson) ? hospJson : (hospJson.data || []);
    const hasRequiredFields = hospitals.length > 0 && hospitals.every(h => h.name && h.address && h.phone);
    record('Feature A', 'Filter Hospitals by Andhra Pradesh Location (Visakhapatnam)', 
      hospitals.length >= 10 && hasRequiredFields, 
      `Found ${hospitals.length} hospitals with address, phone, rating`);

    // Open first hospital details and check doctors and specializations
    const testHosp = hospitals[0];
    const docsRes = await fetch(`${BASE_URL}/doctors?hospital=${encodeURIComponent(testHosp.name)}`);
    const docsJson = await docsRes.json();
    const hospDocs = Array.isArray(docsJson) ? docsJson : (docsJson.data || []);

    const specsRes = await fetch(`${BASE_URL}/doctors/specializations?hospital=${encodeURIComponent(testHosp.name)}`);
    const specsJson = await specsRes.json();
    const hospSpecs = Array.isArray(specsJson) ? specsJson : (specsJson.data || []);

    record('Feature A', 'Hospital Details View: Associated Doctors & Specializations',
      hospDocs.length > 0 && hospSpecs.length > 0,
      `Hospital "${testHosp.name}" has ${hospDocs.length} doctors across ${hospSpecs.length} specializations`);

    // -------------------------------------------------------------
    // SUITE 3: FEATURE B - LIVE DOCTOR AVAILABILITY & CONCURRENCY
    // -------------------------------------------------------------
    console.log('\n--- 3. Feature B: Live Doctor Availability & Concurrency Booking ---');
    const doctorToBook = hospDocs[0];
    const bookingDate = '2026-11-20'; // Future date
    const bookingTime = '11:30 AM';

    // Log in or register test patient 1
    const patientCreds = {
      email: 'concurrency_patient1@smartcare.com',
      password: 'Patient@Password123',
      fullName: 'Concurrency Test Patient 1',
      phone: '9876543210'
    };

    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patientCreds.email, password: patientCreds.password })
    });

    if (!loginRes.ok) {
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientCreds)
      });
      loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patientCreds.email, password: patientCreds.password })
      });
    }
    const patientLoginData = await loginRes.json();
    const patientToken = patientLoginData.token;
    record('Feature B', 'Patient 1 Authenticated for Booking', !!patientToken, `Patient: ${patientCreds.email}`);

    // Register or log in test patient 2
    const patient2Creds = {
      email: 'concurrency_patient2@smartcare.com',
      password: 'Patient2@Password123',
      fullName: 'Concurrency Test Patient 2',
      phone: '9876543211'
    };
    let p2Login = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: patient2Creds.email, password: patient2Creds.password })
    });
    if (!p2Login.ok) {
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient2Creds)
      });
      p2Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patient2Creds.email, password: patient2Creds.password })
      });
    }
    const p2Token = (await p2Login.json()).token;
    record('Feature B', 'Patient 2 Authenticated for Booking', !!p2Token, `Patient: ${patient2Creds.email}`);

    // CONCURRENCY TEST: Both users simultaneously attempt to book the exact same slot
    const appointmentPayload = {
      doctorId: doctorToBook.id || doctorToBook._id,
      hospitalId: doctorToBook.hospitalId,
      locationId: doctorToBook.locationId,
      doctor: doctorToBook.name,
      specialization: doctorToBook.specialization,
      hospital: doctorToBook.hospital,
      location: doctorToBook.location ? `${doctorToBook.location}, AP` : 'Visakhapatnam, AP',
      fee: doctorToBook.fee || '₹600',
      patientName: 'Test Patient',
      patientPhone: '9876543210',
      date: bookingDate,
      time: bookingTime,
      status: 'Confirmed'
    };

    console.log(`Executing concurrent booking race condition for Doctor: "${doctorToBook.name}", Date: ${bookingDate}, Time: ${bookingTime}...`);
    const [raceRes1, raceRes2] = await Promise.all([
      fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
        body: JSON.stringify(appointmentPayload)
      }),
      fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p2Token}` },
        body: JSON.stringify(appointmentPayload)
      })
    ]);

    const res1Body = await raceRes1.json();
    const res2Body = await raceRes2.json();

    const statuses = [raceRes1.status, raceRes2.status].sort();
    const isOneSuccessOneConflict = (statuses[0] === 201 && statuses[1] === 409) || (statuses[0] === 200 && statuses[1] === 409);
    record('Feature B', 'Concurrency Protection: Exactly 1 Success and 1 HTTP 409 Conflict', 
      isOneSuccessOneConflict, 
      `Responses: HTTP ${raceRes1.status} and HTTP ${raceRes2.status}`);

    // Verify 409 body message
    const conflictBody = raceRes1.status === 409 ? res1Body : res2Body;
    const isConflictNotified = conflictBody.message && conflictBody.message.toLowerCase().includes('already booked');
    record('Feature B', 'Conflict Error Response Mentions Slot Availability',
      isConflictNotified,
      `Message: "${conflictBody.message}"`);

    // Retrieve the successful appointment ID
    const successBody = raceRes1.status === 201 ? res1Body : res2Body;
    const createdApt = successBody.appointment || successBody.data || successBody;
    const createdAptId = createdApt._id || createdApt.id;
    const bookingOwnerToken = raceRes1.status === 201 ? patientToken : p2Token;

    // TEST SLOT RELEASE: Cancel the appointment and verify slot can be re-booked
    const cancelRes = await fetch(`${BASE_URL}/appointments/${createdAptId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bookingOwnerToken}` }
    });
    record('Feature B', 'Cancel Active Appointment & Release Slot',
      cancelRes.ok,
      `Status: HTTP ${cancelRes.status}`);

    // Re-book the same slot now that it's cancelled
    const rebookRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
      body: JSON.stringify(appointmentPayload)
    });
    record('Feature B', 'Re-booking Previously Cancelled Slot Allowed',
      rebookRes.status === 201,
      `Status: HTTP ${rebookRes.status} (Slot properly freed by partial unique index)`);

    // Clean up re-booked appointment
    if (rebookRes.ok) {
      const rebooked = await rebookRes.json();
      const rebookedApt = rebooked.data || rebooked.appointment || rebooked;
      const rebookedId = rebookedApt._id || rebookedApt.id;
      if (rebookedId) {
        await fetch(`${BASE_URL}/appointments/${rebookedId}/cancel`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${patientToken}` }
        });
      }
    }

    // -------------------------------------------------------------
    // SUITE 4: FEATURE C - PATIENT DASHBOARD & SECURITY
    // -------------------------------------------------------------
    console.log('\n--- 4. Feature C: Patient Dashboard & Authorization ---');
    // Fetch user appointments
    const myAptsRes = await fetch(`${BASE_URL}/appointments`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const myAptsJson = await myAptsRes.json();
    const aptList = Array.isArray(myAptsJson) ? myAptsJson : (myAptsJson.data || []);
    record('Feature C', 'Fetch Patient Appointments from Authenticated Identity',
      myAptsRes.ok && Array.isArray(aptList),
      `Retrieved ${aptList.length} appointment records for patient`);

    // Update patient profile
    const updateProfRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${patientToken}` },
      body: JSON.stringify({ fullName: 'Updated Patient Name', phone: '9988776655' })
    });
    const updateProfData = await updateProfRes.json();
    record('Feature C', 'Patient Profile Update (Safe Self-Editing)',
      updateProfRes.ok && updateProfData.user.fullName === 'Updated Patient Name',
      `Updated name: "${updateProfData.user.fullName}", phone: "${updateProfData.user.phone}"`);

    // Security: P2 tries to cancel patient 1's appointment
    const unauthCancelRes = await fetch(`${BASE_URL}/appointments/${createdAptId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${p2Token}` }
    });
    record('Feature C', 'Security: Cross-Patient Appointment Tampering Blocked',
      unauthCancelRes.status === 403 || unauthCancelRes.status === 404,
      `Denied with HTTP ${unauthCancelRes.status}`);

    // -------------------------------------------------------------
    // SUITE 5: FEATURE D - ADMIN DASHBOARD & RBAC
    // -------------------------------------------------------------
    console.log('\n--- 5. Feature D: Admin Dashboard & RBAC Security ---');
    // 1. RBAC Guard: Normal patient attempts to access Admin API
    const patientAdminRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    record('Feature D', 'Admin RBAC: Non-Admin Token Forbidden (HTTP 403)',
      patientAdminRes.status === 403,
      `Blocked patient access with HTTP ${patientAdminRes.status}`);

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartcare.com', password: 'Admin@SmartCare2026' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    record('Feature D', 'Admin Authentication Verified',
      adminLoginRes.ok && adminLoginData.user.role === 'admin',
      `Admin: ${adminLoginData.user.email}, Role: ${adminLoginData.user.role}`);

    // 3. Admin Stats Overview
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await adminStatsRes.json();
    const statsObj = statsData.stats || statsData;
    record('Feature D', 'Admin Stats API (Hospitals, Doctors, Appointments, Users)',
      adminStatsRes.ok && statsObj.hospitals > 0 && statsObj.doctors > 0,
      `Hospitals: ${statsObj.hospitals}, Doctors: ${statsObj.doctors}, AP Locations: ${statsObj.locations}, Appointments: ${statsObj.appointments}`);

    // 4. Admin Hospital Management: Add hospital
    const newHospitalPayload = {
      name: `AP Apex Multi-Speciality Test Hospital ${Date.now()}`,
      locationName: 'Vijayawada',
      address: 'Bandar Road, Vijayawada, AP',
      phone: '0866-2489999',
      rating: 4.9,
      specialties: ['Cardiology', 'Neurology', 'Orthopedics']
    };
    const addHospRes = await fetch(`${BASE_URL}/admin/hospitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(newHospitalPayload)
    });
    const addedHospData = await addHospRes.json();
    const addedHosp = addedHospData.data || addedHospData.hospital || addedHospData;
    const addedHospId = addedHosp._id || addedHosp.id;
    record('Feature D', 'Admin Hospital Creation & Location Association',
      addHospRes.ok && !!addedHospId,
      `Created hospital "${newHospitalPayload.name}" in Vijayawada`);

    // Toggle hospital active state
    if (addedHospId) {
      const toggleHospRes = await fetch(`${BASE_URL}/admin/hospitals/${addedHospId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const toggledData = await toggleHospRes.json();
      const toggledHosp = toggledData.data || toggledData.hospital || toggledData;
      record('Feature D', 'Admin Hospital Activation/Deactivation Toggle',
        toggleHospRes.ok && toggledHosp.isActive === false,
        `Hospital isActive: ${toggledHosp.isActive}`);
    }

    // 5. Admin Doctor Management: Add doctor
    const newDoctorPayload = {
      name: `Dr. Suresh Varma (MS, MCh) ${Date.now()}`,
      specialization: 'Neurologist',
      hospitalId: addedHospId || testHosp.id || testHosp._id,
      experience: '16 years',
      fee: '₹750',
      availableDays: 'Mon - Fri'
    };
    const addDocRes = await fetch(`${BASE_URL}/admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(newDoctorPayload)
    });
    const addedDocData = await addDocRes.json();
    const addedDoc = addedDocData.data || addedDocData.doctor || addedDocData;
    const addedDocId = addedDoc._id || addedDoc.id;
    record('Feature D', 'Admin Doctor Creation & Hospital Association',
      addDocRes.ok && !!addedDocId,
      `Created Doctor "${newDoctorPayload.name}" associated with hospital`);

    // 6. Admin Location Validation: Reject non-AP location
    const invalidLocRes = await fetch(`${BASE_URL}/admin/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Mumbai' }) // Non-AP location
    });
    record('Feature D', 'Admin Location Validation: Reject Non-AP Cities',
      invalidLocRes.status === 400,
      `Rejected invalid location "Mumbai" with HTTP ${invalidLocRes.status}`);

    // 7. Admin Appointment Management: View & Update status
    const allAdminAptsRes = await fetch(`${BASE_URL}/admin/appointments`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allAdminApts = await allAdminAptsRes.json();
    const adminAptList = Array.isArray(allAdminApts) ? allAdminApts : (allAdminApts.data || []);
    record('Feature D', 'Admin Appointments List & Inspection',
      allAdminAptsRes.ok && Array.isArray(adminAptList),
      `Retrieved ${adminAptList.length} platform appointments`);

    console.log('\n================================================================');
    console.log('                      TEST SUITE SUMMARY                        ');
    console.log('================================================================');
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;
    console.log(`TOTAL TESTS: ${results.length}`);
    console.log(`PASSED: ${passedCount}`);
    console.log(`FAILED: ${failedCount}`);

    if (failedCount === 0) {
      console.log('\n🌟 ALL AUTOMATED FEATURE & SECURITY TESTS PASSED! 🌟\n');
    } else {
      console.error('\n⚠️ SOME TESTS FAILED. PLEASE REVIEW LOGS. ⚠️\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during test execution:', error);
    process.exit(1);
  }
}

runTests();
